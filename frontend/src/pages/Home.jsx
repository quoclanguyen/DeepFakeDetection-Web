import { Link } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";

const Home = () => {
  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to DeepFake Recognizer</h1>
        <p className="text-lg text-gray-300 mb-6">
          Upload a video or image to check for deepfakes.
        </p>
        <Link to="/detect">
          <button className="px-6 py-3 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-600 transition">
            Get Started
          </button>
        </Link>
      </div>
    </HomeLayout>
  );
};

export default Home;