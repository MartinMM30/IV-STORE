"use client";

import { motion, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function HomePage() {
  const fullText = "welcome to MY CLOSET";
  const words = fullText.split(" ");

  // 1. Una única referencia para el contenedor del texto (el h1)
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
        // 2. Cálculo de tamaño simplificado.
        // Medimos el ancho del texto y hacemos el halo un poco más pequeño (ej. 80%)
        const width = textContainerRef.current.clientWidth;
        const size = Math.max(200, width * 0.8); // Un tamaño mínimo para que no desaparezca

        setHaloStyle({
          width: size,
          height: size, // Siempre un círculo
        });

        // La visibilidad se activa después de la animación de las letras
        setTimeout(() => setIsHaloVisible(true), fullText.length * 60);
      }
    };

    // Ejecutamos el cálculo después de un breve instante para asegurar que todo esté renderizado
    const timer = setTimeout(calculateHaloSize, 100);

    window.addEventListener("resize", calculateHaloSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateHaloSize);
    };
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] px-4 sm:px-6 overflow-hidden">
      <div className="text-center relative flex justify-center items-center">
        {/* 3. El Halo ahora se centra con CSS, no con JS. Es mucho más fiable. */}
        <motion.div
          className="halo-ripple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={haloStyle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isHaloVisible ? 1 : 0,
            scale: isHaloVisible ? 1 : 0.8,
          }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        />

        <motion.h1
          ref={textContainerRef} // Asignamos la ref al h1
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

        {/* El resto del componente no necesita cambios */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: fullText.length * 0.06 + 0.25,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          // Colocamos el texto y el botón como absolutos debajo del h1 para que no afecten el centrado del halo
          className="absolute top-full mt-6 text-sm text-neutral-400 tracking-wider w-full"
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
          className="absolute top-full mt-20 w-full"
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
