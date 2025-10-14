"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import styles from "./SlimeAssistant.module.css";

gsap.registerPlugin(MotionPathPlugin);

const SlimeAssistant = () => {
  // --- 1. REFERENCIAS Y ESTADO ---
  const slimeContainerRef = useRef<HTMLDivElement>(null);
  const slimeCharacterRef = useRef<SVGGElement>(null);
  const eyesNeutralRef = useRef<SVGGElement>(null);
  const eyesHappyRef = useRef<SVGGElement>(null);
  const eyesSadRef = useRef<SVGGElement>(null);
  const eyesSuggestRef = useRef<SVGGElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    { sender: "assistant", text: "¡Hola! Soy tu asistente." },
  ]);
  const [sessionId, setSessionId] = useState(() =>
    Math.random().toString(36).substring(7)
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- 2. LÓGICA DE ANIMACIÓN, MOVIMIENTO E INTERACCIÓN ---
  useGSAP(
    () => {
      const allEyes = [
        eyesNeutralRef.current,
        eyesHappyRef.current,
        eyesSadRef.current,
        eyesSuggestRef.current,
      ];
      let homeX = window.innerWidth - 120;
      let homeY = window.innerHeight - 120;
      let inactivityTimer: NodeJS.Timeout;
      let roamingTimer: NodeJS.Timeout | null = null;

      window.addEventListener("resize", () => {
        homeX = window.innerWidth - 120;
        homeY = window.innerHeight - 120;
      });

      function startBreathing() {
        if (!slimeCharacterRef.current) return;
        gsap.killTweensOf(slimeCharacterRef.current);
        gsap.to(slimeCharacterRef.current, {
          scaleY: 1.05,
          scaleX: 0.95,
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "50% 50%",
        });
      }

      function setExpression(visibleEyes: React.RefObject<SVGGElement>) {
        allEyes.forEach((eyeGroup) =>
          gsap.to(eyeGroup, { duration: 0.1, opacity: 0 })
        );
        gsap.to(visibleEyes.current, { duration: 0.2, delay: 0.1, opacity: 1 });
      }

      function bouncingJump(targetX: number, targetY: number) {
        if (!slimeContainerRef.current || !slimeCharacterRef.current) return;
        gsap.killTweensOf(slimeContainerRef.current);
        gsap.killTweensOf(slimeCharacterRef.current);
        const tl = gsap.timeline({ onComplete: startBreathing });
        tl.to(slimeCharacterRef.current, {
          scaleY: 0.6,
          scaleX: 1.4,
          duration: 0.15,
          transformOrigin: "50% 90%",
          ease: "power2.in",
        });
        tl.to(
          slimeContainerRef.current,
          {
            duration: 1.0,
            ease: "power1.out",
            motionPath: { path: [{ x: targetX, y: targetY }], curviness: 1.2 },
          },
          "-=0.1"
        );
        tl.to(
          slimeCharacterRef.current,
          {
            scaleY: 1.3,
            scaleX: 0.7,
            duration: 0.5,
            ease: "power1.out",
            yoyo: true,
            repeat: 1,
            transformOrigin: "50% 50%",
          },
          "<"
        );
        tl.to(slimeCharacterRef.current, {
          scaleY: 0.8,
          scaleX: 1.2,
          duration: 0.1,
          transformOrigin: "50% 90%",
        });
        tl.to(slimeCharacterRef.current, {
          scaleY: 1,
          scaleX: 1,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)",
          transformOrigin: "50% 90%",
        });
      }

      function thinkingAnimation() {
        if (!slimeCharacterRef.current) return;
        gsap.killTweensOf(slimeCharacterRef.current);
        const tl = gsap.timeline({ onComplete: startBreathing });
        tl.to(slimeCharacterRef.current, {
          scaleY: 0.8,
          scaleX: 1.2,
          duration: 0.2,
          ease: "power2.out",
          transformOrigin: "50% 80%",
        });
        tl.to(slimeCharacterRef.current, {
          scaleY: 1,
          scaleX: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          transformOrigin: "50% 80%",
        });
      }

      function goHome() {
        bouncingJump(homeX, homeY);
        stopRoaming();
      }
      function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(goHome, 60000);
        startRoaming();
      }
      function startRoaming() {
        if (roamingTimer) return;
        roamingTimer = setInterval(() => {
          const randomX = Math.random() * (window.innerWidth - 100);
          const randomY = Math.random() * (window.innerHeight - 100);
          bouncingJump(randomX, randomY);
        }, 10000);
      }
      function stopRoaming() {
        if (roamingTimer) clearInterval(roamingTimer);
        roamingTimer = null;
      }

      ["mousemove", "mousedown", "scroll", "keydown"].forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });

      (window as any).slimeFunctions = {
        bouncingJump,
        setExpression,
        thinkingAnimation,
      };

      gsap.set(slimeContainerRef.current, { x: homeX, y: homeY });
      startBreathing();
      resetInactivityTimer();
    },
    { scope: slimeContainerRef }
  );

  useEffect(() => {
    const productos = Array.from(
      document.querySelectorAll(".producto-interactivo")
    ) as HTMLElement[];

    const handleProductClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const nombreProducto = target.dataset.nombre;
      if (!nombreProducto) return;

      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 - 50;
      const targetY = rect.top - 100;
      const mensaje = `¡Hey! Veo que te interesa el producto "${nombreProducto}". ¿Te gustaría ver más detalles?`;

      (window as any).slimeFunctions?.bouncingJump(targetX, targetY);
      (window as any).slimeFunctions?.setExpression(eyesSuggestRef);
      addMessageToChat(mensaje, "assistant");
      setTimeout(
        () => (window as any).slimeFunctions?.setExpression(eyesNeutralRef),
        4000
      );
    };

    productos.forEach((p) => p.addEventListener("click", handleProductClick));
    return () => {
      productos.forEach((p) =>
        p.removeEventListener("click", handleProductClick)
      );
    };
  }, []);

  const addMessageToChat = (text: string, sender: "user" | "assistant") => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const userInputElement = form.elements.namedItem(
      "userInput"
    ) as HTMLInputElement;
    const userText = userInputElement.value.trim();
    if (userText === "") return;

    addMessageToChat(userText, "user");
    userInputElement.value = "";

    (window as any).slimeFunctions?.thinkingAnimation();
    (window as any).slimeFunctions?.setExpression(eyesNeutralRef);

    const cloudFunctionUrl =
      "https://slime-bridge-v2-202820640543.us-central1.run.app";

    try {
      const response = await fetch(cloudFunctionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, session: sessionId }),
      });
      if (!response.ok) {
        throw new Error("La conexión con el asistente falló.");
      }

      const data = await response.json();

      // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
      // Navegamos la nueva estructura de respuesta del webhook para encontrar el texto
      const reply =
        data.fulfillment_response?.messages[0]?.text?.text[0] ||
        "No entendí, ¿puedes repetirlo?";

      // Actualizamos la sesión con la que nos devuelve el backend
      setSessionId(data.session_info?.session || sessionId);
      addMessageToChat(reply, "assistant");
      (window as any).slimeFunctions?.setExpression(eyesHappyRef);
    } catch (error) {
      console.error("Error al llamar al puente:", error);
      addMessageToChat("¡Oh no! Mis circuitos se cruzaron...", "assistant");
      (window as any).slimeFunctions?.setExpression(eyesSadRef);
    } finally {
      setTimeout(
        () => (window as any).slimeFunctions?.setExpression(eyesNeutralRef),
        3000
      );
    }
  };

  return (
    <>
      {isChatOpen && (
        <div className={styles.chatContainer}>
          <div ref={chatWindowRef} className={styles.chatWindow}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  msg.sender === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className={styles.inputArea}>
            <input
              name="userInput"
              type="text"
              className={styles.userInput}
              placeholder="Escribe aquí..."
              autoComplete="off"
            />
            <button type="submit" className={styles.sendButton}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <div
        ref={slimeContainerRef}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={styles.slimeClickWrapper}
      >
        <svg
          className={styles.slimeSvg}
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          <g ref={slimeCharacterRef} id="slime-character">
            <path
              id="slime-body"
              d="M 10,50 C 10,20 90,20 90,50 C 90,80 10,80 10,50 Z"
              fill="#3498db"
            />
            <g id="eyes-container" className={styles.eyesContainer}>
              <g ref={eyesNeutralRef} id="eyes-neutral">
                <path d="M 30 50 L 40 50" />
                <path d="M 60 50 L 70 50" />
              </g>
              <g
                ref={eyesHappyRef}
                id="eyes-happy"
                className={styles.slimeEyesHidden}
              >
                <path d="M 30 47 L 40 53" />
                <path d="M 70 47 L 60 53" />
              </g>
              <g
                ref={eyesSadRef}
                id="eyes-sad"
                className={styles.slimeEyesHidden}
              >
                <path d="M 30 53 L 40 47" />
                <path d="M 70 53 L 60 47" />
              </g>
              <g
                ref={eyesSuggestRef}
                id="eyes-suggest"
                className={styles.slimeEyesHidden}
              >
                <path d="M 30 53 L 35 47 L 40 53" />
                <path d="M 60 53 L 65 47 L 70 53" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
};

export default SlimeAssistant;
