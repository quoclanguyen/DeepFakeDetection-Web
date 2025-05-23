import axiosClient from "../../config/axiosClient";
import { MediaEndpoint } from "../endpoints/media";
import { _Image } from "../../interfaces";

export const mediaServices = {
    uploadImage: async (file: File): Promise<_Image> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosClient.post(MediaEndpoint.uploadImage.url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
        });

        return response.data;
    },
    getAllImages: async (): Promise<{ q_ids: string[] }> => {
        const response = await axiosClient.get(MediaEndpoint.getAllImage.url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        return response.data;
    },
    getImage: async (imageId: string): Promise<{ image_data: string; metadata: any }> => {
        const endpoint = MediaEndpoint.getImage(imageId);
        const response = await axiosClient.get(endpoint.url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        return response.data;
    },
    deleteImage: async (imageId: string): Promise<{message: string}> => {
        const endpoint = MediaEndpoint.deleteImage(imageId);
        const response = await axiosClient.delete(endpoint.url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        return response.data;
    },
    detectImage: async (imageId: string, modelName: string): Promise<{message: string}> => {
        const endpoint = MediaEndpoint.detectImage(imageId, modelName);
        const response = await axiosClient.post(endpoint.url, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            }
        })
        return response.data;
    },
    detectVideo: async (file: File, modelName: string): Promise<{message: string}> => {
        const formData = new FormData();
        formData.append("file", file);
        const endpoint = MediaEndpoint.detectVideo(modelName);
        const response = await axiosClient.post(endpoint.url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
        });
        return response.data;
    }
};
