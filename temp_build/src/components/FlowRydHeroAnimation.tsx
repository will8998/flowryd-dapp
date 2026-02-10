'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function FlowRydHeroAnimation() {
  const primaryColor = '#10B981';
  const secondaryColor = '#0EA5E9';
  const accentColor = '#34D399';

  return (
    <div className="relative flex items-center justify-center w-[600px] h-[600px] bg-transparent overflow-visible">
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
        style={{
          background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width="600" height="600" viewBox="0 0 600 600" className="opacity-60">
           <defs>
             <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor={primaryColor} stopOpacity="0" />
               <stop offset="50%" stopColor={accentColor} stopOpacity="0.5" />
               <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
             </linearGradient>
           </defs>
           <g transform="translate(300, 300)">
              {[...Array(15)].map((_, i) => (
                <motion.path
                   key={`wire-${i}`}
                   d={`M -220 0 C -110 ${-180 + i * 20} 110 ${180 - i * 20} 220 0`}
                   fill="none"
                   stroke="url(#wireGradient)"
                   strokeWidth="0.8"
                   animate={{ 
                       d: [
                           `M -220 0 C -110 ${-180 + i * 20} 110 ${180 - i * 20} 220 0`,
                           `M -220 0 C -110 ${-50 + i * 20} 110 ${50 - i * 20} 220 0`,
                           `M -220 0 C -110 ${-180 + i * 20} 110 ${180 - i * 20} 220 0`
                       ],
                       rotate: [i * 24, i * 24 + 360]
                   }}
                   transition={{
                       d: { duration: 12 + i, repeat: Infinity, ease: "easeInOut" },
                       rotate: { duration: 80 + i * 2, repeat: Infinity, ease: "linear" }
                   }}
                />
              ))}
              {[...Array(6)].map((_, i) => (
                 <motion.ellipse
                    key={`orb-${i}`}
                    rx={100 + i * 15}
                    ry={60 + i * 10}
                    stroke={primaryColor}
                    strokeWidth="0.5"
                    strokeOpacity="0.15"
                    fill="none"
                    animate={{ rotate: [0, 360] }}
                    transition={{
                        duration: 50 + i * 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * -5
                    }}
                 />
              ))}
           </g>
        </svg>
      </div>

      <motion.div
        className="absolute w-full h-full flex items-center justify-center z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 400 400" className="w-[500px] h-[500px] opacity-80">
          <defs>
            <path
              id="textCircle"
              d="M 200, 200 m -160, 0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0"
            />
          </defs>
          <text className="text-[12px] font-bold tracking-[0.4em] uppercase fill-emerald-400/80">
            <textPath href="#textCircle" startOffset="0%">
              Advantage &nbsp; • &nbsp; Network &nbsp; • &nbsp; Code &nbsp; • &nbsp; Your &nbsp; • &nbsp;
            </textPath>
          </text>
        </svg>
      </motion.div>

      <svg className="absolute w-full h-full pointer-events-none z-10" viewBox="0 0 600 600">
        
        <motion.circle
          cx="300"
          cy="300"
          r="230"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1"
          strokeDasharray="4 8"
          strokeOpacity="0.3"
          animate={{ rotate: -360 }}
          style={{ originX: "300px", originY: "300px" }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

        <motion.g
           animate={{ rotate: 360 }}
           style={{ originX: "300px", originY: "300px" }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="300"
            cy="300"
            r="180"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeDasharray="40 120"
          />
          <circle cx="300" cy="120" r="3" fill={accentColor} className="blur-[1px]" />
          <circle cx="300" cy="480" r="3" fill={secondaryColor} className="blur-[1px]" />
        </motion.g>

        <motion.circle
          cx="300"
          cy="300"
          r="140"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1"
          strokeOpacity="0.5"
          strokeDasharray="20 40"
          animate={{ rotate: -360 }}
          style={{ originX: "300px", originY: "300px" }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <div className="absolute w-[220px] h-[220px] rounded-full p-[2px] bg-gradient-to-tr from-emerald-500/50 via-sky-500/50 to-transparent z-20">
         <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center relative border border-white/5 overflow-hidden">
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center p-8"
             >
                <img 
                    src="/flow.svg" 
                    alt="Flow Ryd" 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                />
             </motion.div>
             
             <div className="absolute inset-4 rounded-full border border-white/5 border-dashed opacity-50 pointer-events-none"></div>
         </div>
      </div>
      
    </div>
  );
}
