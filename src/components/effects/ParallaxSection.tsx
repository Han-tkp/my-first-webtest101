"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

export function ParallaxSection({
    children,
    speed = 0.5,
    className = ""
}: ParallaxSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const element = sectionRef.current;

        gsap.to(element, {
            yPercent: speed * 100,
            ease: "none",
            scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [speed]);

    return (
        <div ref={sectionRef} className={className}>
            {children}
        </div>
    );
}

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
}

export function ScrollReveal({
    children,
    className = "",
    direction = "up",
    delay = 0
}: ScrollRevealProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        const directions = {
            up: { y: 60, x: 0 },
            down: { y: -60, x: 0 },
            left: { y: 0, x: 60 },
            right: { y: 0, x: -60 },
        };

        const { x, y } = directions[direction];

        gsap.fromTo(
            element,
            {
                opacity: 0,
                y,
                x
            },
            {
                opacity: 1,
                y: 0,
                x: 0,
                duration: 1,
                delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [direction, delay]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
}
