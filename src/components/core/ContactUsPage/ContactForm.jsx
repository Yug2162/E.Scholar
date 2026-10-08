import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] text-[#94a3b8] rounded-[4px] p-7 lg:p-14 flex gap-3 flex-col">
      <h1 className="text-4xl leading-10 font-semibold text-[#f0f9ff]">
        Got a Idea? We&apos;ve got the skills. Let&apos;s team up
      </h1>
      <p className="">
        Tell us more about yourself and what you&apos;re got in mind.
      </p>

      <div className="mt-7">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactForm;