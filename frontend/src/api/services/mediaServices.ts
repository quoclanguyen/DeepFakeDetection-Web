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
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
            },
        });

        return {
            id: response.data.ids[0], // Taking the first ID
            fileName: response.data.filename,
        };
    },
    getAllImages: async (): Promise<{ q_ids: string[] }> => {
        const response = await axiosClient.get(MediaEndpoint.getAllImage.url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
            },
        });
        return response.data;
    },

    getImage: async (imageId: string): Promise<{ image_data: string; metadata: any }> => {
        const endpoint = MediaEndpoint.getImage(imageId);
        const response = await axiosClient.get(endpoint.url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
            },
        });
        return response.data;
    }
};
