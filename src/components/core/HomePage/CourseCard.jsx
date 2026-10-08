import React from "react";

// Importing React Icons
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";

const CourseCard = ({cardData, currentCard, setCurrentCard}) => {
  return (
    <div
      className={`w-[360px] lg:w-[30%] bg-[#0c1a2e] ${
        currentCard === cardData?.heading
          ? "border-2 border-[#06b6d4] shadow-[0_0_16px_rgba(6,182,212,0.25)]"
          : "border border-[rgba(6,182,212,0.15)]"
      }  rounded-[4px] text-[#94a3b8] h-[300px] box-border cursor-pointer transition-all duration-200`}
      onClick={() => setCurrentCard(cardData?.heading)}
    >
      <div className="border-b-[2px] border-[rgba(6,182,212,0.15)] border-dashed h-[80%] p-6 flex flex-col gap-3">
        <div
          className={` ${
            currentCard === cardData?.heading ? "text-[#06b6d4]" : "text-[#f0f9ff]"
          } font-semibold text-[20px]`}
        >
          {cardData?.heading}
        </div>

        <div className="text-[#94a3b8]">{cardData?.description}</div>
      </div>

      <div
        className={`flex justify-between ${
          currentCard === cardData?.heading ? "text-[#06b6d4]" : "text-[#94a3b8]"
        } px-6 py-3 font-medium`}
      >
        {/* Level */}
        <div className="flex items-center gap-2 text-[16px]">
          <HiUsers />
          <p>{cardData?.level}</p>
        </div>

        {/* Flow Chart */}
        <div className="flex items-center gap-2 text-[16px]">
          <ImTree />
          <p>{cardData?.lessionNumber} Lesson</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;