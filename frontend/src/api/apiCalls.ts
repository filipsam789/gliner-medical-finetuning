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

export const analyzeEntities = async (
  formData: RequestFormData
): Promise<RepresentationResults> => {
  try {
    const entities = await axios.post<EntityResult[]>(
      `${API_URL}/predict_entities`,
      formData
    );

    const results: RepresentationResults = {
      text: formData.text,
      entities: entities.data,
    };

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const detail = error.response.data?.detail;

        let detailMessage: string;
        if (Array.isArray(detail)) {
          detailMessage = detail
            .map((d: ErrorDetail | string) =>
              typeof d === "string" ? d : d.msg ?? JSON.stringify(d)
            )
            .join("; ");
        } else {
          detailMessage = String(detail || "Unknown error");
        }

        throw new Error(
          `Server error: ${error.response.status} - ${detailMessage}`
        );
      } else if (error.request) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      }
    }

    throw new Error(
      "An unexpected error occurred while analyzing entities. Please try again."
    );
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
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const detail = error.response.data?.detail;
        const detailMessage =
          typeof detail === "string" ? detail : "Unknown error";

        if (error.response.status === 401) {
          throw new Error("Unauthorized: " + detailMessage);
        }

        throw new Error(
          `Server error: ${error.response.status} - ${detailMessage}`
        );
      } else if (error.request) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      }
    }

    throw new Error(
      "An unexpected error occurred while fetching user details. Please try again."
    );
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
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const detail = error.response.data?.detail;
        const detailMessage =
          typeof detail === "string" ? detail : "Unknown error";

        if (error.response.status === 401) {
          throw new Error("Unauthorized: " + detailMessage);
        }

        throw new Error(
          `Server error: ${error.response.status} - ${detailMessage}`
        );
      } else if (error.request) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      }
    }

    throw new Error(
      "An unexpected error occurred while fetching user details. Please try again."
    );
  }
};
