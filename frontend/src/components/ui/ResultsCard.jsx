const ResultsCard = ({ filename, ids }) => {
  return (
      <div className="bg-gray-700 p-4 rounded-lg shadow-md text-white">
          <h2 className="text-xl font-bold mb-2">Upload Result</h2>
          <p><strong>Filename:</strong> {filename}</p>
          <p><strong>Vector IDs:</strong></p>
          <ul className="list-disc pl-6">
              {ids.map((id, index) => (
                  <li key={index}>{id}</li>
              ))}
          </ul>
      </div>
  );
};

export default ResultsCard;
