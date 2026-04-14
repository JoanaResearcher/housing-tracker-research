# housing-tracker-research

## Project Description

`housing-tracker-research` is a full-stack research web application focused on tracking housing openings, waitlists, and related updates in a centralized, accessible format. The platform is designed to support research, community outreach, and practical access to housing information through structured listings, submission workflows, verification tools, and research logging.

## Research Affiliation

- Old Dominion University (ODU)
- CVRC
- RIL

## Researcher

Joana Camp, Senior, ODU

## Purpose

Improve housing access through technology.

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL

## Features

- Public homepage with housing openings and filters
- Submission form for community updates
- Admin panel for review, verification, and listing management
- Research logs and CSV export
- Background research job for listing refreshes
- Email alerts by state preference
- Optional SMS alerts using Twilio

## Research Context

This project is part of a Living Lab research initiative led by Joana Camp in collaboration with ODU, CVRC, and RIL. The application is intended to improve transparency and discoverability around housing opportunities while supporting research-informed approaches to access and verification.

## Setup Instructions

1. Install dependencies:
   - `npm install --prefix frontend`
   - `npm install --prefix backend`
2. Create a PostgreSQL database.
3. Copy environment files:
   - `frontend/.env.local.example` to `frontend/.env.local`
   - `backend/.env.example` to `backend/.env`
4. Run the database files:
   - `db/schema.sql`
   - `db/seed.sql`
5. Start the backend:
   - `npm run dev:backend`
6. Start the frontend:
   - `npm run dev:frontend`

## Environment Variables

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`

### Backend

- `PORT`
- `DATABASE_URL`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: Railway PostgreSQL or Supabase

## Important Note

This tool is for informational and research purposes. Users should verify all housing information directly with the relevant official housing authority before acting on it.
