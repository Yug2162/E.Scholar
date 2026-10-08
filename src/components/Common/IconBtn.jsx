export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center cursor-pointer gap-x-2 rounded-[4px] border border-[#06b6d4] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#06b6d4] transition-all duration-150 hover:bg-[#06b6d4] hover:text-[#060d1a] ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span className={`${outline && "text-[#06b6d4]"}`}>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  )
}
