import { validateRequired, formatDateThai, debounce } from '@/utils';

describe('Utils', () => {
    describe('validateRequired', () => {
        it('should return valid when all required fields are present', () => {
            const data = { name: 'John', email: 'john@example.com' };
            const result = validateRequired(data, ['name', 'email']);
            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);
        });

        it('should return invalid when required fields are missing', () => {
            const data = { name: 'John' };
            const result = validateRequired(data, ['name', 'email']);
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('email');
        });

        it('should handle empty strings as missing', () => {
            const data = { name: '', email: 'test@example.com' };
            const result = validateRequired(data, ['name', 'email']);
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('name');
        });
    });

    describe('formatDateThai', () => {
        it('should format date to Thai locale', () => {
            const date = new Date('2024-01-01');
            const formatted = formatDateThai(date);
            expect(formatted).toContain('2024');
        });

        it('should handle string dates', () => {
            const formatted = formatDateThai('2024-01-01');
            expect(formatted).toBeTruthy();
        });
    });

    describe('debounce', () => {
        jest.useFakeTimers();

        it('should debounce function calls', () => {
            const func = jest.fn();
            const debouncedFunc = debounce(func, 1000);

            debouncedFunc();
            debouncedFunc();
            debouncedFunc();

            expect(func).not.toHaveBeenCalled();

            jest.runAllTimers();

            expect(func).toHaveBeenCalledTimes(1);
        });
    });
});
