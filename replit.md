# MediDash — Full-Stack Healthcare Platform

## Overview
A complete healthcare platform with public landing page, role-based authentication, and three full dashboards: Patient, Doctor, and Admin.

## Architecture
- **Frontend**: React 18 + Vite (port 5000)
- **Backend**: Express.js (port 3001)
- **Database**: PostgreSQL (via `DATABASE_URL`)
- **Start**: `npm run dev` → runs `node start-dev.js` (starts both Express + Vite)
- **Proxy**: Vite proxies `/api/*` → `http://localhost:3001`

## Demo Credentials
| Role    | Email                    | Password  |
|---------|--------------------------|-----------|
| Admin   | admin@medidash.com       | admin123  |
| Doctor  | dr.john@medidash.com     | doctor123 |
| Doctor  | dr.sarah@medidash.com    | doctor123 |
| Doctor  | dr.michael@medidash.com  | doctor123 |
| Doctor  | dr.emily@medidash.com    | doctor123 |
| Doctor  | dr.james@medidash.com    | doctor123 |
| Doctor  | dr.lisa@medidash.com     | doctor123 |
| Patient | (register via Sign Up)   |           |

## Pages & Structure

### Public
- `LandingPage.jsx` — Hero, doctor search, specialties, how it works
- `SignInPage.jsx` — Role-based login
- `SignUpPage.jsx` — Patient / Doctor / Admin registration

### Patient Dashboard (`/pages/patient/`)
- `PatientLayout.jsx` — Sidebar + navigation
- `PatientHome.jsx` — Stats, upcoming appointments
- `FindDoctor.jsx` — Search/filter doctors by specialty, book appointments
- `MyAppointments.jsx` — 2-step booking (slot selection + card payment) + review modal
- `Prescriptions.jsx` — View prescription history
- `PatientMessages.jsx` — Chat with doctors
- `PaymentHistory.jsx` — Transaction history
- `PatientProfile.jsx` — Update profile, health info

### Doctor Dashboard (`/pages/doctor/`)
- `DoctorLayout.jsx` — Sidebar + navigation
- `DoctorHome.jsx` — Today's schedule, stats, upcoming
- `DoctorAppointments.jsx` — Confirm/cancel/complete appointments
- `DoctorPatients.jsx` — Patient list + history sidebar
- `WritePrescription.jsx` — Multi-medication prescription writer
- `DoctorMessages.jsx` — Chat with patients
- `Earnings.jsx` — Revenue chart + payment history
- `DoctorProfile.jsx` — Availability, specialty, clinic info

### Admin Dashboard (`/pages/admin/`)
- `AdminLayout.jsx` — Sidebar + navigation
- `AdminHome.jsx` — Platform stats + revenue chart
- `ManageDoctors.jsx` — Approve/suspend/toggle doctors
- `ManagePatients.jsx` — View/toggle patients
- `AdminAppointments.jsx` — All appointments with filters
- `AdminPayments.jsx` — Revenue reports + transactions

## Key Files
- `server.js` — Express API + PostgreSQL schema + seeding + all routes
- `src/utils/api.js` — Centralized API client
- `src/App.jsx` — Role-based routing (patient/doctor/admin)
- `vite.config.js` — Vite + proxy config
- `start-dev.js` — Starts both Express and Vite

## Database Schema
Tables: `users`, `specialties`, `doctors`, `patients`, `appointments`, `payments`, `prescriptions`, `conversations`, `messages`, `reviews`

Auto-seeded with: 6 demo doctors, 1 admin user, 10 medical specialties

## Design
- Font: Inter (Google Fonts)
- Primary: #3b82f6 (blue), Dark: #0f172a, Gray: #64748b, Green: #10b981
- All styles: CSS-in-JS inline styles (no external CSS library)
- Animations: fadeIn, slideIn via CSS keyframes
