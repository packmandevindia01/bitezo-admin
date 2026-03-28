interface LoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const Loader = ({
  fullScreen = false,
  size = "md",
  text,
  className = "",
}: LoaderProps) => {

  const ringSizes = {
    sm: { outer: "w-8 h-8", middle: "w-5 h-5", inner: "w-2.5 h-2.5", border: "border-2" },
    md: { outer: "w-14 h-14", middle: "w-9 h-9", inner: "w-4 h-4", border: "border-[3px]" },
    lg: { outer: "w-20 h-20", middle: "w-13 h-13", inner: "w-6 h-6", border: "border-4" },
  };

  const s = ringSizes[size];

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-4
        ${fullScreen ? "fixed inset-0 bg-black/20 backdrop-blur-sm z-50" : ""}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {/* RINGS */}
      <div className="relative flex items-center justify-center">

        {/* Outer ring */}
        <div
          className={`
            ${s.outer} ${s.border} absolute rounded-full
            border-[#49293e]/20
            border-t-[#49293e]
            animate-spin
          `}
          style={{ animationDuration: "1s" }}
        />

        {/* Middle ring */}
        <div
          className={`
            ${s.middle} ${s.border} absolute rounded-full
            border-[#49293e]/10
            border-b-[#6b3d5a]
            animate-spin
          `}
          style={{ animationDuration: "0.7s", animationDirection: "reverse" }}
        />

        {/* Inner dot */}
        <div
          className={`
            ${s.inner} rounded-full
            bg-linear-to-br from-[#49293e] to-[#6b3d5a]
            animate-pulse
          `}
        />

      </div>

      {/* TEXT */}
      {text && (
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-gray-600">{text}</p>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-[#49293e]/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </div>
      )}

    </div>
  );
};

export default Loader;