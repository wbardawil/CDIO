"use client";

import { useState } from "react";

interface Props {
  link: string;
  label?: string;
  className?: string;
}

export function CopyLinkButton({ link, label = "Copy link", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback if clipboard API blocked
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        copied ? "text-green-600" : "text-blue-600 hover:text-blue-800"
      } ${className}`}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
