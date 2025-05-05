import React, { useEffect, useState } from "react";
import HomeLayout from "../layouts/HomeLayout";
import { mediaServices } from "../api/services/mediaServices";
import Loader from "../components/animation/Loader";
import UserImage from "../components/ui/UserImage";

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageIds, setImageIds] = useState([]);
    const fetchImages = async () => {
        try {
            const imageIdsRes = await mediaServices.getAllImages();
            if (imageIdsRes.status_code === 404) {
                setError("You haven't uploaded any image");
                return;
            }
            const allImages = [];
            setImageIds(imageIdsRes.q_ids);
            for (const idStr of imageIdsRes.q_ids) {
                const imageRes = await mediaServices.getImage(idStr);
                allImages.push(imageRes);
            }
            setImages(allImages);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load images.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchImages();
    }, [imageIds]);
    // console.log(imageIds)
    const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

    const handleDelete = async () => {
        const idToDelete = imageIds[selectedIndex];
        // console.log(idToDelete);
        setLoading(true);
        await mediaServices.deleteImage(idToDelete);
        setLoading(false);
        const updatedImageIds = imageIds.filter((_, idx) => idx !== selectedIndex);
        const updatedImages = images.filter((_, idx) => idx !== selectedIndex);
    
        setImages(updatedImages);
        setImageIds(updatedImageIds);
        setSelectedIndex(null);
        fetchImages();
    };

    const showPrev = () => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    const showNext = () => setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));

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
                            <div
                                key={idx}
                                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                                onClick={() => setSelectedIndex(idx)}
                            >
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
                {selectedImage && (
                    <UserImage
                    image={selectedImage}
                    onClose={() => setSelectedIndex(null)}
                    onDelete={handleDelete}
                    onPrev={showPrev}
                    onNext={showNext}
                    hasPrev={selectedIndex > 0}
                    hasNext={selectedIndex < images.length - 1}
                    />
                )}
                {loading && <Loader message="Loading..." over_image={selectedImage===null ? true: false}/>}
            </div>
        </HomeLayout>
    );
};

export default Gallery;
