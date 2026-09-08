import React, { useState, useRef, useEffect } from "react";

/** AnimatedStepperValue - slides text in/out with direction-aware animation */
const AnimatedStepperValue: React.FC<{
  value: string;
  direction: number;
  animKey: string;
  theme?: "dark" | "amber";
}> = ({ value, direction, animKey, theme = "amber" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [slideDir, setSlideDir] = useState(0);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setSlideDir(direction);
      setPhase("exit");
      const exitTimer = setTimeout(() => {
        setDisplayValue(value);
        setPhase("enter");
        const enterTimer = setTimeout(() => setPhase("idle"), 180);
        return () => clearTimeout(enterTimer);
      }, 140);
      prevValueRef.current = value;
      return () => clearTimeout(exitTimer);
    }
  }, [value, direction]);

  const getTransform = () => {
    if (phase === "exit") return "translateX(" + (-slideDir * 12) + "px)";
    if (phase === "enter") return "translateX(" + (slideDir * 8) + "px)";
    return "translateX(0)";
  };

  const getOpacity = () => {
    if (phase === "exit") return "0";
    if (phase === "enter") return "0.7";
    return "1";
  };

  return (
    <span
      className={`text-[12px] font-mono font-bold min-w-[105px] max-w-[115px] text-center px-1 truncate ${
        theme === "dark" ? "text-cyan-300" : "text-amber-700"
      }`}
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        transition: "transform 140ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease-out",
        display: "inline-block",
      }}
    >
      {displayValue}
    </span>
  );
};

export default AnimatedStepperValue;