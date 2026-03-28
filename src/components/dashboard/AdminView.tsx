"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useListPagination } from "@/hooks/useListPagination";
import { getEquipmentCategory, KNOWN_EQUIPMENT_TYPES } from "@/lib/equipment-catalog";

interface Equipment {
    id: number;
    name: string;
    type: string;
    serial: string;
    status: string;
    image_url?: string | null;
}

interface Profile {
    id: string;
    email: string;
    full_name: string;
    agency: string;
    phone: string;
    role: string;
    status: string;
    created_at?: string;
}

const statusLabels: Record<string, { text: string; color: string }> = {
    available: { text: "ว่าง", color: "border border-emerald-100 bg-emerald-50 text-emerald-700" },
    reserved: { text: "จองแล้ว", color: "border border-sky-100 bg-sky-50 text-sky-700" },
    borrowed: { text: "ถูกยืม", color: "border border-indigo-100 bg-indigo-50 text-indigo-700" },
    under_maintenance: { text: "ซ่อมบำรุง", color: "border border-amber-100 bg-amber-50 text-amber-700" },
    pending_repair_approval: { text: "รออนุมัติซ่อม", color: "border border-rose-100 bg-rose-50 text-rose-700" },
};

const roleLabels: Record<string, { text: string; color: string }> = {
    admin: { text: "ผู้ดูแลระบบ", color: "border border-rose-100 bg-rose-50 text-rose-700" },
    approver: { text: "ผู้อนุมัติ", color: "border border-amber-100 bg-amber-50 text-amber-700" },
    technician: { text: "ช่างเทคนิค", color: "border border-sky-100 bg-sky-50 text-sky-700" },
    user: { text: "ผู้ใช้งานทั่วไป", color: "border border-slate-200 bg-slate-100 text-slate-700" },
};

const userStatusLabels: Record<string, { text: string; color: string }> = {
    active: { text: "ใช้งาน", color: "border border-emerald-100 bg-emerald-50 text-emerald-700" },
    pending_approval: { text: "รออนุมัติ", color: "border border-amber-100 bg-amber-50 text-amber-700" },
    suspended: { text: "ระงับ", color: "border border-rose-100 bg-rose-50 text-rose-700" },
};

const defaultForm = { name: "", type: "", serial: "", image_url: "", status: "available" };

interface Repair {
    id: number;
    equipment_id: number;
    equipment_name: string;
    damage_description: string;
    status: string;
    request_date: string;
    cost?: number;
}

function sortThai(values: string[]) {
    return [...values].sort((a, b) => a.localeCompare(b, "th"));
}

