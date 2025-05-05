import { useState } from "react";
import { useNavigate, useLocation, redirect } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";
import { authServices } from "../api/services/authServices";
import Loader from "../components/animation/Loader";
import axiosClient from "../config/axiosClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [old_password, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const reset = localStorage.getItem("jwt_token") === null ? true : false;

    const validatePassword = (pwd) => {
        const lengthCheck = pwd.length >= 8 && pwd.length <= 32;
        const uppercaseCheck = /[A-Z]/.test(pwd);
        const numberCheck = /[0-9]/.test(pwd);
        const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        return lengthCheck && uppercaseCheck && numberCheck && specialCharCheck;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        console.log(reset);
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage(
                "Password must be 8-32 characters, include at least one uppercase letter, one number, and one special character."
            );
            setLoading(false);
            return;
        }

        try {
            const reset = localStorage.getItem("jwt_token") === null ? true : false;
            const email = location.state?.email;
            if (!reset) {
                try {
                    const res = await authServices.login(email, old_password);
                    console.log(res);
                    if (res.status_code != 200) {
                        const errMsg = "Old password not match";
                        setErrorMessage(errMsg);
                        return;
                    }
                } catch (error) {
                    console.log(error)
                    const errMsg = error?.response?.data?.detail || "Change password failed. Try again.";
                    setErrorMessage(errMsg);
                    return;
                }
            }
            const access_token = localStorage.getItem("access_token");
            const data = await authServices.changePassword(email, password, access_token);

            console.log(data)
            if (data.status_code != 200) {
                const errMsg = data.message;
                setErrorMessage(errMsg);
                return;
            }
            if (reset) {
                localStorage.setItem("jwt_token", data.jwt_token);
                navigate("/detect");
                return;
            }
            toast.success("Change password successful!",);
            setTimeout(() => {
                navigate("/account")
            }, 2000)
        } catch (error) {
            const errMsg = error?.response?.data?.detail || "Change password failed. Try again.";
            setErrorMessage(errMsg);
            console.log(errMsg)
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeLayout>
            <ToastContainer position="top-center" autoClose={1500} />
            <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
                <div className="bg-gray-900 rounded-lg shadow-xl m-6 w-full max-w-sm">
                    <h2 className="text-3xl font-extrabold text-center text-gray-200 mb-6 py-2">{reset ? "Reset password" : "Change password"}</h2>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        {
                            reset ?
                                <></> : <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 px-2">
                                        Enter old password
                                    </label>
                                    <input
                                        type="password"
                                        id="old_password"
                                        value={old_password}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full mx-5 max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                        }

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 px-2">
                                Enter new password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mx-5 max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1 px-2">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full mx-5 max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {errorMessage && (
                            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
                        )}

                        <Button
                            type="submit"
                            className="px-12 m-2 from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg font-semibold transition duration-200 mx-auto block"
                            disabled={loading}
                        >
                            {loading ? "Changing..." : "Change password"}
                        </Button>

                    </form>
                    {loading && <Loader message="Changing..." />}
                </div>
            </div>
        </HomeLayout>
    );
};

export default ChangePassword;
