"use client";

import { useEffect } from "react";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide global header/footer for immersive demo experience
  useEffect(() => {
    const headerEl = document.querySelector("header");
    const footerEl = document.querySelector("footer");

    if (headerEl instanceof HTMLElement) headerEl.style.display = "none";
    if (footerEl instanceof HTMLElement) footerEl.style.display = "none";

    return () => {
      if (headerEl instanceof HTMLElement) headerEl.style.display = "";
      if (footerEl instanceof HTMLElement) footerEl.style.display = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden selection:bg-blue-500/30">
      {children}
    </div>
  );
}
