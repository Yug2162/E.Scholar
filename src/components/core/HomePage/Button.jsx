import React from "react";
import { Link } from "react-router-dom";

const Button = ({ children, active, linkto }) => {
  return (
    <Link to={linkto}>
      <div
        className={`text-center text-[13px] sm:text-sm px-5 py-2.5 rounded-[4px] font-semibold transition-all duration-150 ${
          active
            ? "border border-[#06b6d4] text-[#06b6d4] bg-transparent hover:bg-[#06b6d4] hover:text-[#060d1a]"
            : "border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4]"
        }`}
      >
        {children}
      </div>
    </Link>
  );
};

export default Button;