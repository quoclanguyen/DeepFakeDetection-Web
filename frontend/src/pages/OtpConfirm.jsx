import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import Button from "../components/ui/Button";
import { authServices } from "../api/services/authServices";
import Loader from "../components/animation/Loader";

const OtpConfirm = () => {
    const [otpValues, setOtpValues] = useState(Array(6).fill(""));
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [timeLeft, setTimeLeft] = useState(300); // 60 seconds
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const confirmType = location.state?.confirm_type;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (e, index) => {
        const value = e.target.value;

        if (!/^[0-9]?$/.test(value)) return;

        // Prevent entering if any previous box is empty
        const allPreviousFilled = otpValues.slice(0, index).every((v) => v !== "");
        if (index > 0 && !allPreviousFilled) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("Text").trim();
        if (!/^\d{6}$/.test(pasteData)) return;

        const newOtpValues = pasteData.split("");
        setOtpValues(newOtpValues);
        newOtpValues.forEach((digit, i) => {
            inputRefs.current[i].value = digit;
        });
        inputRefs.current[5]?.focus();
        e.preventDefault();
    };

    const handleConfirmOtp = async (e) => {
        e.preventDefault();

        const otp = otpValues.join("");
        console.log(confirmType);
        if (otp.length < 6) {
            setErrorMessage("Please enter all 6 digits.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        if (confirmType === 0) {
            try {
                // const data = await authServices.confirmRegister(email, otp);
                // if (data?.jwt_token) {
                //     localStorage.setItem("jwt_token", data.jwt_token);
                //     navigate("/detect");
                // } else {
                //     setErrorMessage("Invalid OTP. Please try again.");
                // }

                const data = await authServices.confirmRegister(email, otp, confirmType);
                console.log(data)
                if (data.status_code != 200) {
                    const errMsg = data.message;
                    setErrorMessage(errMsg);
                    return;
                }
                localStorage.setItem("jwt_token", data.jwt_token);
                navigate("/detect");
            } catch (error) {
                const errMsg = error?.response?.data?.detail || "OTP confirmation failed.";
                setErrorMessage(errMsg);
            } finally {
                setLoading(false);
            }
        } else if (confirmType === 1) {
            try {
                const data = await authServices.confirmChangePassword(email, otp, confirmType);
                console.log(data)
                if (data.status_code != 200) {
                    const errMsg = data.message;
                    setErrorMessage(errMsg);
                    return;
                }
                localStorage.setItem("access_token", data.access_token);
                navigate("/reset_password", { state: { email } });
            } catch (error) {
                const errMsg = error?.response?.data?.detail || "OTP confirmation failed.";
                setErrorMessage(errMsg);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
                <div className="bg-gray-900 rounded-lg shadow-xl m-6 w-full max-w-sm p-6">
                    <h2 className="text-2xl font-bold text-center text-gray-200 mb-6">Enter OTP</h2>
                    <form onSubmit={handleConfirmOtp}>
                        <div className="flex justify-center space-x-2 mb-4" onPaste={handlePaste}>
                            {otpValues.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-10 h-12 text-xl text-center rounded-md border border-gray-500 focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                                    readOnly={index !== 0 && otpValues[0] === ""}
                                />
                            ))}
                        </div>

                        {errorMessage && (
                            <p className="text-red-400 text-sm text-center mb-2">{errorMessage}</p>
                        )}

                        <p className="text-gray-400 text-sm text-center mb-4">
                            {timeLeft > 0 ? `Expires in ${timeLeft}s` : "OTP expired"}
                        </p>

                        <Button
                            type="submit"
                            className="px-10 from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg font-semibold transition duration-200 mx-auto block"
                            disabled={loading || timeLeft === 0}
                        >
                            {loading ? "Verifying..." : "Confirm OTP"}
                        </Button>
                    </form>
                    {loading && <Loader message="Verifying..." />}
                </div>
            </div>
        </HomeLayout>
    );
};

export default OtpConfirm;
