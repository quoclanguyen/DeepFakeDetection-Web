import { useState } from "react";

const UploadForm = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onUpload(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} className="mb-3" />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Upload</button>
    </form>
  );
};

export default UploadForm;
