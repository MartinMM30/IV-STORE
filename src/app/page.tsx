"use client";

import { motion, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function HomePage() {
  const text1 = "welcome to";
  const text2 = "MY CLOSET";
  const letters = Array.from(text1 + " " + text2);

  const o1Ref = useRef<HTMLSpanElement>(null);
  const o2Ref = useRef<HTMLSpanElement>(null);

  const [haloStyle, setHaloStyle] = useState({});
  const [isHaloVisible, setIsHaloVisible] = useState(false);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const letter: Variants = {
    hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  useEffect(() => {
    const calculateHaloPosition = () => {
      if (o1Ref.current && o2Ref.current) {
        const rect1 = o1Ref.current.getBoundingClientRect();
        const rect2 = o2Ref.current.getBoundingClientRect();
        const containerRect =
          o1Ref.current.parentElement?.getBoundingClientRect();

        if (!containerRect) return;

        const left = rect1.left - containerRect.left + rect1.width / 2;
        const top = rect1.top - containerRect.top + rect1.height / 2;
        const width = rect2.right - rect1.left;

        const height = width;

        setHaloStyle({
          top: top - height / 2,
          left: left - rect1.width / 2,
          width: `${width}px`,
          height: `${height}px`,
        });

        setTimeout(() => setIsHaloVisible(true), 500);
      }
    };

    calculateHaloPosition();
    window.addEventListener("resize", calculateHaloPosition);

    return () => window.removeEventListener("resize", calculateHaloPosition);

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Cambiamos [letters] por un array vacío [] para que el efecto se ejecute solo una vez.
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] px-4 sm:px-6 overflow-hidden">
      <div className="text-center relative">
        <motion.div
          className="halo-ripple"
          style={haloStyle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isHaloVisible ? 1 : 0,
            scale: isHaloVisible ? 1 : 0.8,
          }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        />

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.25em] uppercase relative z-10"
        >
          {letters.map((char, i) => {
            const isIVY =
              char === "M" ||
              char === "Y" ||
              char === "C" ||
              char === "L" ||
              char === "O" ||
              char === "S" ||
              char === "E" ||
              char === "T";

            const getRef = () => {
              if (i === 4) return o1Ref;
              if (i === 16) return o2Ref;
              return null;
            };

            return (
              <motion.span
                key={i}
                ref={getRef()}
                variants={letter}
                className={`inline-block ${isIVY ? "iv-metal" : ""}`}
                aria-hidden={char === " "}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            );
          })}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: letters.length * 0.06 + 0.25,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-6 text-sm text-neutral-400 tracking-wider relative z-10"
        >
          Diseño. Estilo. Precisión.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: letters.length * 0.06 + 0.7,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-8 relative z-10"
        >
          <a
            href="/catalog"
            className="px-6 py-3 bg-[var(--color-accent)] text-white uppercase tracking-widest text-xs rounded-md hover:opacity-90 transition"
          >
            Ver catálogo
          </a>
        </motion.div>
      </div>
    </main>
  );
}
