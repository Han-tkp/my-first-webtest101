"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface BentoItemProps {
    children: ReactNode;
    className?: string;
    span?: 1 | 2 | 3;
    rowSpan?: 1 | 2;
}

export function BentoItem({
    children,
    className = "",
    span = 1,
    rowSpan = 1
}: BentoItemProps) {
    const spanClass = span === 2 ? "bento-span-2" : span === 3 ? "bento-span-3" : "";
    const rowSpanClass = rowSpan === 2 ? "bento-row-2" : "";

    return (
        <motion.div
            className={`
        bento-item glass-card p-6 overflow-hidden
        ${spanClass} ${rowSpanClass} ${className}
      `}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
        >
            {children}
        </motion.div>
    );
}

interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
    return (
        <div className={`bento-grid ${className}`}>
            {children}
        </div>
    );
}
