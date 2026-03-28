"use client";

import { LayoutGrid, List, Search } from "lucide-react";

type ViewMode = "grid" | "table";

interface ListToolbarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    pageSize: number;
    onPageSizeChange: (value: number) => void;
    resultCount: number;
    placeholder?: string;
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
}

export function ListToolbar({
    searchValue,
    onSearchChange,
    pageSize,
    onPageSizeChange,
    resultCount,
    placeholder = "ค้นหารายการ",
    viewMode,
    onViewModeChange,
}: ListToolbarProps) {
    return (
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={placeholder}
                    className="form-input form-input-icon"
                />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-500">พบ {resultCount.toLocaleString()} รายการ</p>

                {viewMode && onViewModeChange ? (
                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <button
                            type="button"
                            onClick={() => onViewModeChange("grid")}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition ${
                                viewMode === "grid"
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            การ์ด
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange("table")}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition ${
                                viewMode === "table"
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                            aria-label="Table view"
                        >
                            <List className="h-3.5 w-3.5" />
                            ตาราง
                        </button>
                    </div>
                ) : null}

                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-500">แสดง</label>
                    <select
                        value={pageSize}
                        onChange={(event) => onPageSizeChange(Number(event.target.value))}
                        className="form-select min-w-24 py-2 text-sm"
                    >
                        {[20, 40, 60, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
