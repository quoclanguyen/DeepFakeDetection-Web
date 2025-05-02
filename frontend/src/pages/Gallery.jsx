import React, { useEffect, useState } from "react";
import HomeLayout from "../layouts/HomeLayout";
import { mediaServices } from "../api/services/mediaServices";

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const imageIdsRes = await mediaServices.getAllImages();
                const allImages = [];
                for (const idStr of imageIdsRes.q_ids) {
                    const imageRes = await mediaServices.getImage(idStr);
                    allImages.push(imageRes);
                }
                
                console.log(allImages);
                setImages(allImages);
            } catch (err) {
                console.log(err);
                setError(err.response?.data?.detail || "Failed to load images.");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-100 px-6 pt-24">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Gallery</h1>
                {loading ? (
                    <p className="text-gray-600">Loading images...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : images.length === 0 ? (
                    <p className="text-gray-600">You haven't uploaded any images yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-md">
                                <img
                                    src={`data:image/png;base64,${img.image_data}`}
                                    alt="User Upload"
                                    className="w-full h-48 object-cover rounded-md"
                                />
                                <div className="mt-2 text-sm text-gray-700">
                                    {img.metadata?.filename || "No description"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default Gallery;
