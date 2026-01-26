"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30",
        secondary: "bg-white text-slate-900 hover:bg-slate-100 focus:ring-slate-300 shadow-lg",
        glass: "glass-button text-white hover:bg-white/20 focus:ring-white/30",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
            disabled={disabled || isLoading}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังโหลด...
                </span>
            ) : children}
        </motion.button>
    );
}
