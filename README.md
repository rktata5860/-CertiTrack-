# CertiTrack

Production-ready React + Vite web app with Firebase Auth, Firestore, and Storage for certificate lifecycle management.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and paste Firebase config values.
3. `npm run dev`

## Auth
- Single `/login` page for Email/Password login, sign-up toggle, and Google login.
- Roles loaded from Firestore `users/{uid}` and redirected automatically:
  - user -> `/dashboard`
  - admin -> `/admin/dashboard`
- First-time Google user is auto-created with `role: user`.
- Optional admin override via `VITE_ADMIN_EMAILS`.

## Collections
### users/{uid}
`{ email, name, role, createdAt }`

### certificates/{id}
`{ uid, title, issuer, category, issueDate, expiryDate|null, credentialId, credentialUrl, notes, proofUrl, proofPath, verified, createdAt }`

## Features
- Role-based protected nested routing + layouts and sidebars.
- User dashboard stats, quick actions, and recent certificates.
- Admin dashboard with org metrics and raw data snapshot.
- User certificate CRUD with search/filter + status + PDF/proof column.
- Renewal grouping for user and admin views.
- Chatbot helper widget on all pages.
- Pastel professional glass UI (plain CSS, no Tailwind/MUI).

## Firebase Security
Use provided `firestore.rules` and deploy rules to Firestore.
