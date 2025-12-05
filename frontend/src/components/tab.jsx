import { useState } from "react";

export function Tab({ onClick, isOn, children }) {
  const [isHover, setIsHover] = useState(false);
  // Only underline the active tab; no hover underline
  const lineColor = isOn ? "black" : "transparent";

  const clickable = typeof onClick === 'function';

  return (
    <div
      className={`tab flex flex-col items-center ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{ userSelect: "none" }}
    >
      {children}
      <div style={{ width: "100%", height: "2px", marginTop: "4px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <line
            x1="0"
            y1="1"
            x2="100"
            y2="1"
            stroke={lineColor}
            strokeWidth="2"
            style={{ transition: "stroke 0.5s ease" }}
          />
        </svg>
      </div>
    </div>
  );
}
