// Icons Import
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

// Component Imports
import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import ExploreMore from "../components/core/HomePage/ExploreMore"
import HighlightText from "../components/core/HomePage/HighlightText"
import InstructorSection from "../components/core/HomePage/InstructorSection"
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection"
import TimelineSection from "../components/core/HomePage/Timeline"

// Image and Video Import
// Hero image (Unsplash — free to use, no attribution required)
const HeroImage =
  "https://images.unsplash.com/photo-1753715613434-9c7cb58876b9?fm=jpg&q=80&w=1200&auto=format&fit=crop"
function Home() {
  return (
    <div className="bg-[#060d1a]">
      {/* Hero — full screen, hexagon + circuit-line backdrop */}
      <div className="relative flex min-h-screen items-center overflow-hidden">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <clipPath id="heroHexClip" clipPathUnits="objectBoundingBox">
              <polygon points="0,0.5 0.25,0.065 0.75,0.065 1,0.5 0.75,0.935 0.25,0.935" />
            </clipPath>
          </defs>

        </svg>

        <div className="relative z-10 mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-center gap-6 py-16 text-white">
          {/* Become a Instructor Button */}
          <Link to={"/signup"}>
            <div className="group mx-auto w-fit rounded-[4px] bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] p-1 font-bold text-[#94a3b8] transition-all duration-200 hover:scale-95 hover:border-[#06b6d4] hover:text-[#06b6d4]">
              <div className="flex flex-row items-center gap-2 rounded-[4px] px-10 py-[5px] transition-all duration-200 group-hover:bg-[rgba(6,182,212,0.08)]">
                <p>Join as Instructor</p>
                <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Heading */}
          <div className="mx-auto max-w-3xl text-center text-5xl font-bold leading-tight text-[#f0f9ff] mt-1">
            Learn. Build.
            <HighlightText text={"Get Hired."} />
          </div>

          {/* Sub Heading */}
          <div className="w-[90%] max-w-xl text-center text-base font-normal text-[#94a3b8]">
            Project-based learning for the next generation of developers.
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-7">
            <CTAButton active={true} linkto={"/signup"}>
              Start Learning
            </CTAButton>
            <CTAButton active={false} linkto={"/catalog/web-development"}>
              Browse Courses
            </CTAButton>
          </div>

          {/* Image — wide rectangular frame */}
          <div className="relative mx-3 mt-7 mb-2 aspect-[2/1] w-full max-w-4xl overflow-hidden rounded-[4px] border border-[#06b6d4] glow-active shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <img
              src={HeroImage}
              alt="Programmer working at a multi-monitor coding setup"
              className="h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(6,13,26,0.55), transparent 55%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Code + Explore section */}
      <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-white">
        {/* Code Section 1 */}
        <div>
          <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold text-[#f0f9ff]">
                Code your way to
                <HighlightText text={"your dream job."} />
              </div>
            }
            subheading={
              "Every course is built around real projects — not theory. Learn from practitioners, not just teachers."
            }
            ctabtn1={{
              btnText: "Try it Yourself",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signup",
              active: false,
            }}
            codeColor={"text-[#67e8f9]"}
            codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            backgroundGradient={
              <div className="absolute inset-0 pointer-events-none rounded-[4px] overflow-hidden">
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: "1.5px",
                  background: "linear-gradient(to right, transparent, #06b6d4 25%, rgba(6,182,212,0.35) 75%, transparent)"
                }}/>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "48px",
                  background: "linear-gradient(to top, rgba(3,8,16,0.75), transparent)"
                }}/>
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: "120px", height: "100%",
                  background: "linear-gradient(to left, rgba(3,8,16,0.5), transparent)"
                }}/>
              </div>
            }
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold text-[#f0f9ff] lg:w-[50%]">
                Zero setup.
                <HighlightText text={"Pure focus."} />
              </div>
            }
            subheading={
              "Open E.Scholar. Pick a course. Write your first line of code in under 60 seconds."
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signup",
              active: false,
            }}
            codeColor={"text-[#67e8f9]"}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={
              <div className="absolute inset-0 pointer-events-none rounded-[4px] overflow-hidden">
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: "1.5px",
                  background: "linear-gradient(to right, transparent, #06b6d4 25%, rgba(6,182,212,0.35) 75%, transparent)"
                }}/>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "48px",
                  background: "linear-gradient(to top, rgba(3,8,16,0.75), transparent)"
                }}/>
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  width: "120px", height: "100%",
                  background: "linear-gradient(to right, rgba(3,8,16,0.5), transparent)"
                }}/>
              </div>
            }
          />
        </div>

        {/* Explore Section */}
        <ExploreMore />
      </div>

      {/* Section 2 */}
      <div className="bg-[#060d1a] text-[#94a3b8]">
        <div className="bg-[#060d1a] h-[320px]">
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
            <div className="lg:h-[150px]"></div>
            <div className="flex flex-row gap-7 text-white lg:mt-8">
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-2">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>
              <CTAButton active={false} linkto={"/login"}>
                Learn More
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
          {/* Job that is in Demand - Section 1 */}
          <div className="mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0">
            <div className="text-4xl font-semibold text-[#f0f9ff] lg:w-[45%]">
              Built for the
              <HighlightText text={"jobs of tomorrow."} />
            </div>
            <div className="flex flex-col items-start gap-10 lg:w-[40%]">
              <div className="text-[16px] text-[#94a3b8]">
                The industry moves fast. E.Scholar keeps you faster — with curriculum
                designed around what companies are actually hiring for right now.
              </div>
              <CTAButton active={true} linkto={"/signup"}>
                <div className="">Start Learning</div>
              </CTAButton>
            </div>
          </div>

          {/* Timeline Section - Section 2 */}
          <TimelineSection />

          {/* Learning Language Section - Section 3 */}
          <LearningLanguageSection />
        </div>
      </div>

      {/* Section 3 */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-white">
        {/* Become a instructor section */}
        <InstructorSection />

        {/* Reviews from Other Learners */}
        <h1 className="text-center text-4xl font-semibold mt-8 text-[#f0f9ff]">
          Loved by learners worldwide.
        </h1>
        <ReviewSlider />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home