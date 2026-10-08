import React from 'react'
import HighlightText from './HighlightText'
import CTAButton from "../../../components/core/HomePage/Button";
import Know_your_progress from "../../../assets/Images/Know_your_progress.png";
import Compare_with_others from "../../../assets/Images/Compare_with_others.svg";
import Plan_your_lessons from "../../../assets/Images/Plan_your_lessons.svg";

const LearningLanguageSection = () => {
  return (
    <div>
      <div className="text-4xl font-semibold text-center my-10">
        Your swiss knife for
        <HighlightText text={"learning any language"} />

        <div className="text-center text-[#94a3b8] font-medium lg:w-[75%] mx-auto leading-6 text-base mt-3">
          Using spin making learning multiple languages easy. with 20+
          languages realistic voice-over, progress tracking, custom schedule
          and more.
        </div>
      </div>

      {/* Premium background container */}
      <div className="relative mx-auto lg:w-[88%] rounded-[4px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0c1a2e 50%, #091220 100%)",
          border: "1px solid rgba(6,182,212,0.2)",
          boxShadow: "0 0 60px rgba(6,182,212,0.08), inset 0 1px 0 rgba(6,182,212,0.1)",
        }}>

        {/* Dot grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Top-left corner accent */}
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none" style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, transparent 60%)",
        }} />

        {/* Top-right corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{
          background: "linear-gradient(225deg, rgba(6,182,212,0.15) 0%, transparent 60%)",
        }} />

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.4), transparent)" }}
        />

        {/* Top line accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.5) 30%, rgba(6,182,212,0.5) 70%, transparent)" }}
        />

        {/* Center radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        }} />

        {/* Images */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center pt-12 pb-6 px-6">
          <img src={Know_your_progress} alt="" className="object-contain lg:-mr-32" />
          <img src={Compare_with_others} alt="" className="object-contain lg:-mb-10 lg:-mt-0 -mt-12" />
          <img src={Plan_your_lessons} alt="" className="object-contain lg:-ml-36 lg:-mt-5 -mt-16" />
        </div>

        {/* Button inside container */}
        <div className="relative flex justify-center pb-10 -mt-2">
          <CTAButton active={true} linkto={"/signup"}>
            <div className="">Learn More</div>
          </CTAButton>
        </div>

      </div>
    </div>
  )
}

export default LearningLanguageSection