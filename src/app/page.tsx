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
  }, [fullText.length]); // Añadimos fullText.length a las dependencias por buena práctica

  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] px-4 sm:px-6 overflow-hidden">
      {/* Contenedor principal que se centra verticalmente */}
      <div className="flex flex-col items-center text-center transform -translate-y-12 md:-translate-y-16">
        {/* Contenedor para H1 y Halo, CON ALTURA DINÁMICA */}
        <div
          className="relative flex justify-center items-center"
          // ✅ CLAVE #1: Se le da una altura dinámica igual a la del círculo, creando un espacio "real"
          style={{ height: haloStyle.height }}
        >
          <motion.div
            className="halo-ripple absolute"
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

        {/* Subtítulo y botón, AHORA SIN POSICIONAMIENTO ABSOLUTO */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: fullText.length * 0.06 + 0.25,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          // ✅ CLAVE #2: Sin 'absolute'. Ahora sigue el flujo normal del documento. Margen ajustado.
          className="mt-4 text-sm text-neutral-400 tracking-wider z-10"
        >
          Technology, Fashion and Style
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: fullText.length * 0.06 + 0.7,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          // ✅ CLAVE #2: Sin 'absolute'. Margen ajustado.
          className="mt-6 z-10"
        >
          <a
            href="/catalog"
            className="px-6 py-3 bg-[var(--color-accent)] text-white uppercase tracking-widest text-xs rounded-md hover:opacity-90 transition active:scale-95"
          >
            Catalog
          </a>
        </motion.div>
      </div>
    </main>
  );
}
