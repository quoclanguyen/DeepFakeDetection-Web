import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:2000/app/v1/",
    timeout: 10 * 60 * 1000,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
})

export default axiosClient;
