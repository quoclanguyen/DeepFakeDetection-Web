import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";
import { authServices } from "../api/services/authServices";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const validatePassword = (pwd) => {
        const lengthCheck = pwd.length >= 8 && pwd.length <= 32;
        const uppercaseCheck = /[A-Z]/.test(pwd);
        const numberCheck = /[0-9]/.test(pwd);
        const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        return lengthCheck && uppercaseCheck && numberCheck && specialCharCheck;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

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
            const data = await authServices.register(email, password);
            localStorage.setItem("jwt_token", data.jwt_token);
            navigate("/detect");
        } catch (error) {
            const errMsg = error?.response?.data?.detail || "Registration failed. Try again.";
            setErrorMessage(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
                <div className="bg-gray-900 rounded-lg shadow-xl m-6 w-full max-w-sm">
                    <h2 className="text-3xl font-extrabold text-center text-gray-200 mb-6 py-2">Register for DFR</h2>
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 px-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mx-5 max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 px-2">
                                Password
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
                                Confirm Password
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
                            className="px-12 from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg font-semibold transition duration-200 mx-auto block"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>

                    <p className="text-sm text-gray-400 mt-4 text-center py-2">
                        Already have an account?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Register;
