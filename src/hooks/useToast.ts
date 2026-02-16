import { useState, useCallback } from 'react';

interface ToastOptions {
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, options: ToastOptions = {}) => {
        const { type = 'info', duration = 3000 } = options;
        const id = Math.random().toString(36).substring(7);

        const toast: Toast = { id, message, type };
        setToasts((prev) => [...prev, toast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        success: (message: string) => showToast(message, { type: 'success' }),
        error: (message: string) => showToast(message, { type: 'error' }),
        warning: (message: string) => showToast(message, { type: 'warning' }),
        info: (message: string) => showToast(message, { type: 'info' }),
    };
}
