"use client";

interface DateRangeFilterProps {
    from: string;
    to: string;
    fromLabel?: string;
    toLabel?: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
}

export function DateRangeFilter({
    from,
    to,
    fromLabel = "ตั้งแต่วันที่",
    toLabel = "ถึงวันที่",
    onFromChange,
    onToChange,
}: DateRangeFilterProps) {
    return (
        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:max-w-xl">
            <div>
                <label className="label">{fromLabel}</label>
                <input
                    type="date"
                    value={from}
                    onChange={(event) => onFromChange(event.target.value)}
                    className="form-input"
                />
            </div>
            <div>
                <label className="label">{toLabel}</label>
                <input
                    type="date"
                    value={to}
                    onChange={(event) => onToChange(event.target.value)}
                    className="form-input"
                />
            </div>
        </div>
    );
}
