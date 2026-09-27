import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-3 py-10">
      <div className="flex gap-2">
        <div className="dot"></div>
        <div className="dot delay1"></div>
        <div className="dot delay2"></div>
      </div>

      <p className="text-sm text-green-600 font-medium">Loading...</p>
    </div>
  );
};

export default Loading;
