import React from "react";

const Loader = ({ message = "Loading...", over_image = false}) => {
    return (
        <div className={`fixed inset-0 ${over_image ? "z-60":"z-50"} bg-black bg-opacity-50 flex items-center justify-center`}>
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-white"></div>
                <p className="text-white text-lg font-medium">{message}</p>
            </div>
        </div>
    );
};

export default Loader;
