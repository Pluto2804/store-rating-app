# Store Rating Application

A full-stack store rating platform with role-based access for **Administrators, Store Owners, and Users**.

The application allows users to discover stores and submit ratings, store owners to view ratings for their stores, and administrators to manage users and stores.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT
- bcrypt
- Zod

## Features

### Authentication & Authorization
- User signup and login
- JWT-based authentication
- Role-based access control (RBAC)
- Three roles:
  - Admin
  - User
  - Store Owner
- Password hashing using bcrypt
- Protected API routes

### Administrator
- View dashboard statistics
- List and search users
- View individual user details
- Create users and store owners
- Create stores
- List and search stores
- Sort users and stores

### User
- View available stores
- Search stores
- View average store ratings
- View their own rating
- Submit a rating from 1–5
- Update an existing rating

### Store Owner
- View their store
- View average rating
- View total number of ratings
- View users who rated their store

## Project Structure

```text
store-rating-app/
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── auth.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
