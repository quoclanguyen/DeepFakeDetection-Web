import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";
import { authServices } from "../api/services/authServices";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await authServices.login(email, password);
            console.log(data);
            if (data.status_code != 200) {
                const errMsg = data.message;
                setErrorMessage(errMsg);
                return;
            }

            localStorage.setItem("jwt_token", data.jwt_token);
            navigate("/detect");
        } catch (error) {
            const errMsg = error?.response?.data?.detail || "Login failed. Try again.";
            setErrorMessage(errMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
                <div className="bg-gray-900 rounded-lg shadow-xl m-6 w-full max-w-sm">
                    <h2 className="text-3xl font-extrabold text-center text-gray-200 mb-6 py-2">Login to DFR</h2>
                    <form onSubmit={handleLogin} className="space-y-5">
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

                        <Button
                            type="submit"
                            className="px-12 from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition duration-200 mx-auto block"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <p className="text-sm text-gray-400 mt-4 text-center py-2">
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Register here
                        </a>
                    </p>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Login;
