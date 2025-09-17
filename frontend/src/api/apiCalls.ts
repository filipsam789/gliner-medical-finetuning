import axios from "axios";
import { EntityResult, RepresentationResults, RequestFormData } from "@/types";
import { API_URL } from "@/utils/constants";

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
        throw new Error(
          `Server error: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
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
