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
    recover: async (email: string) => {
        const response = await axiosClient.post(AuthEndpoint.recover.url, {
            email
        });

        return response.data;
    },
    confirmRegister: async (email: string, otp: string, confirm_type = 0) => {
        const response = await axiosClient.post(AuthEndpoint.confirmOtp.url, {
            email,
            otp,
            confirm_type
        });

        return response.data;
    },
    confirmChangePassword: async (email: string, otp: string, confirm_type = 1) => {
        const response = await axiosClient.post(AuthEndpoint.confirmOtp.url, {
            email,
            otp,
            confirm_type
        });

        return response.data;
    },
    changePassword: async (email: string, new_password: string, access_token: string) => {
        const response = await axiosClient.post(AuthEndpoint.changePassword.url, {
            email,
            new_password,
            access_token
        });

        return response.data;
    }
};
