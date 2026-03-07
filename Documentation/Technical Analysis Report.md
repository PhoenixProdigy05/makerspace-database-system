## Makerspace Management System – Technical Analysis Report

### Overview
This document summarizes the current implementation across backend (Spring Boot), frontend (Next.js/React/TypeScript), database (PostgreSQL), and DevOps (Docker Compose), highlighting architecture, features, security, and recommended improvements.

### Backend (Spring Boot, Java 17)
- **Build/Dependencies**: Managed via Maven (`pom.xml`). Uses Spring Web, Security, Data JPA, Actuator, Validation, PostgreSQL driver, Swagger/OpenAPI (springdoc), Lombok, and JJWT (0.12.3).
- **Application Config**: `application.properties` sets port 8080, Postgres connection, JPA with `ddl-auto=none`, JWT secret/expiration, CORS (localhost:3000), multipart limits, actuator.
- **OpenAPI**: `OpenApiConfig` defines API metadata and JWT bearer auth scheme.

#### Domain Model (JPA Entities)
- `User`
  - Fields: `userId` (UUID PK), `fullName`, `email` (unique), `passwordHash`, `phoneNumber`, `role` (enum: Admin/Staff/Member), `staffType` (enum via converter: Intern/Full-time), `createdBy` (self-reference), timestamps.
  - `StaffType` persisted using `StaffTypeConverter` mapping `Full_time` ↔ "Full-time".
- `InventoryItem`
  - Fields: `itemId` (UUID PK), `name`, `sku` (unique), `unit`, `quantity` (BigDecimal), `threshold` (BigDecimal), `location`, `supplier`, `isActive`, timestamps.
- `Attachment`
  - Fields: `attachmentId` (UUID PK), `ownerTable`, `ownerId` (UUID), `filename`, `fileUrl`, `uploadedBy` (User), `uploadedAt`.

#### Security & Auth
- **JWT**: `JwtUtil` issues and validates tokens. Configured via `jwt.secret` and `jwt.expiration`. Uses HMAC key derived from secret bytes.
- **Spring Security**: `SecurityConfig` enables stateless auth, CORS for `http://localhost:3000`, disables CSRF, and inserts `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`.
- **Authorization Rules**:
  - Public: `/api/auth/**`
  - Authenticated: `/api/users/**`, `/api/inventory/**`, `/api/attachments/**`
  - Method-level checks using `@PreAuthorize` at controllers (e.g., Admin-only deletes).

#### REST Controllers (Selected Endpoints)
- `AuthController` (`/api/auth`)
  - `POST /login`: Accepts `LoginRequest`, returns `LoginResponse` with token and user info; 401 on failure.
  - `POST /register`: Accepts `RegisterRequest`, creates `User`; 201 on success, 400 on validation/runtime error.
- `UserController` (`/api/users`)
  - `GET /`: Admin/Staff can list users -> `List<UserResponse>`.
  - `GET /{id}`: Authenticated; users can view self, Admin/Staff can view any.
  - `POST /`: Admin/Staff can create -> `UserResponse` (creator captured from auth).
  - `PUT /{id}`: Authenticated update with ownership/role checks inside service.
  - `DELETE /{id}`: Admin only.
- `InventoryController` (`/api/inventory`)
  - `GET /`: Authenticated list of `InventoryItemResponse`.
  - `GET /low-stock`: Admin/Staff list of low stock items.
  - `GET /{id}`: Authenticated item by id.
  - `POST /`, `PUT /{id}`: Admin/Staff create/update.
  - `DELETE /{id}`: Admin only.
- `AttachmentController` (`/api/attachments`)
  - `POST /upload`: Authenticated multipart upload with `ownerTable` and `ownerId` → `AttachmentResponse`.
  - `GET /download/{filename}`: Authenticated download stream.
  - `GET /owner/{ownerTable}/{ownerId}`: List attachments by owner.
  - `GET /{id}`: Fetch single attachment.
  - `DELETE /{id}`: Admin/Staff can delete.

### Database (PostgreSQL)
- **Schema**: `System/Database/Makerspace_DB_Schema.sql` defines `users`, `inventory_items`, `attachments`.
  - `users.role` constrained to `Admin|Staff|Member`.
  - `users.staff_type` constrained to `Intern|Full-time` (matches converter mapping).
  - All IDs are UUIDs with `gen_random_uuid()` (requires `pgcrypto` extension or compatibility layer on target Postgres).
- **DDL Strategy**: JPA `ddl-auto=none`; schema is expected to be applied externally (Compose mounts SQL during Postgres init).

