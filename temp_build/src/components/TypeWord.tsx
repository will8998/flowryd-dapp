"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  words: string[];
  className?: string;
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseMs?: number;
};

export default function TypeWord({
  words,
  className,
  typingSpeedMs = 90,
  deletingSpeedMs = 55,
  pauseMs = 850,
}: Props) {
  const list = useMemo(() => (words.length ? words : [""]), [words]);
  const [i, setI] = useState(0); // index in words
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout;
    const full = list[i % list.length];
    const speed = del ? deletingSpeedMs : typingSpeedMs;
    if (!del && txt === full) {
      t = setTimeout(() => setDel(true), pauseMs);
    } else if (del && txt === "") {
      setDel(false);
      setI((v) => (v + 1) % list.length);
    } else {
      t = setTimeout(() => {
        setTxt((s) => (del ? s.slice(0, -1) : full.slice(0, s.length + 1)));
      }, speed);
    }
    return () => clearTimeout(t);
  }, [txt, del, i, list, typingSpeedMs, deletingSpeedMs, pauseMs]);

  return (
    <span className={className} style={{ color: "#96FFC2" }}>
      {txt}
      <span className="ml-1 inline-block w-[2px] h-[0.9em] align-[-0.05em] bg-[#96FFC2] animate-pulse" />
    </span>
  );
}



