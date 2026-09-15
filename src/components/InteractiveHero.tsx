"use client";

import { useRef, useState } from "react";
import { BrandIllustration } from "@/components/BrandIllustration";

export function InteractiveHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className="relative hidden lg:block"
    >
      <div
        className="bg-dot-grid absolute inset-0 -m-10 rounded-[3rem] opacity-70 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${pos.x * 12}px, ${pos.y * 12}px)` }}
      />
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: `translate(${pos.x * 26}px, ${pos.y * 26}px)` }}
      >
        <BrandIllustration className="mx-auto h-auto w-full max-w-md" />
      </div>
    </div>
  );
}
