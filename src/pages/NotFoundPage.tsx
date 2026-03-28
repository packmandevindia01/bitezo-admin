import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-gray-100 to-white flex items-center justify-center px-4">
      
      {/* Light background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#49293e]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#49293e]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center">

        {/* 404 */}
        <div className="relative inline-block mb-6">
          <h1 className="text-[10rem] sm:text-[14rem] font-black text-[#49293e]/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none bg-linear-to-b from-[#49293e] to-[#49293e]/50 bg-clip-text text-transparent">
              404
            </h1>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#49293e] mb-3">
          Page Not Found
        </h2>
        <p className="text-[#49293e]/60 text-sm sm:text-base max-w-md mx-auto mb-10">
          The page you're looking for doesn't exist or has been moved.
          You'll be redirected automatically.
        </p>

        {/* Countdown ring */}
        <div className="flex justify-center mb-10">
          <div className="relative h-20 w-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#49293e" strokeOpacity="0.1" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="#49293e"
                strokeOpacity="0.8"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - count / 10)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#49293e] font-bold text-xl leading-none">{count}</span>
              <span className="text-[#49293e]/40 text-[10px]">sec</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-[#49293e] text-white font-semibold text-sm hover:bg-[#3b2132] transition-all duration-200 shadow-lg shadow-black/10"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-[#49293e]/10 text-[#49293e] font-semibold text-sm border border-[#49293e]/20 hover:bg-[#49293e]/20 transition-all duration-200"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;