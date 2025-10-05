"use client";

import { motion, Variants } from "framer-motion";

export default function HomePage() {
  const text = "Bienvenido a IV";
  const letters = Array.from(text);

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

  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] px-6">
      <div className="text-center">
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.25em] uppercase"
        >
          {letters.map((char, i) => {
            const isIV = char === "I" || char === "V";
            return (
              <motion.span
                key={i}
                variants={letter}
                className={`inline-block ${isIV ? "iv-metal" : ""}`}
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
          className="mt-6 text-sm text-neutral-400 tracking-wider"
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
          className="mt-8"
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
