import { api } from "../lib/axios";

export type UploadScene =
  | "article-cover"
  | "article-image"
  | "video-cover"
  | "video-source";

export interface UploadCredentialsRequest {
  scene: UploadScene;
  file_ext: string;
  file_size: number;
  file_name: string;
}

export interface UploadFormData {
  host: string;
  policy: string;
  signature: string;
  "x-oss-security-token": string;
  "x-oss-signature-version": string;
  "x-oss-credential": string;
  "x-oss-date": string;
  key: string;
}

export interface UploadCredentialsResponse {
  object_key: string;
  url: string;
  form_data: UploadFormData;
  expired_at: number;
}

export const uploadApi = {
  getUploadCredentials: async (
    params: UploadCredentialsRequest,
  ): Promise<UploadCredentialsResponse> => {
    return api.post("/content/upload-credentials", params);
  },
};
