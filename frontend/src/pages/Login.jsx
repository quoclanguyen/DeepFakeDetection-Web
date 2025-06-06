import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";
import { authServices } from "../api/services/authServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/animation/Loader";

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
            toast.success("Login successfully!",);

            localStorage.setItem("jwt_token", data.jwt_token);
            localStorage.setItem("access_token", data.access_token);
            setTimeout(() => {
                navigate("/detect")
            }, 800)
        } catch (error) {
            const errMsg = error?.response?.data?.detail || "Login failed. Try again.";
            setErrorMessage(errMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <HomeLayout>
            <ToastContainer position="top-center" autoClose={1500} />
            <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
                <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-sm">
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
                                className="w-full flex justify-center border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full flex justify-center border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {errorMessage && (
                            <div className="text-center text-red-500 text-sm mt-2 px-4">
                                {errorMessage}
                            </div>
                        )}
                    </form>

                    <nav className="text-sm text-gray-400 mt-1 text-right flex w-full justify-between">
                        <a href="/recover" className="text-blue-600 hover:underline">
                            Forgot password? Click here
                        </a>
                        <a href="/register" className="text-blue-600 hover:underline">
                            Register here
                        </a>
                    </nav>
                    {loading && <Loader message="Authenticating..." />}
                </div>
            </div>
        </HomeLayout>
    );
};

export default Login;
