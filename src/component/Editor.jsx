"use client";

import { useEffect, useRef } from "react";

const toolbarButtons = [
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  { label: "UL", command: "insertUnorderedList" },
  { label: "OL", command: "insertOrderedList" },
];

export default function CustomEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const applyCommand = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false);
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div
      style={{
        border: "1px solid #cdd9ea",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.35rem",
          padding: "0.55rem",
          borderBottom: "1px solid #e6edf7",
          background: "#f8fbff",
          flexWrap: "wrap",
        }}
      >
        {toolbarButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => applyCommand(button.command)}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight: "140px",
          padding: "0.75rem",
          outline: "none",
          color: "#0f172a",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      />
    </div>
  );
}
