import axiosClient from "../../config/axiosClient";
import { MediaEndpoint } from "../endpoints/media";
import { _Image } from "../../interfaces";

export const mediaServices = {
    uploadImage: async (file: File): Promise<_Image> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosClient.post(MediaEndpoint.uploadImage.url, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // OPTIONAL, Axios handles it automatically
            },
        });

        return {
            id: response.data.ids[0], // Taking the first ID
            fileName: response.data.filename,
        };
    }
};
