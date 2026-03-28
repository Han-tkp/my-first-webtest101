"use client";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number) {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    const pages: number[] = [];

    for (let page = adjustedStart; page <= end; page += 1) {
        pages.push(page);
    }

    return pages;
}

export function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: PaginationControlsProps) {
    if (totalItems <= pageSize) {
        return null;
    }

    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">หน้า {currentPage} จาก {totalPages}</p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    ก่อนหน้า
                </button>

                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                            page === currentPage
                                ? "bg-[color:var(--color-primary)] text-white"
                                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    ถัดไป
                </button>
            </div>
        </div>
    );
}
