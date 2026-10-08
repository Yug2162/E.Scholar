import React from "react";

const Stats = [
  { count: "5K", label: "Active Students" },
  { count: "10+", label: "Mentors" },
  { count: "200+", label: "Courses" },
  { count: "50+", label: "Awards" },
];

const StatsComponenet = () => {
  return (
    <div className="bg-[#0c1a2e] border-y border-[rgba(6,182,212,0.15)]">
      {/* Stats */}
      <div className="flex flex-col gap-10 justify-between w-11/12 max-w-maxContent text-[#f0f9ff] mx-auto ">
        <div className="grid grid-cols-2 md:grid-cols-4 text-center">
          {Stats.map((data, index) => {
            return (
              <div
                className={`flex flex-col py-10 ${
                  index !== Stats.length - 1 ? "md:border-r border-[rgba(6,182,212,0.15)]" : ""
                }`}
                key={index}
              >
                <h1 className="text-[30px] font-bold text-[#06b6d4]">
                  {data.count}
                </h1>
                <h2 className="font-semibold text-[16px] text-[#94a3b8]">
                  {data.label}
                </h2>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsComponenet;