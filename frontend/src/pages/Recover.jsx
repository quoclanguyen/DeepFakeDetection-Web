import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";
import { authServices } from "../api/services/authServices";
import Loader from "../components/animation/Loader";

const Recover = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const confirm_type = 1;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await authServices.recover(email);
            console.log(data);
            if (data.status_code != 200) {
                const errMsg = data.message;
                setErrorMessage(errMsg);
                return;
            }
            navigate("/forgot_password/confirm", { state: { email, confirm_type } });
        } catch (error) {
            console.log(error)
            const errMsg = error?.response?.data?.detail || "Something went wrong. Try again.";
            setErrorMessage(errMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
                <div className="bg-gray-900 rounded-lg shadow-xl m-4 w-full max-w-sm">
                    <h2 className="text-3xl font-extrabold text-center text-gray-200 mb-6 py-2">Send recovery mail</h2>
                    <form onSubmit={handleSendOtp} className="space-y-5 m-2">
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


                        <Button
                            type="submit"
                            className="px-12 from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition duration-200 mx-auto block"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send"}
                        </Button>
                        {errorMessage && (
                            <div className="text-center text-red-500 text-sm mt-2 px-4">
                                {errorMessage}
                            </div>
                        )}
                    </form>
                        {loading && <Loader message="Sending OTP..."/>}
                </div>
            </div>
        </HomeLayout>
    );
};

export default Recover;
