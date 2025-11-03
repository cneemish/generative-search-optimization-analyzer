import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center itemns-center py-20">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
    </div>
  );
};

export default LoadingSpinner;
