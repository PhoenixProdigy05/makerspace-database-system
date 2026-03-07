# Makerspace Management System - Implementation Analysis
## Executive Summary

This document describes the current implementation of the Makerspace Management System as of 2025‑11‑16,
based on the actual backend, frontend, database, and Docker configuration in the `System` folder.

Core features are implemented end‑to‑end:

- Authentication and authorization (JWT, Spring Security, role-based access).
- User management (Admin/Staff/Member roles, notification preferences).
- Inventory management with low‑stock detection and SKU uniqueness.
- Attachments (file upload, download, and association to records).
- Bookings (tool/material bookings, progress tracking, equipment linkage, returns updating inventory).
- Articles (news/resources with publish/unpublish lifecycle).
- Workshops and registrations (capacity, status, CSV export).
- Activity logging (system/user activity feed).

The Next.js frontend provides pages and dashboards for Admin, Staff, and Member roles, plus public pages
for login, registration, inventory browsing, articles, and workshops. The main remaining gaps are around
schema documentation alignment, automated testing, and some consistency in error handling, rather than
missing functional features.

---

## Architecture Overview

- **Backend**
  - Spring Boot 3.2, Java 17, Maven.
  - Packages: `config`, `controller`, `dto`, `entity`, `repository`, `security`, `service`, `exception`.
  - Exposes REST API under `/api/**` plus Actuator endpoints and OpenAPI/Swagger UI.
  - Persistence via Spring Data JPA and PostgreSQL; Flyway for migrations.

- **Frontend**
  - Next.js 16 App Router, React 19, TypeScript.
  - App structure under `Frontend/app` with segments for public pages and role‑specific areas:
    - Public: `/`, `/login`, `/register`, `/inventory`, `/about`, `/articles`, `/contact`, `/bookings`, `/workshops`.
    - Admin: `/admin/**` (dashboard, users/staff/members, inventory, bookings, articles, workshops, reports, system data).
    - Staff: `/staff/**` (dashboard, inventory, bookings, articles, workshops, profile).
    - Member: `/member/**` (dashboard, bookings, equipment, projects, profile, workshops).
  - Shared UI via `components/` (Header, sidebars, dialogs, shadcn‑style UI primitives, attachment components).

- **Database & Migrations**
  - Baseline schema described in `Database/Makerspace_DB_Schema.sql` for `users`, `inventory_items`, `attachments`, `bookings`.
  - Additional changes managed by Flyway migrations in `Backend/src/main/resources/db/migration`.

- **DevOps / Runtime**
  - Backend and frontend each have multi‑stage Dockerfiles.
  - `docker-compose.yml` orchestrates PostgreSQL, backend (`8081`), and frontend (`3000`), with volumes for
    database data and backend uploads and health checks on the backend.

---

## Database Schema Compliance

This section compares the intended schema (SQL + migrations) with the JPA entities and application behavior.

### ✅ Users Table

**Schema (SQL + migrations):**

- Core columns as per `Makerspace_DB_Schema.sql`:
  - `user_id` (UUID, PK), `full_name`, `email` (unique), `password_hash`, `phone_number`, `role`, `staff_type`,
    `created_by`, timestamps.
- Additional Flyway migration adds notification columns:
  - `notify_booking_updates`, `notify_workshop_reminders`, `notify_approval_updates`, `notify_project_updates`.

**Implementation:**

- Entity `User` maps all fields including enums `Role` and `StaffType`, `createdBy` reference, and notification flags.
- `StaffTypeConverter` correctly maps enum values to DB strings (`Intern`, `Full-time`).
- `UserRepository` supports `findByEmail` and `existsByEmail`.
- `UserService` implements full CRUD plus business rules (role restrictions, updating notifications, preventing
  self‑deletion by Admins).
- `AuthService` uses `User` for registration and login.

**Frontend:**

- Login and registration pages fully use the `/api/auth` endpoints.
- User management UI exists at `/users` with a `UserDialog` component for create/edit.
- Role‑aware routing and dashboards in `/admin/**`, `/staff/**`, `/member/**`.

Status: **Fully implemented, including notification flags.**

---

### ✅ Inventory Items Table

**Schema:**

