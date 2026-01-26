"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
}

export function GlassCard({
    children,
    className = "",
    hover = false,
    glow = false
}: GlassCardProps) {
    return (
        <motion.div
            className={`
        glass-card p-6
        ${hover ? "card-hover" : ""}
        ${glow ? "glow-animate" : ""}
        ${className}
      `}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
        >
            {children}
        </motion.div>
    );
}

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`card p-6 ${className}`}>
            {children}
        </div>
    );
}
