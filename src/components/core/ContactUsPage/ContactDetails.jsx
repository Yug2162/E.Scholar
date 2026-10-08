import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"

const contactDetails = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Chat on us",
    description: "Our friendly team is here to help.",
    details: "e.scholar.014@gmail.com",
  },
  {
    icon: "BiWorld",
    heading: "Visit us",
    description: "Come and say hello at our office HQ.",
    details:
      "E.Scholar Office, Bhopal-462022",
  },
  {
    icon: "IoCall",
    heading: "Call us",
    description: "Mon - Fri From 8am to 5pm",
    details: "+123 456 7869",
  },
]

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-6 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] p-4 lg:p-6">
      {contactDetails.map((ele, i) => {
        let Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon]
        return (
          <div
            className="flex flex-col gap-[2px] p-3 text-sm text-[#94a3b8]"
            key={i}
          >
            <div className="flex flex-row items-center gap-3">
              <Icon size={25} className="text-[#06b6d4]" />
              <h1 className="text-lg font-semibold text-[#f0f9ff]">
                {ele?.heading}
              </h1>
            </div>
            <p className="font-medium">{ele?.description}</p>
            <p className="font-semibold">{ele?.details}</p>
          </div>
        )
      })}
    </div>
  )
}

export default ContactDetails