"use client";

import { motion, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function HomePage() {
  const fullText = "welcome to MY CLOSET";
  const words = fullText.split(" ");

  const textContainerRef = useRef<HTMLHeadingElement>(null);

  const [haloStyle, setHaloStyle] = useState({ width: 0, height: 0 });
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
    const calculateHaloSize = () => {
      if (textContainerRef.current) {
        const width = textContainerRef.current.clientWidth;

        // ✅ SOLUCIÓN 1: Limitamos el tamaño del halo
        // Ahora será el 60% del ancho del texto, con un mínimo de 200px y un MÁXIMO de 550px.
        const size = Math.min(550, Math.max(200, width * 0.6));

        setHaloStyle({
          width: size,
          height: size,
        });

        setTimeout(() => setIsHaloVisible(true), fullText.length * 60);
      }
    };

    const timer = setTimeout(calculateHaloSize, 100);
    window.addEventListener("resize", calculateHaloSize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateHaloSize);
    };
  }, []);

  return (
    // El <main> sigue siendo el encargado de centrar todo
    <main className="flex items-center justify-center min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] px-4 sm:px-6 overflow-hidden">
      {/* ✅ SOLUCIÓN 2: Un único contenedor para todo el contenido */}
      <div className="flex flex-col items-center text-center">
        {/* Contenedor relativo para el H1 y su Halo */}
        <div className="relative flex justify-center items-center">
          <motion.div
            className="halo-ripple absolute" // Quitamos las clases de posicionamiento de aquí
            style={haloStyle}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHaloVisible ? 1 : 0,
              scale: isHaloVisible ? 1 : 0.8,
            }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          />

          <motion.h1
            ref={textContainerRef}
            variants={container}
            initial="hidden"
            animate="show"
            className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.25em] uppercase relative z-10"
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {word.split("").map((char, charIndex) => {
                  const isMetal = "MYCLOSET".includes(char);
                  return (
                    <motion.span
                      key={charIndex}
                      variants={letter}
                      className={`inline-block ${isMetal ? "iv-metal" : ""}`}
                    >
                      {char}
                    </motion.span>
                  );
                })}
                {wordIndex < words.length - 1 && <span>&nbsp;</span>}
              </span>
            ))}
          </motion.h1>
        </div>

        {/* El subtítulo y el botón ahora son parte del flujo normal del documento */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: fullText.length * 0.06 + 0.25,
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
            delay: fullText.length * 0.06 + 0.7,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-8 relative z-10"
        >
          <a
            href="/catalog"
            className="px-6 py-3 bg-[var(--color-accent)] text-white uppercase tracking-widest text-xs rounded-md hover:opacity-90 transition active:scale-95"
          >
            Ver catálogo
          </a>
        </motion.div>
      </div>
    </main>
  );
}