- `item_id` (UUID, PK), `name`, `sku` (unique), `unit`, `quantity`, `threshold`, `location`, `supplier`,
  `is_active`, timestamps.

**Implementation:**

- Entity `InventoryItem` maps all fields with sensible defaults for `quantity`, `threshold`, and `isActive`.
- `InventoryItemRepository` extends `JpaRepository`.
- `InventoryService` implements:
  - CRUD operations.
  - Low‑stock detection (active items where `quantity <= threshold`).
  - Manual SKU uniqueness validation on create/update.
- `InventoryController` exposes authenticated endpoints with role checks.
- `InventoryServiceTest` covers core creation and duplicate SKU behavior.

**Frontend:**

- `/inventory` page lists items with low‑stock indicators and role‑based actions.
- `InventoryItemDialog` is used for add/edit (Admin/Staff only).

Status: **Fully implemented end‑to‑end.**

---

### ✅ Attachments Table

**Schema:**

- `attachment_id` (UUID, PK), `owner_table`, `owner_id`, `filename`, `file_url`, `uploaded_by`, `uploaded_at`.

**Implementation:**

- Entity `Attachment` maps the schema and relates `uploadedBy` to `User`.
- `AttachmentRepository` extends `JpaRepository`.
- `AttachmentService` provides:
  - File upload with unique stored filenames in a configurable directory (`file.upload-dir`, default `uploads`).
  - Metadata persistence and linking to `owner_table` / `owner_id` and uploader.
  - Download as `Resource` by stored filename.
  - Listing by owner and deletion (including best‑effort file deletion).
- `AttachmentController` exposes endpoints under `/api/attachments` with appropriate authorization.

**Frontend:**

- `AttachmentUpload` and `AttachmentList` components wrap the upload and listing logic using `apiClient`.
- `api-client.ts` exposes upload, list, get, delete, and download URL helpers.

Status: **Attachment system is now implemented both server‑side and client‑side.**

---

### ✅ Bookings Table

**Schema:**

- Baseline from `Makerspace_DB_Schema.sql` plus Flyway migration:
  - Core: `booking_id`, `user_id`, `tools`, `materials`, `duration_minutes`, `appointment_time`, `notes`,
    `status`, `progress`, `project_description`, timestamps.
  - Migration `V20251113_01__add_booking_equipment_columns.sql` adds `equipment_item_id` (FK to `inventory_items`)
    and `equipment_quantity`.

**Implementation:**

- Entity `Booking` includes `user`, `tools`, `materials`, `durationMinutes`, optional `appointmentTime`, `notes`,
  optional `equipment` (`InventoryItem`), `equipmentQuantity`, `status` enum, `progress`, `projectDescription`,
  timestamps.
- `BookingRepository` provides `findByUser_UserId` for user‑scoped queries.
- `BookingService` handles:
  - Creation with optional appointment time and equipment.
  - Listing for a user and system‑wide.
  - Status updates, progress updates, detail updates (including equipment and notes).
  - `returnBooking` which marks as `COMPLETED` and adjusts inventory quantities when equipment is present.
- `BookingController` exposes `/api/bookings` with role‑based operations for members vs Admin/Staff.

Status: **Fully implemented.**

---

### ✅ Articles Table (Code) / Schema (Docs Pending)

**Schema / Entities:**

- Entity `Article` maps `article_id`, `title`, `author`, `imageUrl`, `content`, `tags`, `status` (DRAFT/PUBLISHED),
  `publishedAt`, timestamps.
- SQL DDL for `articles` is **not present** in `Makerspace_DB_Schema.sql`; the schema is implied by the entity.

**Implementation:**

- `ArticleRepository` extends `JpaRepository`.
- `ArticleService` provides listing, get by ID, create (draft), update, delete, publish, and unpublish.
- `ArticleController` exposes `/api/articles` with appropriate Admin/Staff restrictions for write operations.

Status: **Implemented in code; base SQL schema file should be updated to include the `articles` table.**

---

### ✅ Workshops & Registrations (Code) / Schema (Docs Pending)

**Entities:**

