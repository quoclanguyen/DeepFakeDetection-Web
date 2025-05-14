const ResultsCard = ({ image, filename, prob, onClose }) => {
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={handleBackgroundClick}>
            <div className="relative max-w-4xl w-full p-4 bg-gray-300 rounded-xl">
                <img src={image} alt="Full Size" className="rounded-xl w-full max-h-[80vh] object-contain mx-auto" />
                <div className="m-2 text-center text-blue-950 text-lg">
                    {filename || "No description"}
                </div>
                <div className="m-2 text-center text-red-600 text-lg">
                    Likelihood of DeepFake Manipulation: {(prob * 100).toFixed(2)} %
                </div>
            </div>
        </div>
    );
};

export default ResultsCard;
