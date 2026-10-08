export default function Tab({ tabData, field, setField }) {
  return (
    <div
      className="flex bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] p-1 gap-x-1 my-6 rounded-full max-w-max"
    >
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setField(tab.type)}
          className={`${
            field === tab.type
              ? "bg-[#06b6d4] text-[#060d1a]"
              : "bg-transparent text-[#94a3b8] hover:text-[#f0f9ff]"
          } py-2 px-5 rounded-full transition-all duration-200 font-medium`}
        >
          {tab?.tabName}
        </button>
      ))}
    </div>
  );
}