import axiosClient from "../../config/axiosClient";
import { AuthEndpoint } from "../endpoints/auth";

export const authServices = {
    login: async (email: string, password: string) => {
        const response = await axiosClient.post(AuthEndpoint.login.url, {
            email,
            password
        });

        return response.data;
    }, 
    register: async (email: string, password: string) => {
        const response = await axiosClient.post(AuthEndpoint.register.url, {
            email,
            password
        });

        return response.data;
    },
    confirmRegister: async (email: string, otp: string) => {
        const response = await axiosClient.post(AuthEndpoint.confirmRegister.url, {
            email,
            otp
        });

        return response.data;
    }
};
