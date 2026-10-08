import IconBtn from "./IconBtn"

export default function ConfirmationModal({ modalData }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-[rgba(6,13,26,0.85)]">
      <div className="w-11/12 max-w-md rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-6">
        <p className="mb-2 text-lg font-semibold text-[#f0f9ff]">
          {modalData?.text1}
        </p>
        <p className="mb-6 text-sm text-[#94a3b8]">
          {modalData?.text2}
        </p>
        <div className="flex items-center gap-x-4">
          <IconBtn
            onclick={modalData?.btn1Handler}
            text={modalData?.btn1Text}
          />
          <button
            className="cursor-pointer rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#94a3b8] transition-all duration-150 hover:border-[#06b6d4] hover:text-[#06b6d4]"
            onClick={modalData?.btn2Handler}
          >
            {modalData?.btn2Text}
          </button>
        </div>
      </div>
    </div>
  )
}
