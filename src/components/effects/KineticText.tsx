"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface KineticTextProps {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
}

export function KineticText({
    text,
    className = "",
    delay = 0,
    stagger = 0.03
}: KineticTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const chars = containerRef.current.querySelectorAll(".kinetic-char");

        gsap.fromTo(
            chars,
            {
                opacity: 0,
                y: 50,
                rotateX: -90
            },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: stagger,
                delay: delay,
            }
        );
    }, [text, delay, stagger]);

    return (
        <div ref={containerRef} className={className} aria-label={text}>
            {text.split("").map((char, index) => (
                <span
                    key={index}
                    className="kinetic-char inline-block"
                    style={{
                        whiteSpace: char === " " ? "pre" : undefined,
                        transformStyle: "preserve-3d"
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </div>
    );
}
