import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import HomeLayout from "../layouts/HomeLayout";
import { mediaServices } from "../api/services/mediaServices";
import ResultsCard from "../components/ui/ResultsCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/animation/Loader";

const Detect = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile) {
            setFile(droppedFile);
            setPreviewUrl(URL.createObjectURL(droppedFile));
        }
    };

    const uploadImage = async () => {
        if (!file) {
            alert("Please select a valid file first.");
            return;
        }
        setLoading(true);

        try {
            const response = await mediaServices.uploadImage(file);
            console.log(response)
            if (response.status_code == 200) {
                toast.success("Upload successful!", );
                setResult(response.data);
                setLoading(false);
                setPreviewUrl(null);
                setFile(null);
                return response.data;
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }
    return (
        <HomeLayout>
            <ToastContainer position="top-center" autoClose={1500} />
            <div className="relative flex flex-col items-center justify-center h-screen text-white px-4 bg-gray-800">
                <h1 className="text-4xl font-extrabold mb-4">Deepfake Detection</h1>
                <p className="text-lg text-gray-300 mb-6">Upload a file to analyze deepfakes.</p>

                <form
                    className={`p-4 rounded-lg flex flex-col items-center w-full max-w-md relative shadow-lg transition-all ${dragging ? "bg-gray-800 brightness-50" : "bg-gray-900"
                        }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    {/* Drag and Drop Area */}
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
                            accept="image/*"
                        />
                    </label>

                    {/* Image Preview */}
                    {previewUrl && (
                        <div className="mt-4 w-full flex justify-center">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="rounded-lg shadow-md max-w-full h-48 object-contain"
                            />
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        type="button"
                        onClick={uploadImage} // ✅ Call upload function
                        disabled={loading} // ✅ Disable while uploading
                        className="mt-4 px-4 py-3 text-white font-semibold rounded-lg transition-all 
                            bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                            active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : (
                            <>
                                <CheckCircle size={20} />
                                Upload & Detect
                            </>
                        )}
                    </button>
                </form>
                {result && (
                    <div className="mt-8 w-full max-w-md">
                        <ResultsCard
                            filename={result.filename}
                            ids={result.ids}
                        />
                    </div>
                )}
                {loading && <Loader message="Uploading..."/>}
            </div>
        </HomeLayout>
    );
};

export default Detect;