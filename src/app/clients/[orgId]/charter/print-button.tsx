"use client";

export function CharterPrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className="px-3 py-1.5 text-xs font-medium border border-hair rounded-lg hover:bg-paper"
    >
      Print / Save PDF
    </button>
  );
}
