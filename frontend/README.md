# Shelfrate frontend (React + Vite)

    npm install
    cp .env.example .env     # API base URL, default http://localhost:3000
    npm run dev              # http://localhost:5173

Roles: administrator (/admin), normal user (/stores), store owner (/owner). One login for all; `/password` for everyone.
Tables sort on every column; admin tables filter by name, email, address and role.

## Backend routes used
Existing: POST /auth/login, POST /auth/signup, GET /admin/users[?role], POST /admin/users, POST /admin/stores,
GET /stores?search=, POST /stores/:id/rating, GET /owner/store.

Needed (not in the current backend, the UI calls them):
- GET /admin/stats -> { users, stores, ratings }
- GET /admin/stores -> { stores: [{ id, name, email, address, ownerId, averageRating }] }
- PATCH /auth/password { currentPassword, newPassword }
- Allow role 'admin' in createUserSchema (src/validators/admin.ts)