export default function AdminView() {
    const [activeTab, setActiveTab] = useState<"equipment" | "users" | "repairs">("equipment");
    const [userViewMode, setUserViewMode] = useState<"grid" | "table">("grid");
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [equipmentError, setEquipmentError] = useState("");

    const [users, setUsers] = useState<Profile[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState("all");
    const [roleChangeUser, setRoleChangeUser] = useState<string | null>(null);
    const [userActionLoading, setUserActionLoading] = useState<string | null>(null);

    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [userForm, setUserForm] = useState({ full_name: "", email: "", password: "", agency: "", phone: "", role: "user" });
    const [userFormError, setUserFormError] = useState("");
    const [userFormLoading, setUserFormLoading] = useState(false);
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
    const defaultUserForm = { full_name: "", email: "", password: "", agency: "", phone: "", role: "user" };

    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [repairSearch, setRepairSearch] = useState("");
    const [repairStatusFilter, setRepairStatusFilter] = useState("all");

    const loadEquipment = async () => {
        const response = await fetch("/api/equipment", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Equipment[];
        setEquipment(data);
    };

    const loadUsers = async () => {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Profile[];
        setUsers(data);
    };

    const loadRepairs = async () => {
        const response = await fetch("/api/repairs", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Repair[];
        setRepairs(data);
    };

    useEffect(() => {
        loadEquipment();
        loadUsers();
        loadRepairs();
    }, []);

    const availableTypes = useMemo(() => sortThai(Array.from(new Set(equipment.map((item) => item.type)))), [equipment]);

    const filteredEquipment = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return equipment.filter((item) => {
            const matchSearch =
                !keyword ||
                String(item.id).includes(keyword) ||
                item.name.toLowerCase().includes(keyword) ||
                item.serial.toLowerCase().includes(keyword) ||
                item.type.toLowerCase().includes(keyword);
            const matchStatus = statusFilter === "all" || item.status === statusFilter;
            const matchType = typeFilter === "all" || item.type === typeFilter;
            return matchSearch && matchStatus && matchType;
        });
    }, [equipment, search, statusFilter, typeFilter]);

    const equipmentPagination = useListPagination(filteredEquipment);

    const paginatedEquipmentGroups = useMemo(() => {
        const grouped = new Map<string, Equipment[]>();

        equipmentPagination.paginatedItems.forEach((item) => {
            const current = grouped.get(item.type) || [];
            current.push(item);
            grouped.set(item.type, current);
        });

        return sortThai(Array.from(grouped.keys())).map((type) => ({
            type,
            category: getEquipmentCategory(type),
            items: grouped.get(type) || [],
        }));
    }, [equipmentPagination.paginatedItems]);

    const total = equipment.length;
    const available = equipment.filter((item) => item.status === "available").length;
    const borrowed = equipment.filter((item) => item.status === "borrowed" || item.status === "reserved").length;
    const maintenance = equipment.filter((item) => ["under_maintenance", "pending_repair_approval"].includes(item.status)).length;

    const openModal = (item?: Equipment) => {
        setEquipmentError("");
        if (item) {
            setEditingId(item.id);
            setForm({
                name: item.name,
                type: item.type,
                serial: item.serial,
                image_url: item.image_url || "",
                status: item.status,
            });
        } else {
            setEditingId(null);
            setForm(defaultForm);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(defaultForm);
        setEquipmentError("");
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.type.trim() || !form.serial.trim()) {
            setEquipmentError("กรุณากรอกชื่อเครื่อง ประเภท และเลขครุภัณฑ์/เลขเครื่องให้ครบ");
            return;
        }

        setIsLoading(true);
        setEquipmentError("");

        const payload = {
            name: form.name.trim(),
            type: form.type.trim(),
            serial: form.serial.trim(),
            image_url: form.image_url.trim() || null,
            ...(editingId ? { status: form.status } : {}),
        };

        const response = await fetch(editingId ? `/api/equipment/${editingId}` : "/api/equipment", {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingId ? payload : { ...payload, status: "available" }),
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: "ไม่สามารถบันทึกข้อมูลได้" }));
            setEquipmentError(result.error || "ไม่สามารถบันทึกข้อมูลได้");
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        closeModal();
        await loadEquipment();
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: "ไม่สามารถลบรายการได้" }));
            setEquipmentError(result.error || "ไม่สามารถลบรายการได้");
            return;
        }

        setDeleteConfirm(null);
        await loadEquipment();
    };

    const filteredUsers = useMemo(() => {
        const keyword = userSearch.trim().toLowerCase();
        return users.filter((user) => {
            const matchSearch =
                !keyword ||
                user.full_name.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword) ||
                (user.agency || "").toLowerCase().includes(keyword);
            const matchStatus = userStatusFilter === "all" || user.status === userStatusFilter;
            return matchSearch && matchStatus;
        });
    }, [userSearch, userStatusFilter, users]);

    const userPagination = useListPagination(filteredUsers);

    const pendingCount = users.filter((user) => user.status === "pending_approval").length;
    const activeCount = users.filter((user) => user.status === "active").length;
    const suspendedCount = users.filter((user) => user.status === "suspended").length;

    const handleApproveUser = async (userId: string) => {
        setUserActionLoading(userId);
        await fetch(`/api/users/${userId}/approve`, { method: "POST" });
        await loadUsers();
        setUserActionLoading(null);
    };

    const handleRejectUser = async (userId: string) => {
        setUserActionLoading(userId);
        await fetch(`/api/users/${userId}/reject`, { method: "POST" });
        await loadUsers();
        setUserActionLoading(null);
    };

    const openEditUser = (user: Profile) => {
        setEditingUserId(user.id);
        setUserForm({ full_name: user.full_name, email: user.email, password: "", agency: user.agency || "", phone: user.phone || "", role: user.role });
        setUserFormError("");
        setShowUserPassword(false);
        setShowUserModal(true);
    };

    const openCreateUser = () => {
        setEditingUserId(null);
        setUserForm(defaultUserForm);
        setUserFormError("");
        setShowUserPassword(false);
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        if (!userForm.full_name.trim() || !userForm.email.trim()) {
            setUserFormError("กรุณากรอกชื่อและอีเมลให้ครบถ้วน");
            return;
        }
        if (!editingUserId && !userForm.password) {
            setUserFormError("กรุณากรอกรหัสผ่าน");
            return;
        }
        if (userForm.password && userForm.password.length < 8) {
            setUserFormError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            return;
        }
        setUserFormLoading(true);
        setUserFormError("");

        if (editingUserId) {
            // Edit existing user
            const response = await fetch(`/api/users/${editingUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: userForm.full_name.trim(), agency: userForm.agency.trim(), phone: userForm.phone.trim(), role: userForm.role }),
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({ error: "ไม่สามารถแก้ไขผู้ใช้งานได้" }));
                setUserFormError(result.error || "ไม่สามารถแก้ไขผู้ใช้งานได้");
                setUserFormLoading(false);
                return;
            }
        } else {
            // Create new user
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userForm),
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({ error: "ไม่สามารถสร้างผู้ใช้งานได้" }));
                setUserFormError(result.error || "ไม่สามารถสร้างผู้ใช้งานได้");
                setUserFormLoading(false);
                return;
            }
        }
        setUserFormLoading(false);
        setShowUserModal(false);
        setUserForm(defaultUserForm);
        setEditingUserId(null);
        setUserFormError("");
        await loadUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        setUserActionLoading(userId);
        const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: "ไม่สามารถลบผู้ใช้งานได้" }));
            alert(result.error || "ไม่สามารถลบผู้ใช้งานได้");
        }
        setDeleteUserConfirm(null);
        await loadUsers();
        setUserActionLoading(null);
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setUserActionLoading(userId);
        await fetch(`/api/users/${userId}/role`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        });
        setRoleChangeUser(null);
        await loadUsers();
        setUserActionLoading(null);
    };

    const handleApproveRepair = async (repair: Repair) => {
        setUserActionLoading(String(repair.id));
        await fetch(`/api/repairs/${repair.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "repair_approved" }),
        });
        await loadRepairs();
        await loadEquipment();
        setUserActionLoading(null);
    };

    const handleRejectRepair = async (repair: Repair) => {
        setUserActionLoading(String(repair.id));
        await fetch(`/api/repairs/${repair.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "repair_rejected" }),
        });
        await loadRepairs();
        await loadEquipment();
        setUserActionLoading(null);
    };

    const filteredRepairs = useMemo(() => {
        const keyword = repairSearch.trim().toLowerCase();
        return repairs.filter((r) => {
            const matchSearch = !keyword || 
                r.equipment_name.toLowerCase().includes(keyword) || 
                r.damage_description.toLowerCase().includes(keyword);
            const matchStatus = repairStatusFilter === "all" || r.status === repairStatusFilter;
            return matchSearch && matchStatus;
        });
    }, [repairs, repairSearch, repairStatusFilter]);

    const repairPagination = useListPagination(filteredRepairs);
    const pendingRepairCount = repairs.filter(r => r.status === "pending_repair_approval").length;

    return (
        <div className="space-y-5 fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveTab("equipment")} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${activeTab === "equipment" ? "brand-tab-active" : "brand-tab-idle"}`}>
                        จัดการครุภัณฑ์
                    </button>
                    <button onClick={() => setActiveTab("users")} className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition ${activeTab === "users" ? "brand-tab-active" : "brand-tab-idle"}`}>
                        จัดการผู้ใช้งาน
                        {pendingCount > 0 ? <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{pendingCount}</span> : null}
                    </button>
                    <button onClick={() => setActiveTab("repairs")} className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition ${activeTab === "repairs" ? "brand-tab-active" : "brand-tab-idle"}`}>
                        จัดการงานซ่อม
                        {pendingRepairCount > 0 ? <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white">{pendingRepairCount}</span> : null}
                    </button>
                </div>
                {activeTab === "users" && <Button variant="primary" onClick={openCreateUser} className="w-full justify-center sm:w-auto">+ เพิ่มผู้ใช้งานใหม่</Button>}
                {activeTab === "equipment" && <Button variant="primary" onClick={() => openModal()} className="w-full justify-center sm:w-auto">+ เพิ่มเครื่องใหม่</Button>}
            </div>

            {activeTab === "equipment" && (
                <>
                    <BentoGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <BentoItem className="border border-slate-200 bg-white"><p className="text-xs text-slate-500">เครื่องทั้งหมด</p><p className="mt-1 text-2xl font-bold">{total}</p></BentoItem>
                        <BentoItem className="tone-success"><p className="text-xs text-slate-500">พร้อมใช้งาน</p><p className="mt-1 text-2xl font-bold">{available}</p></BentoItem>
                        <BentoItem className="tone-info"><p className="text-xs text-slate-500">กำลังถูกใช้/จอง</p><p className="mt-1 text-2xl font-bold">{borrowed}</p></BentoItem>
                        <BentoItem className="tone-warning"><p className="text-xs text-slate-500">รอซ่อม/ซ่อมบำรุง</p><p className="mt-1 text-2xl font-bold">{maintenance}</p></BentoItem>
                    </BentoGrid>

                    <GlassCard>
                        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">ทะเบียนครุภัณฑ์รายเครื่อง</h2>
                                <p className="mt-1 text-sm text-slate-500">จัดกลุ่มตามประเภทเครื่อง และจัดการรายเครื่องด้วยรหัสระบบกับเลขครุภัณฑ์/เลขเครื่อง</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-select w-full text-sm">
                                    <option value="all">ทุกสถานะ</option>
                                    <option value="available">ว่าง</option>
                                    <option value="borrowed">ถูกยืม</option>
                                    <option value="reserved">จองแล้ว</option>
                                    <option value="under_maintenance">ซ่อมบำรุง</option>
                                    <option value="pending_repair_approval">รออนุมัติซ่อม</option>
                                </select>
                                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="form-select w-full text-sm">
                                    <option value="all">ทุกประเภท</option>
                                    {availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>

                        <ListToolbar searchValue={search} onSearchChange={setSearch} pageSize={equipmentPagination.pageSize} onPageSizeChange={equipmentPagination.setPageSize} resultCount={equipmentPagination.totalItems} placeholder="ค้นหารหัสระบบ เลขครุภัณฑ์ เลขเครื่อง ชื่อเครื่อง หรือประเภท" />

                        {equipmentError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{equipmentError}</div> : null}

                        <div className="mt-6 space-y-6 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                            {paginatedEquipmentGroups.length > 0 ? paginatedEquipmentGroups.map((group) => (
                                <section key={group.type} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-4"><h3 className="text-lg font-semibold text-slate-900">{group.type}</h3><p className="text-sm text-slate-500">{group.category} • {group.items.length} เครื่องในหน้านี้</p></div>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3 font-medium">ภาพ</th><th className="px-4 py-3 font-medium">รหัสระบบ</th><th className="px-4 py-3 font-medium">เลขครุภัณฑ์ / เลขเครื่อง</th><th className="px-4 py-3 font-medium">ชื่อรายการ</th><th className="px-4 py-3 font-medium">สถานะ</th><th className="px-4 py-3 text-right font-medium">จัดการ</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {group.items.map((item) => {
                                                    const status = statusLabels[item.status] || { text: item.status, color: "border border-slate-200 bg-slate-100 text-slate-700" };
                                                    return (
                                                        <tr key={item.id} className="align-top">
                                                            <td className="px-4 py-3"><EquipmentImage src={item.image_url} alt={item.name} className="h-14 w-14 rounded-2xl border border-slate-200" imageClassName="object-cover" labelClassName="text-[10px]" sizes="56px" /></td>
                                                            <td className="px-4 py-3 font-medium text-slate-700">#{item.id}</td>
                                                            <td className="px-4 py-3 text-slate-700">{item.serial}</td>
                                                            <td className="px-4 py-3 text-slate-700">{item.name}</td>
                                                            <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>{status.text}</span></td>
                                                            <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => openModal(item)} className="action-soft px-3 py-1.5 text-xs">แก้ไข</button>{deleteConfirm === item.id ? <><button onClick={() => handleDelete(item.id)} className="action-danger px-3 py-1.5 text-xs">ยืนยันลบ</button><button onClick={() => setDeleteConfirm(null)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50">ยกเลิก</button></> : <button onClick={() => setDeleteConfirm(item.id)} className="tone-danger rounded-xl px-3 py-1.5 text-xs font-medium">ลบ</button>}</div></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )) : <div className="py-12 text-center text-slate-500">{search || statusFilter !== "all" || typeFilter !== "all" ? "ไม่พบรายการเครื่องที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีข้อมูลเครื่องในระบบ"}</div>}
                        </div>

                        <div className="mt-6"><PaginationControls currentPage={equipmentPagination.currentPage} totalPages={equipmentPagination.totalPages} totalItems={equipmentPagination.totalItems} pageSize={equipmentPagination.pageSize} onPageChange={equipmentPagination.setCurrentPage} /></div>
                    </GlassCard>
                </>
            )}

            {activeTab === "users" && (
                <>
                    <BentoGrid className="grid-cols-1 sm:grid-cols-3">
                        <BentoItem className="tone-warning"><p className="text-xs text-slate-500">รออนุมัติ</p><p className="mt-1 text-2xl font-bold">{pendingCount}</p></BentoItem>
                        <BentoItem className="tone-success"><p className="text-xs text-slate-500">ใช้งาน</p><p className="mt-1 text-2xl font-bold">{activeCount}</p></BentoItem>
                        <BentoItem className="tone-danger"><p className="text-xs text-slate-500">ถูกระงับ</p><p className="mt-1 text-2xl font-bold">{suspendedCount}</p></BentoItem>
                    </BentoGrid>

                    <GlassCard>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-bold">รายชื่อผู้ใช้งานทั้งหมด</h2>
                            <select value={userStatusFilter} onChange={(event) => setUserStatusFilter(event.target.value)} className="form-select w-full text-sm sm:w-56">
                                <option value="all">ทุกสถานะ</option>
                                <option value="pending_approval">รออนุมัติ</option>
                                <option value="active">ใช้งาน</option>
                                <option value="suspended">ถูกระงับ</option>
                            </select>
                        </div>

                        <ListToolbar searchValue={userSearch} onSearchChange={setUserSearch} pageSize={userPagination.pageSize} onPageSizeChange={userPagination.setPageSize} resultCount={userPagination.totalItems} placeholder="ค้นหาชื่อ อีเมล หรือหน่วยงาน" viewMode={userViewMode} onViewModeChange={setUserViewMode} />

                        {userViewMode === "table" ? (
                            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50 text-left text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">ชื่อ</th>
                                            <th className="px-4 py-3 font-medium">อีเมล</th>
                                            <th className="px-4 py-3 font-medium">หน่วยงาน</th>
                                            <th className="px-4 py-3 font-medium">บทบาท</th>
                                            <th className="px-4 py-3 font-medium">สถานะ</th>
                                            <th className="px-4 py-3 font-medium">ลงทะเบียน</th>
                                            <th className="px-4 py-3 text-right font-medium">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {userPagination.paginatedItems.length > 0 ? userPagination.paginatedItems.map((user) => {
                                            const role = roleLabels[user.role] || { text: user.role, color: "border border-slate-200 bg-slate-100 text-slate-700" };
                                            const status = userStatusLabels[user.status] || { text: user.status, color: "border border-slate-200 bg-slate-100 text-slate-700" };
                                            const isActioning = userActionLoading === user.id;
                                            return (
                                                <tr key={user.id}>
                                                    <td className="px-4 py-3 font-medium text-slate-700">{user.full_name}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.agency || "-"}</td>
                                                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${role.color}`}>{role.text}</span></td>
                                                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${status.color}`}>{status.text}</span></td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{user.created_at ? new Date(user.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) : "-"}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap justify-end gap-1">
                                                            <button onClick={() => openEditUser(user)} className="action-soft px-2 py-1 text-xs">แก้ไข</button>
                                                            {user.status === "pending_approval" ? <button onClick={() => handleApproveUser(user.id)} disabled={isActioning} className="tone-success rounded-lg px-2 py-1 text-xs font-medium disabled:opacity-50">{isActioning ? "..." : "อนุมัติ"}</button> : null}
                                                            {deleteUserConfirm === user.id ? <><button onClick={() => handleDeleteUser(user.id)} disabled={isActioning} className="action-danger px-2 py-1 text-xs">{isActioning ? "..." : "ยืนยันลบ"}</button><button onClick={() => setDeleteUserConfirm(null)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-slate-50">ยกเลิก</button></> : <button onClick={() => setDeleteUserConfirm(user.id)} className="tone-danger rounded-lg px-2 py-1 text-xs font-medium">ลบ</button>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">{userSearch || userStatusFilter !== "all" ? "ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีผู้ใช้งานในระบบ"}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                        <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                            {userPagination.paginatedItems.map((user) => {
                                const role = roleLabels[user.role] || { text: user.role, color: "border border-slate-200 bg-slate-100 text-slate-700" };
                                const status = userStatusLabels[user.status] || { text: user.status, color: "border border-slate-200 bg-slate-100 text-slate-700" };
                                const isActioning = userActionLoading === user.id;
                                return (
                                    <div key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{user.full_name}</p><span className={`rounded-full px-2 py-0.5 text-xs ${role.color}`}>{role.text}</span><span className={`rounded-full px-2 py-0.5 text-xs ${status.color}`}>{status.text}</span></div>
                                                <p className="truncate text-sm text-slate-500">{user.email}</p>
                                                <p className="text-xs text-slate-400">{user.agency || "-"} | {user.phone || "-"}</p>
                                                <p className="mt-1 text-xs text-slate-300">ID: {user.id}{user.created_at ? ` | ลงทะเบียน: ${new Date(user.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}` : ""}</p>
                                            </div>
                                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                <button onClick={() => openEditUser(user)} className="action-soft px-3 py-1.5 text-xs">แก้ไข</button>
                                                {user.status === "pending_approval" ? <><button onClick={() => handleApproveUser(user.id)} disabled={isActioning} className="tone-success rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50">{isActioning ? "..." : "อนุมัติ"}</button><button onClick={() => handleRejectUser(user.id)} disabled={isActioning} className="tone-danger rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50">{isActioning ? "..." : "ปฏิเสธ"}</button></> : null}
                                                {user.status === "active" ? <button onClick={() => handleRejectUser(user.id)} disabled={isActioning} className="tone-danger rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50">{isActioning ? "..." : "ระงับ"}</button> : null}
                                                {user.status === "suspended" ? <button onClick={() => handleApproveUser(user.id)} disabled={isActioning} className="tone-success rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50">{isActioning ? "..." : "เปิดใช้งาน"}</button> : null}
                                                {user.status === "active" ? (roleChangeUser === user.id ? <div className="flex flex-wrap gap-1">{["user", "approver", "technician", "admin"].map((roleValue) => <button key={roleValue} onClick={() => handleChangeRole(user.id, roleValue)} disabled={roleValue === user.role || isActioning} className={`rounded-lg px-2 py-1 text-xs transition ${roleValue === user.role ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400" : "action-soft"}`}>{roleLabels[roleValue]?.text || roleValue}</button>)}<button onClick={() => setRoleChangeUser(null)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50">ปิด</button></div> : <button onClick={() => setRoleChangeUser(user.id)} className="action-soft px-3 py-1.5 text-xs">เปลี่ยน Role</button>) : null}
                                                {deleteUserConfirm === user.id ? <><button onClick={() => handleDeleteUser(user.id)} disabled={isActioning} className="action-danger px-3 py-1.5 text-xs">{isActioning ? "..." : "ยืนยันลบ"}</button><button onClick={() => setDeleteConfirm(null)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50">ยกเลิก</button></> : <button onClick={() => setDeleteUserConfirm(user.id)} className="tone-danger rounded-xl px-3 py-1.5 text-xs font-medium">ลบ</button>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {userPagination.paginatedItems.length === 0 ? <div className="py-12 text-center text-slate-500">{userSearch || userStatusFilter !== "all" ? "ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีผู้ใช้งานในระบบ"}</div> : null}
                        </div>
                        )}

                        <div className="mt-6"><PaginationControls currentPage={userPagination.currentPage} totalPages={userPagination.totalPages} totalItems={userPagination.totalItems} pageSize={userPagination.pageSize} onPageChange={userPagination.setCurrentPage} /></div>
                    </GlassCard>
                </>
            )}

            {activeTab === "repairs" && (
                <>
                    <BentoGrid className="grid-cols-1 sm:grid-cols-3">
                        <BentoItem className="tone-warning">
                            <p className="text-xs text-slate-500">รออนุมัติซ่อม</p>
                            <p className="mt-1 text-2xl font-bold">{pendingRepairCount}</p>
                        </BentoItem>
                        <BentoItem className="tone-info">
                            <p className="text-xs text-slate-500">กำลังซ่อม</p>
                            <p className="mt-1 text-2xl font-bold">{repairs.filter(r => r.status === "repair_approved").length}</p>
                        </BentoItem>
                        <BentoItem className="tone-success">
                            <p className="text-xs text-slate-500">ซ่อมเสร็จแล้ว</p>
                            <p className="mt-1 text-2xl font-bold">{repairs.filter(r => r.status === "completed").length}</p>
                        </BentoItem>
                    </BentoGrid>

                    <GlassCard>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-bold">รายการแจ้งซ่อมทั้งหมด</h2>
                            <select value={repairStatusFilter} onChange={(e) => setRepairStatusFilter(e.target.value)} className="form-select w-full text-sm sm:w-56">
                                <option value="all">ทุกสถานะ</option>
                                <option value="pending_repair_approval">รออนุมัติ</option>
                                <option value="repair_approved">อนุมัติแล้ว/กำลังซ่อม</option>
                                <option value="completed">เสร็จสิ้น</option>
                                <option value="repair_rejected">ไม่อนุมัติ</option>
                            </select>
                        </div>

                        <ListToolbar searchValue={repairSearch} onSearchChange={setRepairSearch} pageSize={repairPagination.pageSize} onPageSizeChange={repairPagination.setPageSize} resultCount={repairPagination.totalItems} placeholder="ค้นหาชื่ออุปกรณ์ หรืออาการเสีย" />

                        <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                            {repairPagination.paginatedItems.map((repair) => {
                                const status = statusLabels[repair.status] || { text: repair.status, color: "border border-slate-200 bg-slate-100 text-slate-700" };
                                const isActioning = userActionLoading === String(repair.id);
                                return (
                                    <div key={repair.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold">{repair.equipment_name}</p>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs ${status.color}`}>{status.text}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{repair.damage_description}</p>
                                                <p className="text-xs text-slate-400 mt-1">วันที่แจ้ง: {new Date(repair.request_date).toLocaleDateString("th-TH")}</p>
                                            </div>
                                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                {repair.status === "pending_repair_approval" && (
                                                    <>
                                                        <button onClick={() => handleApproveRepair(repair)} disabled={isActioning} className="tone-success rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50">
                                                            {isActioning ? "..." : "อนุมัติการซ่อม"}
                                                        </button>
                                                        <button onClick={() => handleRejectRepair(repair)} disabled={isActioning} className="tone-danger rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50">
                                                            {isActioning ? "..." : "ไม่อนุมัติ"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {repairPagination.paginatedItems.length === 0 ? <div className="py-12 text-center text-slate-500">ไม่พบรายการแจ้งซ่อม</div> : null}
                        </div>

                        <div className="mt-6">
                            <PaginationControls currentPage={repairPagination.currentPage} totalPages={repairPagination.totalPages} totalItems={repairPagination.totalItems} pageSize={repairPagination.pageSize} onPageChange={repairPagination.setCurrentPage} />
                        </div>
                    </GlassCard>
                </>

            )}

            {showModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={closeModal} />
                    <div className="glass-card relative w-full max-w-lg space-y-5 bg-white p-6">
                        <h3 className="text-xl font-bold">{editingId ? "แก้ไขข้อมูลเครื่อง" : "เพิ่มเครื่องใหม่"}</h3>
                        <ImageUpload currentImageUrl={form.image_url || null} onImageUploaded={(url) => setForm({ ...form, image_url: url })} folder="equipment" />
                        {equipmentError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{equipmentError}</div> : null}
                        <div><label className="mb-1 block text-sm font-medium">ชื่อรายการเครื่อง</label><input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="เช่น เครื่องพ่นหมอกควัน ยี่ห้อ SWING FOG SN 50" className="form-input" /></div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">ประเภท / รุ่นเครื่อง</label>
                                <input list="equipment-type-options" type="text" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} placeholder="เลือกหรือพิมพ์ประเภทเครื่อง" className="form-input" />
                                <datalist id="equipment-type-options">{KNOWN_EQUIPMENT_TYPES.map((type) => <option key={type} value={type} />)}</datalist>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">เลขครุภัณฑ์ / เลขเครื่อง</label>
                                <input type="text" value={form.serial} onChange={(event) => setForm({ ...form, serial: event.target.value })} placeholder="เช่น 0334 0418 0045" className="form-input" />
                            </div>
                        </div>
                        {editingId ? <div><label className="mb-1 block text-sm font-medium">สถานะเครื่อง</label><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="form-select w-full text-sm"><option value="available">ว่าง</option><option value="reserved">จองแล้ว</option><option value="borrowed">ถูกยืม</option><option value="under_maintenance">ซ่อมบำรุง</option><option value="pending_repair_approval">รออนุมัติซ่อม</option></select></div> : null}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">การเพิ่ม แก้ไข และลบเครื่อง จะอ้างอิงรายเครื่องจาก <strong>รหัสระบบ</strong> และบังคับไม่ให้เลขครุภัณฑ์/เลขเครื่องซ้ำกัน</div>
                        <div className="flex gap-3 pt-2"><Button variant="primary" className="flex-1" onClick={handleSave} isLoading={isLoading}>{editingId ? "บันทึกการแก้ไข" : "เพิ่มเครื่อง"}</Button><Button variant="glass" onClick={closeModal}>ยกเลิก</Button></div>
                    </div>
                </div>
            ) : null}

            {showUserModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
                    <div className="glass-card relative w-full max-w-lg space-y-5 bg-white p-6">
                        <h3 className="text-xl font-bold">{editingUserId ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</h3>
                        {userFormError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{userFormError}</div> : null}
                        <div><label className="mb-1 block text-sm font-medium">ชื่อ-นามสกุล *</label><input type="text" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} placeholder="ชื่อ นามสกุล" className="form-input" /></div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div><label className="mb-1 block text-sm font-medium">อีเมล {editingUserId ? "" : "*"}</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="example@email.com" className="form-input" disabled={!!editingUserId} /></div>
                            {!editingUserId ? <div><label className="mb-1 block text-sm font-medium">รหัสผ่าน *</label><div className="relative"><input type={showUserPassword ? "text" : "password"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="อย่างน้อย 8 ตัวอักษร" className="form-input pr-12" /><button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600" tabIndex={-1}>{showUserPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div> : null}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div><label className="mb-1 block text-sm font-medium">หน่วยงาน</label><input type="text" value={userForm.agency} onChange={(e) => setUserForm({ ...userForm, agency: e.target.value })} placeholder="สคร. / รพ. / อื่นๆ" className="form-input" /></div>
                            <div><label className="mb-1 block text-sm font-medium">เบอร์โทรศัพท์</label><input type="tel" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} placeholder="0812345678" className="form-input" /></div>
                        </div>
                        <div><label className="mb-1 block text-sm font-medium">บทบาท *</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="form-select w-full">
                            <option value="user">ผู้ใช้งานทั่วไป</option>
                            <option value="technician">ช่างเทคนิค</option>
                            <option value="approver">ผู้อนุมัติ</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                        </select></div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{editingUserId ? "การแก้ไขจะมีผลทันทีหลังกดบันทึก" : <>ผู้ใช้ที่สร้างโดย Admin จะมีสถานะ <strong>ใช้งาน (Active)</strong> ทันที ไม่ต้องรอการอนุมัติ</>}</div>
                        <div className="flex gap-3 pt-2"><Button variant="primary" className="flex-1" onClick={handleSaveUser} isLoading={userFormLoading}>{editingUserId ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้งาน"}</Button><Button variant="glass" onClick={() => setShowUserModal(false)}>ยกเลิก</Button></div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
