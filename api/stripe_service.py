import stripe
import os
from typing import Dict, Any

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PREMIUM_PRICE_ID = os.getenv("STRIPE_PREMIUM_PRICE_ID", "price_1234567890")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_1234567890")

class StripeService:
    @staticmethod
    def create_checkout_session(user_id: str, user_email: str) -> Dict[str, Any]:
        """Create a Stripe checkout session for premium subscription."""
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': STRIPE_PREMIUM_PRICE_ID,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=os.getenv("FRONTEND_URL", "http://localhost:8080") + "/subscription-success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=os.getenv("FRONTEND_URL", "http://localhost:8080") + "/subscriptions",
                customer_email=user_email,
                metadata={
                    'user_id': user_id,
                    'subscription_type': 'premium'
                }
            )
            return {
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id
            }
        except Exception as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    @staticmethod
    def retrieve_checkout_session(session_id: str) -> Dict[str, Any]:
        """Retrieve a Stripe checkout session."""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return {
                "id": session.id,
                "payment_status": session.payment_status,
                "customer_email": session.customer_email,
                "metadata": session.metadata,
                "subscription_id": session.subscription
            }
        except Exception as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    @staticmethod
    def create_customer_portal_session(customer_id: str) -> Dict[str, Any]:
        """Create a customer portal session for subscription management."""
        try:
            portal_session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=os.getenv("FRONTEND_URL", "http://localhost:8080") + "/subscriptions",
            )
            return {
                "portal_url": portal_session.url
            }
        except Exception as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, signature: str) -> stripe.Event:
        """Verify webhook signature and return the event."""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            raise Exception(f"Invalid payload: {str(e)}")
        except Exception as e:
            raise Exception(f"Invalid signature: {str(e)}")
