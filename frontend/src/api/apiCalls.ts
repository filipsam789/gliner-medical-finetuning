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

export interface Experiment {
  id: number;
  name: string;
  image_url: string;
}

export interface ExperimentRun {
  id: number;
  date_ran: string;
  model: string;
  threshold?: number | null;
  labels_to_extract: string;
  allow_multilabeling: boolean;
}

class ApiError extends Error {}
class ServerError extends ApiError {}
class NetworkError extends ApiError {}
class UnauthorizedError extends ApiError {}
class AccessDeniedError extends ApiError {}

const parseDetailMessage = (detail: unknown): string => {
  if (Array.isArray(detail)) {
    return detail
      .map((d) =>
        typeof d === "string" ? d : (d as ErrorDetail)?.msg ?? JSON.stringify(d)
      )
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
        throw new UnauthorizedError(
          `${contextMsg}: Unauthorized - ${detailMessage}`
        );
      }
      if (status === 403) {
        throw new AccessDeniedError(
          `${contextMsg}: Access denied - ${detailMessage}`
        );
      }
      throw new ServerError(
        `${contextMsg}: Server error ${status} - ${detailMessage}`
      );
    } else if (error.request) {
      throw new NetworkError(
        `${contextMsg}: Network error - Unable to connect to server.`
      );
    }
  }
  throw new ApiError(
    `${contextMsg}: An unexpected error occurred. Please try again.`
  );
};

export const analyzeEntities = async (
  formData: RequestFormData,
  token: string
): Promise<RepresentationResults> => {
  try {
    const entities = await axios.post<EntityResult[]>(
      `${API_URL}/predict_entities`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

export const getPremiumContent = async (
  token: string
): Promise<ContentResponse> => {
  try {
    const response = await axios.get<ContentResponse>(
      `${API_URL}/premium-content`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching premium content");
  }
};

export const getRegularContent = async (
  token: string
): Promise<ContentResponse> => {
  try {
    const response = await axios.get<ContentResponse>(
      `${API_URL}/regular-content`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching regular content");
  }
};

export const getExperimentDetails = async (
  token: string,
  experimentId: string
) => {
  try {
    const response = await axios.get(
      `${API_URL}/experiments/${experimentId}/documents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching experiment details");
    throw error;
  }
};

export const addDocument = async (
  token: string,
  experimentId: string,
  title: string,
  text: string,
  imageUrl?: string
) => {
  try {
    const response = await axios.post(
      `${API_URL}/experiments/${experimentId}/documents`,
      { title, text, image_url: imageUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error adding document");
    throw error;
  }
};

export const getExperimentRuns = async (
  token: string,
  experimentId: string
): Promise<ExperimentRun[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/experiments/${experimentId}/runs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching experiment run history");
    return [];
  }
};

export const addExperimentRun = async (
  token: string,
  experimentId: string,
  runData: {
    model: string;
    labels_to_extract: string;
    allow_multilabeling: boolean;
    threshold: number;
  }
) => {
  try {
    const response = await axios.post(
      `${API_URL}/experiments/${experimentId}/runs`,
      runData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error running experiment");
    throw error;
  }
};

export const getDocumentDetails = async (token: string, documentId: string) => {
  try {
    const response = await axios.get(`${API_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching document details");
    throw error;
  }
};
export const deleteDocument = async (token: string, documentId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting document");
    throw error;
  }
};

export const getExperiments = async (token: string): Promise<Experiment[]> => {
  try {
    const response = await axios.get<Experiment[]>(`${API_URL}/experiments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching experiments");
    return [];
  }
};

export const createExperiment = async (
  token: string,
  name: string,
  imageUrl?: string
): Promise<Experiment> => {
  try {
    const response = await axios.post<Experiment>(
      `${API_URL}/experiments`,
      { name, image_url: imageUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating experiment");
    throw error;
  }
};

export const getUsageStatus = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/usage-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching usage status");
    throw error;
  }
};

export const deleteExperiment = async (
  token: string,
  experimentId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(
      `${API_URL}/experiments/${experimentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting experiment");
    throw error;
  }
};

export const getExperimentRunResults = async (token: string, runId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/experiment-runs/${runId}/results`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching experiment run results");
    throw error;
  }
};

export const createCheckoutSession = async (token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/create-checkout-session`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating checkout session");
    throw error;
  }
};

export const getCheckoutSession = async (token: string, sessionId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/checkout-session/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching checkout session");
    throw error;
  }
};

export const getSubscriptionStatus = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/subscription-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching subscription status");
    throw error;
  }
};

export const createPortalSession = async (token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/create-portal-session`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating portal session");
    throw error;
  }
};
