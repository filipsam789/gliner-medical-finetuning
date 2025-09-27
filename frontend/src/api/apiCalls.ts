import axios from "axios";
import { EntityResult, RepresentationResults, RequestFormData } from "@/types";
import { API_URL } from "@/utils/constants";

interface ErrorDetail {
  msg?: string;
  [key: string]: unknown;
}

export interface User {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  id: string;
  roles: string[];
}

interface ContentResponse {
  message: string;
  content: string;
  user: string;
  features: string[];
}

class ApiError extends Error {}
class ServerError extends ApiError {}
class NetworkError extends ApiError {}
class UnauthorizedError extends ApiError {}
class AccessDeniedError extends ApiError {}

const parseDetailMessage = (detail: unknown): string => {
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === "string" ? d : (d as ErrorDetail)?.msg ?? JSON.stringify(d)))
      .join("; ");
  }
  return String(detail || "Unknown error");
};

const handleAxiosError = (error: unknown, contextMsg: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const detail = error.response.data?.detail;
      const detailMessage = parseDetailMessage(detail);
      const status = error.response.status;

      if (status === 401) {
        throw new UnauthorizedError(`${contextMsg}: Unauthorized - ${detailMessage}`);
      }
      if (status === 403) {
        throw new AccessDeniedError(`${contextMsg}: Access denied - ${detailMessage}`);
      }
      throw new ServerError(`${contextMsg}: Server error ${status} - ${detailMessage}`);
    } else if (error.request) {
      throw new NetworkError(`${contextMsg}: Network error - Unable to connect to server.`);
    }
  }
  throw new ApiError(`${contextMsg}: An unexpected error occurred. Please try again.`);
};

export const analyzeEntities = async (formData: RequestFormData): Promise<RepresentationResults> => {
  try {
    const entities = await axios.post<EntityResult[]>(`${API_URL}/predict_entities`, formData);

    return {
      text: formData.text,
      entities: entities.data,
    };
  } catch (error) {
    handleAxiosError(error, "Error analyzing entities");
  }
};

export const getUser = async (token: string): Promise<User> => {
  try {
    const response = await axios.get<User>(`${API_URL}/get_user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching user details");
  }
};

export const subscribeUser = async (token: string): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}/subscribe`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    handleAxiosError(error, "Error subscribing user");
  }
};

export const getPremiumContent = async (token: string): Promise<ContentResponse> => {
  try {
    const response = await axios.get<ContentResponse>(`${API_URL}/premium-content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching premium content");
  }
};

export const getRegularContent = async (token: string): Promise<ContentResponse> => {
  try {
    const response = await axios.get<ContentResponse>(`${API_URL}/regular-content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching regular content");
  }
};
