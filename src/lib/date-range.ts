export function isWithinDateRange(dateValue: string | null | undefined, from: string, to: string) {
    if (!dateValue) return false;

    const normalizedDate = dateValue.slice(0, 10);

    if (from && normalizedDate < from) return false;
    if (to && normalizedDate > to) return false;

    return true;
}