- `Workshop` with fields `workshop_id`, `title`, `instructor`, `date`, `capacity`, `status`, timestamps.
- `WorkshopRegistration` joining `workshop` and `user` with unique `(workshop_id, user_id)` and `registeredAt`.
- There is currently no explicit DDL for these tables in `Makerspace_DB_Schema.sql`.

**Implementation:**

- `WorkshopRepository` and `WorkshopRegistrationRepository` for persistence.
- `WorkshopService` implements:
  - Workshop CRUD and status transitions (SCHEDULED, CANCELLED, COMPLETED).
  - Listing registrations, adding/removing registrations with duplicate‑check.
  - Exporting registrations as CSV.
- `WorkshopController` exposes `/api/workshops` with sub‑routes for registrations and CSV export.

Status: **Implemented in code; schema documentation should be extended.**

---

### ✅ Activities (Code) / Schema (Docs Pending)

**Entity:**

- `Activity` with `activity_id`, `type` (BOOKING, INVENTORY, ARTICLE, WORKSHOP, USER), `message`, `actor`,
  `createdAt`.

**Implementation:**

- `ActivityRepository` provides top‑N queries by global and per‑user recency.
- `ActivityService` can record activities and query latest items.
- `ActivityController` exposes `/api/activity` and `/api/activity/user/{userId}`.

Status: **Implemented in code; base SQL schema file should define the `activities` table.**

---

## Backend Implementation Analysis

### ✅ Authentication & Security

- JWT token generation & validation via `JwtUtil`.
- Spring Security configuration in `SecurityConfig`:
  - Stateless sessions, JWT filter, role‑based rules per endpoint.
  - CORS configured for `http://localhost:3000`.
- `AuthService` and `AuthController` implement `POST /api/auth/login` and `POST /api/auth/register`.
- `CustomUserDetailsService` integrates user storage with Spring Security.
- Global exception handling via `GlobalExceptionHandler` provides structured error responses.

Status: **Fully functional and robust.**

---

### ✅ User Management

- `UserService` and `UserController` expose:
  - `GET /api/users` (Admin/Staff) – list.
  - `GET /api/users/{id}` – with access rules (self or Admin/Staff).
  - `GET /api/users/me` – current user profile.
  - `PUT /api/users/me` – profile & notification settings.
  - `POST /api/users` (Admin/Staff) – user creation with role rules.
  - `PUT /api/users/{id}` – updates controlled by Admin vs non‑Admin.
  - `DELETE /api/users/{id}` (Admin, not self) – deletion.

Status: **Backend complete with meaningful business rules.**

---

### ✅ Inventory Management

- Service and controller implement full CRUD, low‑stock logic, and SKU uniqueness.
- Integration with bookings for equipment and booking returns which adjust inventory quantities.

Status: **Backend complete and integrated with bookings.**

---

### ✅ Attachment Management

- `AttachmentService` and `AttachmentController` provide upload, download, list by owner, and deletion.
- Files are stored on disk in the configured upload directory; metadata is persisted in PostgreSQL.

Status: **Now implemented – this was previously a major gap and is no longer missing.**

---

### ✅ Bookings

- Handles creation, user‑specific listing, system‑wide listing (Admin/Staff), status updates, progress updates,
  details updates, and returns.
- Integrates with `InventoryItem` for equipment and quantity adjustments.

Status: **Implemented with meaningful domain logic.**

---

### ✅ Articles

- `ArticleService` and `ArticleController` cover CRUD plus publish/unpublish flows.

Status: **Backend feature‑complete; schema docs should be extended.**

---

### ✅ Workshops & Registrations

- `WorkshopService` and `WorkshopController` implement workshop lifecycle and registration management,
  including CSV export of registrations.

Status: **Feature‑complete in code; schema docs should be extended.**

---

### ✅ Activity Feed

- `ActivityService` and `ActivityController` provide simple activity retrieval; recording is centralised but can be
  wired into more operations over time.

Status: **Implemented as a lightweight audit feed.**

---

### Testing Status (Backend)

- `MakerspaceApplicationTests` verifies Spring context loading.
- `InventoryServiceTest` covers core inventory behaviors.
- No dedicated tests yet for authentication, bookings, workshops, attachments, articles, or user service.