### Frontend (Next.js 14+/App Router, TypeScript)
- **Structure**: App Router in `System/Frontend/app`. Global providers via `layout.tsx` wrapping with `AuthProvider`.
- **Auth Context**: `lib/auth.tsx` maintains basic user state, login/logout; persists JWT in `localStorage` via `api-client`.
- **API Client**: `lib/api-client.ts`
  - Base URL from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080/api`).
  - Injects `Authorization: Bearer <token>` when available; handles 401 by clearing token and redirecting to `/login`.
  - Implements endpoints for auth, users, inventory, attachments (upload uses `FormData`).
- **Routes/Pages**:
  - `/login`: Login form; calls `apiClient.login`, pushes to `/`.
  - `/`: Dashboard with stats derived from users/inventory calls; logout available.
  - `/inventory`: Table with items, low-stock alert (Admin/Staff), CRUD dialog for Admin/Staff, attachments section.
  - `/inventory/[id]`: Item details with attachment upload/list (Admin/Staff).
  - `/users`: Admin/Staff-only management table with add/edit; Admin can delete.
- **UI**: Uses shadcn-style components (`components/ui`). `ProtectedRoute` gates access based on `AuthProvider` state.

### DevOps (Docker & Compose)
- **Compose**: `docker-compose.yml`
  - Services: `postgres` (15-alpine), `backend` (builds `System/Backend`), `frontend` (builds `System/Frontend`).
  - Healthchecks for DB and backend actuator. Shared bridge network. Volumes for DB data and backend uploads.
  - Backend env mirrors application properties; passes `JWT_SECRET`, `JWT_EXPIRATION`, `FILE_UPLOAD_DIR`.
  - Frontend env sets `NEXT_PUBLIC_API_URL=http://localhost:8080/api`.
- **Backend Dockerfile**: Multi-stage typical (file present). Frontend Dockerfile also present for Next.js.

### Strengths Observed
- Clear separation of concerns: auth, users, inventory, attachments.
- Role-based access controls on key endpoints.
- Consistent DTO usage and response types in controllers.
- App Router frontend with reusable API client and auth context.
- Compose stack enables one-command local orchestration.
- OpenAPI configuration in place for API documentation.

### Gaps and Risks
- **JWT in URL for downloads**: `getAttachmentDownloadUrl` appends token as query param; URLs can leak via logs/referrers. Prefer Authorization header or short-lived signed URLs.
- **Frontend auth bootstrap**: On mount, presence of token sets a stub user without validation; no token introspection/refresh. This can cause inconsistent role gating after reload.
- **Password handling**: Ensure registration and updates consistently hash `password_hash` (service code not reviewed here, but `BCryptPasswordEncoder` is configured).
- **CORS origins**: Hardcoded `http://localhost:3000`. For deployments, environment-driven configuration is recommended.
- **Error responses**: Controllers frequently return empty bodies for error statuses; consider standardized `ErrorResponse` with message/codes for better UX.
- **Postgres UUID generation**: `gen_random_uuid()` needs `pgcrypto`; ensure extension is enabled in init SQL (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`).
- **StaffType enum naming**: Java enum `Full_time` maps to "Full-time"; ensure consistent casing and hyphenation across DTOs and frontend.
- **Attachment storage**: `fileUrl` suggests filesystem path/URL; confirm file storage location, security of direct file access, and cleanup on delete.
- **Swagger UI**: springdoc starter included; confirm `/swagger-ui.html` (or `/swagger-ui`) exposed and secured appropriately.

### Recommendations
- Replace token-in-URL for downloads with an authenticated endpoint that reads `Authorization` header, or generate one-time signed URLs.
- Add a lightweight `/api/auth/me` endpoint to validate token and return user profile; update `AuthProvider` to load real user data on refresh.
- Standardize error responses with a shared `ErrorResponse` schema; surface messages in frontend.
- Externalize CORS and JWT settings via environment variables across environments.
- Add `CREATE EXTENSION IF NOT EXISTS pgcrypto;` at top of schema to ensure UUID default works on fresh DB.
- Consider pagination for users and inventory endpoints; add filtering/sorting as needed.
- Add unit/integration tests around auth flows, role checks, and inventory low-stock logic.
- Ensure OpenAPI groups all endpoints and add schemas for request/response DTOs where missing.

### Summary of Implemented Features
- User authentication via JWT with role-based authorization.
- User management (Admin/Staff): list/create/update/delete (Admin-only delete).
- Inventory management: list/create/update/delete (Admin-only delete), low-stock reporting.
- Attachment upload/download and association to owner entities.
- Frontend dashboards and CRUD UIs aligned with roles.
- Dockerized local environment with health checks and networked services.

### Next Steps
1. Implement `/api/auth/me` and frontend token validation on load.
2. Update attachment download flow to avoid token in query string.
3. Harden error handling and surface informative messages.
4. Add DB extension creation to schema and seed scripts if needed.
5. Prepare environment-specific configs for CORS and secrets for staging/production.





