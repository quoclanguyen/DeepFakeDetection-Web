import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      navigate("/detect");
    } else {
      navigate("/login");
    }
  };

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to DeepFake Recognizer</h1>
        <p className="text-lg text-gray-300 mb-6">
          Upload a video or image to check for deepfakes.
        </p>
        <button
          onClick={handleGetStarted}
          className="px-6 py-3 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-600 transition"
        >
          Get Started
        </button>
      </div>
    </HomeLayout>
  );
};

export default Home;
