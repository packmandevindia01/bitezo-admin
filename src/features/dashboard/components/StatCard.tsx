import React from "react";

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
      
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>

    </div>
  );
};

export default StatCard;