Status: **Core logic is implemented but automated test coverage is limited outside inventory.**

---

## Frontend Implementation Analysis

### ✅ Authentication & Session UI

- `lib/auth.tsx` implements an `AuthProvider` and `useAuth` hook with JWT token + user storage in `localStorage`.
- `/login` and `/register` pages use `apiClient` to call backend.
- Role‑based redirection after login (Admin → `/admin/dashboard`, Staff → `/staff`, Member → `/member`).
- Protected content is handled via `useAuth` and helper components like `ProtectedRoute`.

Status: **Fully functional.**

---

### ✅ Layout & Navigation

- `app/layout.tsx` wraps all pages with fonts, `AuthProvider`, `Header`, and global `Toaster`.
- Sidebars for Admin, Staff, and Members plus a mobile toggle button on the home page.
- Global styling via Tailwind 4 and a modern light/dark theme.

Status: **Responsive, role‑aware shell in place.**

---

### ✅ Inventory UI

- `/inventory` and `/inventory/[id]` use `apiClient` to list items, show low‑stock indicators, and allow editing
  via `InventoryItemDialog` for Admin/Staff.

Status: **Complete and aligned with backend.**

---

### ✅ User Management UI

- `/users` page lists users with search/filter capabilities and integrates `UserDialog` for create/edit flows.
- Uses `apiClient.getUsers`, `createUser`, `updateUser`, and `deleteUser` to talk to `/api/users`.

Status: **Previously missing; now implemented and using backend role rules.**

---

### ✅ Bookings UI

- Member views under `/member/bookings` and `/bookings/history` use `apiClient.getMyBookings` and booking
  creation/update endpoints.
- Staff/Admin views under `/staff/bookings` and `/admin/bookings` provide system‑wide monitoring and status/
  progress updates.

Status: **End‑to‑end booking management is implemented.**

---

### ✅ Articles UI

- `/articles` shows articles to authenticated users.
- Admin/Staff management screens under `/admin/articles` and `/staff/articles` integrate with article CRUD and
  publish/unpublish endpoints.

Status: **Implemented and aligned with backend.**

---

### ✅ Workshops UI

- Member and public workshop views under `/workshops` and `/member/workshops` show workshop listings.
- Admin/Staff management under `/admin/workshops` and `/staff/workshops` integrate with workshop CRUD,
  status changes, registration operations, and CSV export (via `apiClient.getWorkshopRegistrationsCsvUrl`).

Status: **Implemented and aligned with backend.**

---

### ✅ Attachments UI

- `AttachmentUpload` and `AttachmentList` components encapsulate file management using `/api/attachments`.
- These components can be embedded into pages such as inventory, bookings, or user detail views as needed.

Status: **Upload/list/delete UX is implemented; integration points are available across the app.**

---

### Testing Status (Frontend)

- No explicit frontend unit/integration tests are present in the repo; behavior is currently validated manually.

Status: **Functional UI with minimal automated test coverage.**

---

## API Endpoints Summary (Key Routes)

**Authentication**

- `POST /api/auth/login`
- `POST /api/auth/register`

**Users**

- `GET /api/users` (Admin/Staff)
- `GET /api/users/{id}`
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/users` (Admin/Staff)
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}` (Admin)

**Inventory**

- `GET /api/inventory`
- `GET /api/inventory/low-stock` (Admin/Staff)
- `GET /api/inventory/{id}`
- `POST /api/inventory` (Admin/Staff)
- `PUT /api/inventory/{id}` (Admin/Staff)
- `DELETE /api/inventory/{id}` (Admin)

**Attachments**

- `POST /api/attachments/upload`
- `GET /api/attachments/download/{filename}`
- `GET /api/attachments/owner/{ownerTable}/{ownerId}`
- `GET /api/attachments/{id}`
- `DELETE /api/attachments/{id}` (Admin/Staff)

**Bookings**

- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings` (Admin/Staff)
- `PUT /api/bookings/{id}` (Admin/Staff)
- `PUT /api/bookings/{id}/status` (Admin)
- `PUT /api/bookings/{id}/progress` (Admin/Staff)
- `POST /api/bookings/{id}/return` (Admin/Staff)

**Articles**

- `GET /api/articles`
- `GET /api/articles/{id}`
- `POST /api/articles` (Admin/Staff)
- `PUT /api/articles/{id}` (Admin/Staff)
- `DELETE /api/articles/{id}` (Admin)
- `POST /api/articles/{id}/publish` (Admin/Staff)
- `POST /api/articles/{id}/unpublish` (Admin/Staff)

**Workshops & Registrations**

- `GET /api/workshops`
- `GET /api/workshops/{id}`
- `POST /api/workshops` (Admin/Staff)
- `PUT /api/workshops/{id}` (Admin/Staff)
- `DELETE /api/workshops/{id}` (Admin)
- `POST /api/workshops/{id}/cancel` (Admin/Staff)
- `POST /api/workshops/{id}/complete` (Admin/Staff)
- `GET /api/workshops/{id}/registrations` (Admin/Staff)
- `POST /api/workshops/{id}/registrations` (Admin/Staff)
- `DELETE /api/workshops/{id}/registrations/{memberId}` (Admin/Staff)
- `GET /api/workshops/{id}/registrations/export` (Admin/Staff)

**Activity**

- `GET /api/activity`
- `GET /api/activity/user/{userId}`

---

## Compliance Summary

| Component           | Database Schema Docs | Backend | Frontend | Status & Notes                                             |
|---------------------|----------------------|---------|----------|------------------------------------------------------------|
| Users               | ✅ (plus migrations) | ✅       | ✅        | Complete, includes notifications and role rules.           |
| Inventory           | ✅                  | ✅       | ✅        | Complete; integrated with bookings (equipment).            |
| Attachments         | ✅                  | ✅       | ✅        | File mgmt now fully implemented.                           |
| Bookings            | ✅ (with migration) | ✅       | ✅        | Implemented with status/progress and equipment returns.    |
| Articles            | ⚠️ (not in SQL file)| ✅       | ✅        | Code complete; add DDL for `articles`.                     |
| Workshops & Regs    | ⚠️ (not in SQL file)| ✅       | ✅        | Code complete; add DDL for workshops/registrations.        |
| Activities          | ⚠️ (not in SQL file)| ✅       | (N/A/partial) | API implemented; UI integration can be expanded.      |
| Authentication      | N/A                 | ✅       | ✅        | End‑to‑end auth.                                           |
| Security            | N/A                 | ✅       | ✅        | Roles, JWT, CORS, basic error handling.                    |

---

## Recommendations

### 1. Schema & Documentation Alignment (High Priority)

- Add DDL to `Makerspace_DB_Schema.sql` (or a dedicated Flyway baseline) for:
  - `articles`, `workshops`, `workshop_registrations`, `activities` tables.
- Ensure the documented schema matches the Flyway‑managed production schema.

### 2. Automated Testing (High Priority)

- Backend:
  - Add unit tests for `AuthService`, `UserService`, `BookingService`, `WorkshopService`, `AttachmentService`,
    and `ArticleService`.
  - Add controller integration tests for the major APIs.
- Frontend:
  - Add tests for critical flows (login, inventory editing, bookings, user management).

### 3. Error Handling & Observability

- Standardize use of `GlobalExceptionHandler` so controllers consistently return structured `ErrorResponse` bodies.
- Improve frontend error surface by consistently displaying backend error messages to users.
- Add logging/monitoring for file uploads, bookings, and workshop registration failures.

### 4. Product Enhancements

- Extend dashboards in `/admin/**` and `/staff/**` with richer analytics using the existing APIs (e.g., counts
  of bookings by status, workshop attendance, low‑stock trends).
- Consider implementing actual notification dispatch (email or in‑app) using the notification flags already
  stored on `User`.

---

## Conclusion

The Makerspace Management System has evolved significantly since the previous analysis. Core operational
features (authentication, users, inventory, attachments, bookings, articles, workshops, and activity logging)
are implemented across backend and frontend. The main remaining work is to:

- Align schema documentation with the actual set of entities.
- Strengthen automated testing and error handling.
- Incrementally enhance analytics and notifications.

**Analysis Date:** 2025-11-16
**System Version:** 1.0.0

