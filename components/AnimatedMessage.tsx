import { useEffect } from "react";
// import * as anime from "animejs";

interface AnimatedMessageProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedMessage({
  children,
  className = "",
}: AnimatedMessageProps) {
  useEffect(() => {
    // Simple CSS animation instead of anime.js
    const element = document.querySelector(".animated-message") as HTMLElement;
    if (element) {
      element.style.transform = "translateY(20px)";
      element.style.opacity = "0";
      setTimeout(() => {
        element.style.transition = "all 0.6s ease-out";
        element.style.transform = "translateY(0)";
        element.style.opacity = "1";
      }, 100);
    }
  }, []);

  return <div className={`animated-message ${className}`}>{children}</div>;
}
