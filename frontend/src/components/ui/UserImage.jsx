// src/components/gallery/UserImage.jsx
import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const UserImage = ({ image, onClose, onDelete, onPrev, onNext, hasPrev, hasNext }) => {
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={handleBackgroundClick}>
            <button onClick={onPrev} disabled={!hasPrev} className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-30">
                <ChevronLeft size={48} />
            </button>
            <div className="relative max-w-4xl w-full p-4 bg-gray-300 rounded-xl">
                <img src={`data:image/png;base64,${image.image_data}`} alt="Full Size" className="rounded-xl w-full max-h-[80vh] object-contain mx-auto" />
                <div className="m-2 text-center text-blue-950 text-lg">
                    {image.metadata?.filename || "No description"}
                </div>
                <div className="m-2 text-center text-red-600 text-lg">
                    Likelihood of DeepFake Manipulation: {(image.prob * 100).toFixed(2) || "??"}%
                </div>
                <div className="flex justify-center gap-2">
                    <button onClick={onDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
                    <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Close</button>
                </div>
            </div>
            <button onClick={onNext} disabled={!hasNext} className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-30">
                <ChevronRight size={48} />
            </button>
        </div>
    );
};

export default UserImage;
