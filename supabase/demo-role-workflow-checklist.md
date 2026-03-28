# Demo Role Workflow Checklist

Use this after running [seed-role-workflow-demo.sql](supabase/seed-role-workflow-demo.sql).

## Setup

1. Run the latest schema in [migration.sql](supabase/migration.sql) if this is a fresh database.
2. Create auth users in Supabase Dashboard → Authentication → Users → Add user:

   | Role       | Email               | Password     |
   |------------|---------------------|--------------|
   | Admin      | admin@gmail.com     | Admin1234    |
   | Approver   | approver@gmail.com  | Approver1234 |
   | Technician | tech@gmail.com      | Tech1234     |
   | User       | user@gmail.com      | User1234     |

   Check "Auto Confirm User" for each.

3. Run [seed-role-workflow-demo.sql](supabase/seed-role-workflow-demo.sql) in SQL Editor.
   The seed reads `auth.users` to create matching `profiles` rows automatically.

## Login Accounts

- `admin@gmail.com`
- `approver@gmail.com`
- `tech@gmail.com`
- `user@gmail.com`

## What Should Appear

### Admin

- Equipment overview: mixed statuses — `available`, `reserved`, `borrowed`, `under_maintenance`, `pending_repair_approval`.
- Users tab:
  - 4 active core accounts (admin, approver, tech, user)
  - 3 active demo field users
  - 2 `pending_approval` profiles
  - 1 `suspended` profile
- Notifications: system overview, suspended user alert, equipment availability alert.

### Approver

- Pending user approvals: **2** (สมชาย, สมหญิง)
- Pending borrows: **2** (from user + field user)
- Pending repairs: **3** (damaged return + tech report + monthly inspection)
- Reports: borrow and repair history with non-empty export data.

### Technician

- Pending delivery: **2** items
- Active borrowed (return queue): **3** items, including **1 overdue**
- Active approved repairs: **2** items
- Notifications: delivery queue, overdue alert, repair assignments.

### User (user@gmail.com)

- Dashboard active requests:
  - 1 pending_borrow_approval
  - 1 pending_delivery
  - 2 borrowed
- History:
  - returned (normal)
  - returned_late
  - returned_early (by field user)
  - returned_damaged (by field user)
- Notifications: approval pending, approved, delivered, returned, returned late.

## Key Design Points

- `profiles.id` MUST equal `auth.users.id`. The seed uses `INSERT ... SELECT FROM auth.users ... ON CONFLICT` to guarantee this.
- All API actions return JSON (`{ success: true }`) — no `redirect()`.
- Pending borrows do NOT reserve equipment. Reservation happens on approval.
- Repair rejection returns equipment to `available`.
- Dummy profiles (demo.*.example.com) appear in admin/approver queues but cannot log in.
- All demo data is tagged with `[DEMO]` prefix for easy cleanup.

## CRUD Coverage

| Entity    | Create | Read | Update (status changes)                          |
|-----------|--------|------|--------------------------------------------------|
| Profiles  | seed   | all  | pending_approval → active, active → suspended    |
| Equipment | seed   | all  | available ↔ reserved ↔ borrowed ↔ under_maintenance |
| Borrows   | seed   | all  | pending → delivery → borrowed → returned/late/early/damaged |
| Repairs   | seed   | all  | pending → approved → completed / rejected        |
| Notifications | seed | all | read/unread, in_app + email delivery logs        |
