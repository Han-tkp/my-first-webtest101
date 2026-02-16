import { ApiError } from '@/types';
import { ErrorCodes, ErrorMessages } from '@/constants';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    code: string;
    details?: Record<string, unknown>;

    constructor(code: string, message?: string, details?: Record<string, unknown>) {
        super(message || ErrorMessages[code] || 'เกิดข้อผิดพลาด');
        this.name = 'AppError';
        this.code = code;
        this.details = details;
    }
}

/**
 * Handle API errors and convert to AppError
 */
export function handleApiError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        return new AppError(ErrorCodes.SYSTEM_ERROR, error.message);
    }

    return new AppError(ErrorCodes.SYSTEM_ERROR);
}

/**
 * Format error for API response
 */
export function formatApiError(error: AppError): ApiError {
    return {
        code: error.code,
        message: error.message,
        details: error.details,
    };
}

/**
 * Log error to console (can be extended to use external logging service)
 */
export function logError(error: Error | AppError, context?: Record<string, unknown>): void {
    console.error('Error:', {
        name: error.name,
        message: error.message,
        code: error instanceof AppError ? error.code : 'UNKNOWN',
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Validate required fields
 */
export function validateRequired(
    data: Record<string, unknown>,
    fields: string[]
): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const field of fields) {
        if (!data[field] || data[field] === '') {
            missing.push(field);
        }
    }

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Format date to Thai locale
 */
export function formatDateThai(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d);
}

/**
 * Format datetime to Thai locale
 */
export function formatDateTimeThai(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
