from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text
from experiments import SessionLocal, Base
from utils import premium_user_required, get_user_from_token
from stripe_service import StripeService
from datetime import datetime, timedelta
import json

SUBSCRIPTIONS_TABLE_NAME = "subscriptions"

class Subscription(Base):
    __tablename__ = SUBSCRIPTIONS_TABLE_NAME
    __table_args__ = {"schema": "experiments"}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, unique=True)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    status = Column(String, nullable=False)  # active, canceled, past_due, etc.
    current_period_start = Column(TIMESTAMP, nullable=True)
    current_period_end = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

Base.metadata.create_all(bind=SessionLocal.kw['bind'])

router = APIRouter()

@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    """Create a Stripe checkout session for premium subscription."""
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        user_email = user_details["email"]
        
        session = SessionLocal()
        existing_subscription = session.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active"
        ).first()
        session.close()
        
        if existing_subscription:
            raise HTTPException(
                status_code=400, 
                detail="User already has an active subscription"
            )
        
        stripe_service = StripeService()
        checkout_data = stripe_service.create_checkout_session(user_id, user_email)
        
        return {
            "checkout_url": checkout_data["checkout_url"],
            "session_id": checkout_data["session_id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@router.get("/checkout-session/{session_id}")
async def get_checkout_session(session_id: str, request: Request):
    """Get checkout session details."""
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        
        stripe_service = StripeService()
        session_data = stripe_service.retrieve_checkout_session(session_id)
        
        if session_data["metadata"]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return session_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve checkout session: {str(e)}")

@router.get("/subscription-status")
async def get_subscription_status(request: Request):
    """Get user's subscription status."""
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        
        session = SessionLocal()
        subscription = session.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        session.close()
        
        if not subscription:
            return {
                "has_subscription": False,
                "status": None,
                "is_premium": False
            }
        
        return {
            "has_subscription": True,
            "status": subscription.status,
            "is_premium": subscription.status == "active",
            "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get subscription status: {str(e)}")

@router.post("/create-portal-session")
async def create_portal_session(request: Request):
    """Create a customer portal session for subscription management."""
    try:
        user_details = get_user_from_token(request)
        user_id = user_details["id"]
        
        session = SessionLocal()
        subscription = session.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.stripe_customer_id.isnot(None)
        ).first()
        session.close()
        
        if not subscription:
            raise HTTPException(
                status_code=404, 
                detail="No subscription found for user"
            )
        
        stripe_service = StripeService()
        portal_data = stripe_service.create_customer_portal_session(subscription.stripe_customer_id)
        
        return {
            "portal_url": portal_data["portal_url"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create portal session: {str(e)}")

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks for subscription events."""
    try:
        payload = await request.body()
        signature = request.headers.get("stripe-signature")
        print(f"Webhook received: {request.headers.get('stripe-signature', 'No signature')}")

        if not signature:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        stripe_service = StripeService()
        event = stripe_service.verify_webhook_signature(payload, signature)

        print(f"Event type: {event['type']}")

        if event["type"] == "checkout.session.completed":
            await handle_checkout_session_completed(event["data"]["object"])
        elif event["type"] == "customer.subscription.updated":
            await handle_subscription_updated(event["data"]["object"])
        elif event["type"] == "customer.subscription.deleted":
            await handle_subscription_deleted(event["data"]["object"])
        elif event["type"] == "invoice.payment_succeeded":
            await handle_payment_succeeded(event["data"]["object"])
        elif event["type"] == "invoice.payment_failed":
            await handle_payment_failed(event["data"]["object"])
        
        return {"status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")

async def handle_checkout_session_completed(session_data):
    """Handle successful checkout session completed."""
    try:
        print("Checking out session completed.")
        user_id = session_data["metadata"]["user_id"]
        subscription_id = session_data["subscription"]
        
        import stripe
        subscription = stripe.Subscription.retrieve(subscription_id)

        db_session = SessionLocal()
        try:
            existing_subscription = db_session.query(Subscription).filter(
                Subscription.user_id == user_id
            ).first()
            
            if existing_subscription:
                existing_subscription.stripe_customer_id = session_data["customer"]
                existing_subscription.stripe_subscription_id = subscription_id
                existing_subscription.status = subscription.get('status', 'unknown')
                existing_subscription.current_period_start = datetime.fromtimestamp(subscription["items"]["data"][-1]["current_period_start"])
                existing_subscription.current_period_end = datetime.fromtimestamp(subscription["items"]["data"][-1]["current_period_end"])
                existing_subscription.updated_at = datetime.utcnow()
            else:
                new_subscription = Subscription(
                    user_id=user_id,
                    stripe_customer_id=session_data["customer"],
                    stripe_subscription_id=subscription_id,
                    status=subscription.get('status', 'unknown'),
                    current_period_start=datetime.fromtimestamp(subscription["items"]["data"][-1]["current_period_start"]),
                    current_period_end=datetime.fromtimestamp(subscription["items"]["data"][-1]["current_period_end"])
                )
                db_session.add(new_subscription)
            
            db_session.commit()
            print(f"Subscription record created/updated for user {user_id}")
            
        except Exception as db_error:
            db_session.rollback()
            print(f"Database error: {db_error}")
            raise
        finally:
            db_session.close()
        
        try:
            from utils import assign_role_to_user
            result = assign_role_to_user(user_id, "premium_user")
            print(f"Role assignment result: {result}")
        except Exception as role_error:
            print(f"Role assignment error: {role_error}")
            
        
    except Exception as e:
        print(f"Error handling checkout session completed: {e}")
        raise

async def handle_subscription_updated(subscription_data):
    """Handle subscription updates."""
    try:
        print("Updating subscription.")
        subscription_id = subscription_data["id"]
        
        db_session = SessionLocal()
        subscription = db_session.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = subscription_data["status"]
            subscription.current_period_start = datetime.fromtimestamp(subscription_data["items"]["data"][-1]["current_period_start"])
            subscription.current_period_end = datetime.fromtimestamp(subscription_data["items"]["data"][-1]["current_period_end"])
            subscription.updated_at = datetime.utcnow()
            db_session.commit()
        
        db_session.close()
        
    except Exception as e:
        print(f"Error handling subscription updated: {e}")

async def handle_subscription_deleted(subscription_data):
    """Handle subscription cancellation."""
    try:
        print("Deleting subscription.")
        subscription_id = subscription_data["id"]
        
        db_session = SessionLocal()
        subscription = db_session.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = "canceled"
            subscription.updated_at = datetime.utcnow()
            db_session.commit()
            
            from utils import remove_role_from_user
            remove_role_from_user(subscription.user_id, "premium_user")
            print(f"Premium role removed from user {subscription.user_id}")
        
        db_session.close()
        
    except Exception as e:
        print(f"Error handling subscription deleted: {e}")

async def handle_payment_succeeded(invoice_data):
    """Handle successful payment."""
    try:
        print("Payment succeeded.")
        subscription_id = invoice_data["parent"]["subscription_details"]["subscription"]
        
        db_session = SessionLocal()
        subscription = db_session.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = "active"
            subscription.updated_at = datetime.utcnow()
            db_session.commit()
        
        db_session.close()
        
    except Exception as e:
        print(f"Error handling payment succeeded: {e}")

async def handle_payment_failed(invoice_data):
    """Handle failed payment."""
    try:
        subscription_id = invoice_data["subscription"]
        
        db_session = SessionLocal()
        subscription = db_session.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = "past_due"
            subscription.updated_at = datetime.utcnow()
            db_session.commit()
        
        db_session.close()
        
    except Exception as e:
        print(f"Error handling payment failed: {e}")
