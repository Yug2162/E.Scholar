import React from "react";
import { FooterLink2 } from "../../data/footer-links";
import { Link } from "react-router-dom";

// Images
import Logo from "../../assets/Images/FinalLogo2.png";

// Icons
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa";

const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"];
const Resources = [
  "Articles",
  "Blog",
  "Chart Sheet",
  "Code challenges",
  "Docs",
  "Projects",
  "Videos",
  "Workspaces",
];
const Plans = ["Paid memberships", "For students", "Business solutions"];
const Community = ["Forums", "Chapters", "Events"];

const Footer = () => {
  return (
    <div className="bg-[#0c1a2e] border-t border-[rgba(6,182,212,0.15)]">
      <div className="flex lg:flex-row gap-8 items-center justify-between w-11/12 max-w-maxContent leading-6 mx-auto relative py-14">
        <div className="border-b w-[100%] flex flex-col lg:flex-row pb-5 border-[rgba(6,182,212,0.15)]">
          {/* Section 1 */}
          <div className="lg:w-[50%] flex flex-wrap flex-row justify-between lg:border-r lg:border-[rgba(6,182,212,0.15)] pl-3 lg:pr-5 gap-3">
            <div className="w-[30%] flex flex-col gap-3 lg:w-[30%] mb-7 lg:pl-0">
<img
  src={Logo}
  alt="E.Scholar"
  className="h-14 w-auto mb-8 -ml-7"
/>              <h1 className="text-[#f0f9ff] font-semibold text-sm mb-3">
                Company
              </h1>
              <div className="flex flex-col gap-2">
                {["About", "Careers", "Affiliates"].map((ele, i) => {
                  return (
                    <div
                      key={i}
                      className="text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150 cursor-pointer"
                    >
                      <Link to={ele.toLowerCase()}>{ele}</Link>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 text-lg text-[#94a3b8] [&>*]:transition-colors [&>*]:hover:text-[#06b6d4]">
                <FaFacebook />
                <FaGoogle />
                <FaTwitter />
                <FaYoutube />
              </div>
              <div></div>
            </div>

            <div className="w-[48%] lg:w-[30%] mb-7 lg:pl-0">
              <h1 className="text-[#f0f9ff] font-semibold text-sm mb-3">
                Resources
              </h1>

              <div className="flex flex-col gap-2 mt-2">
                {Resources.map((ele, index) => {
                  return (
                    <div
                      key={index}
                      className="text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150 cursor-pointer"
                    >
                      <Link to={ele.split(" ").join("-").toLowerCase()}>
                        {ele}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <h1 className="text-[#f0f9ff] font-semibold text-sm mb-3 mt-7">
                Support
              </h1>
              <div className="text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150 cursor-pointer mt-2">
                <Link to={"/help-center"}>Help Center</Link>
              </div>
            </div>

            <div className="w-[48%] lg:w-[30%] mb-7 lg:pl-0">
              <h1 className="text-[#f0f9ff] font-semibold text-sm mb-3">
                Plans
              </h1>

              <div className="flex flex-col gap-2 mt-2">
                {Plans.map((ele, index) => {
                  return (
                    <div
                      key={index}
                      className="text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150 cursor-pointer"
                    >
                      <Link to={ele.split(" ").join("-").toLowerCase()}>
                        {ele}
                      </Link>
                    </div>
                  );
                })}
              </div>
              <h1 className="text-[#f0f9ff] font-semibold text-sm mb-3 mt-7">
                Community
              </h1>

              <div className="flex flex-col gap-2 mt-2">
                {Community.map((ele, index) => {
                  return (
                    <div
                      key={index}
                      className="text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150 cursor-pointer"
                    >
                      <Link to={ele.split(" ").join("-").toLowerCase()}>
                        {ele}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="lg:w-[50%] flex flex-wrap flex-row justify-between pl-3 lg:pl-5 gap-3">
            {FooterLink2.map((ele, i) => {
              return (
                <div key={i} className="w-[48%] lg:w-[30%] mb-7 lg:pl-0">
                  <h1 className="text-[#f0f9ff] font-semibold text-sm mb-3">
                    {ele.title}
                  </h1>
                  <div className="flex flex-col gap-2 mt-2">
                    {ele.links.map((link, index) => {
                      return (
                        <div
                          key={index}
                          className="text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150 cursor-pointer"
                        >
                          <Link to={link.link}>{link.title}</Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between w-11/12 max-w-maxContent mx-auto pb-14 border-t border-[rgba(6,182,212,0.08)] text-[#94a3b8] text-xs">
        {/* Section 1 */}
        <div className="flex justify-between lg:items-start items-center flex-col lg:flex-row gap-3 w-full">
          <div className="flex flex-row">
            {BottomFooter.map((ele, i) => {
              return (
                <div
                  key={i}
                  className={` ${
                    BottomFooter.length - 1 === i
                      ? ""
                      : "border-r border-[rgba(6,182,212,0.15)] text-[#94a3b8] hover:text-[#06b6d4] text-xs transition-colors duration-150 cursor-pointer"
                  } px-3 `}
                >
                  <Link to={ele.split(" ").join("-").toLocaleLowerCase()}>
                    {ele}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center">Made with ❤️ || E.Scholar</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
