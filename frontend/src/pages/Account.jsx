import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";

const Account = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setEmail(payload.email || "");
            } catch (err) {
                console.error("Invalid JWT", err);
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        navigate("/login");
    };

    const handleChangePassword = () => {
        navigate("/login");
    };

    const handleViewGallery = () => {
        navigate("/gallery");
    };

    return (
        <HomeLayout>
            <div className="flex items-start justify-center min-h-screen bg-gray-300 px-6 pt-24">
                <div className="bg-gray-100 p-6 rounded-xl shadow-lg w-full max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Account Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-lg text-gray-800 mt-1">Email</label>
                            <p className="text-sm text-gray-600">{email}</p>
                        </div>

                        <div>
                            <label className="text-lg text-gray-800 mt-1">Token</label>
                            <p className="text-sm text-gray-600">1</p>
                        </div>
                        <div>
                            <label
                                onClick={handleChangePassword}
                                className="text-lg text-gray-800 mt-1 hover:text-blue-400 cursor-pointer"
                            >
                                Change password
                            </label>
                        </div>
                        <div>
                            <label
                                onClick={handleViewGallery}
                                className="text-lg text-gray-800 mt-1 hover:text-blue-400 cursor-pointer"
                            >
                                View gallery
                            </label>
                        </div>
                    </div>
                    <div className="flex items-end justify-end">
                        <Button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Account;
