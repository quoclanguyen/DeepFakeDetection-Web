import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import HomeLayout from "../layouts/HomeLayout";
import { mediaServices } from "../api/services/mediaServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/animation/Loader";
import ResultsCard from "../components/ui/ResultsCard";

const Detect = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedModel, setSelectedModel] = useState("CapsuleNetV1");

    const extractFirstFrame = (videoFile) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(videoFile);
            video.currentTime = 0.1;

            video.addEventListener("loadeddata", () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailUrl = canvas.toDataURL("image/png");
                resolve(thumbnailUrl);
            });

            video.addEventListener("error", () => {
                resolve(null);
            });
        });
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith("image/")) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else if (selectedFile.type.startsWith("video/")) {
                const thumbnailUrl = await extractFirstFrame(selectedFile);
                setPreviewUrl(thumbnailUrl);
            }
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile) {
            setFile(droppedFile);
            if (droppedFile.type.startsWith("image/")) {
                setPreviewUrl(URL.createObjectURL(droppedFile));
            } else if (droppedFile.type.startsWith("video/")) {
                const thumbnailUrl = await extractFirstFrame(droppedFile);
                setPreviewUrl(thumbnailUrl);
            }
        }
    };

    const uploadMedia = async () => {
        if (!file) {
            alert("Please select a valid file first.");
            return;
        }
        setLoading(true);
        if (file.type.startsWith("image/")) {
            try {
                const response = await mediaServices.uploadImage(file);
                console.log(response);
                const id = response.ids;
                if (response.status_code === 200) {
                    toast.success("Upload successful!");
                    try {
                        const detectResponse = await mediaServices.detectImage(id, selectedModel);
                        setResult(detectResponse);
                        setLoading(false);
                        console.log(detectResponse);
                        return response.data;
                    } catch (error) {
                        console.log(error);
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        } else if (file.type.startsWith("video/")) {
            try {
                const response = await mediaServices.detectVideo(file, selectedModel);
                console.log(response);
                if (response.status_code === 200) {
                    toast.success("Upload successful!");
                    setResult(response);
                    setLoading(false);
                }
                // const id = response.ids;
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    };

    return (
        <HomeLayout>
            <ToastContainer position="top-center" autoClose={1500} />
            <div className="relative flex flex-col items-center justify-center h-screen text-white px-4 bg-gray-800">
                <h1 className="text-4xl font-extrabold mb-4">Deepfake Detection</h1>
                <p className="text-lg text-gray-300 mb-6">Upload a file to analyze deepfakes.</p>

                <form
                    className={`p-4 rounded-lg flex flex-col items-center w-full max-w-md relative shadow-lg transition-all ${dragging ? "bg-gray-800 brightness-50" : "bg-gray-900"}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <label
                        htmlFor="fileUpload"
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                    >
                        <Upload size={40} className="text-gray-400 mb-2" />
                        <span className="text-gray-300">
                            {file ? `Selected: ${file.name}` : "Click or drag a file to upload"}
                        </span>
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,video/*"
                        />
                    </label>

                    {previewUrl && (
                        <div className="mt-4 w-full flex justify-center">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="rounded-lg shadow-md max-w-full h-48 object-contain"
                            />
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="px-2 py-1 text-black rounded-lg"
                        >
                            <option value="CapsuleNetV1">CapsuleNetV1</option>
                            <option value="CapsuleNetV2a">CapsuleNetV2a</option>
                            <option value="CapsuleNetV2c">CapsuleNetV2c</option>
                            <option value="F3NetVa">F3NetVa</option>
                            <option value="F3NetVc">F3NetVc</option>
                            <option value="FaceXRay">FaceXRay</option>
                        </select>
                        <button
                            type="button"
                            onClick={uploadMedia}
                            disabled={loading}
                            className="px-4 py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                            {loading ? "Uploading..." : "Upload & Detect"}
                        </button>
                    </div>
                </form>

                {result && (
                    <ResultsCard
                        image={previewUrl}
                        filename={file.name}
                        prob={result.conf_level_fake}
                        onClose={() => { setResult(null); setFile(null); }}
                    />
                )}
                {loading && <Loader message="Uploading..." />}
            </div>
        </HomeLayout>
    );
};

export default Detect;
