"use client";

import { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "glass" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--color-background)]";

    const variants = {
        primary:
            "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-dark)] focus:ring-[color:var(--color-primary)] shadow-[0_12px_28px_rgba(31,66,91,0.2)]",
        secondary:
            "border border-[color:var(--color-border)] bg-[color:var(--color-secondary-soft)] text-[color:var(--color-secondary)] hover:bg-[#dce6d6] focus:ring-[color:var(--color-secondary)]",
        glass:
            "glass-button hover:border-[color:var(--color-border)] focus:ring-[color:var(--color-primary)]/30",
        danger:
            "bg-[color:var(--color-danger)] text-white hover:bg-[#93473f] focus:ring-[color:var(--color-danger)] shadow-[0_12px_28px_rgba(172,88,77,0.18)]",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-5 py-3 text-sm",
        lg: "px-6 py-3.5 text-base",
    };

    return (
        <motion.button
            className={[
                baseStyles,
                variants[variant],
                sizes[size],
                disabled || isLoading ? "cursor-not-allowed opacity-60" : "",
                className,
            ].join(" ")}
            disabled={disabled || isLoading}
            whileHover={{ scale: disabled ? 1 : 1.01, y: disabled ? 0 : -1 }}
            whileTap={{ scale: disabled ? 1 : 0.99 }}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    กำลังประมวลผล
                </span>
            ) : (
                children
            )}
        </motion.button>
    );
}
