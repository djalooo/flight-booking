# Skyfare — Flight Booking Platform

Skyfare is a flight booking platform for a travel agency.

The project is currently built with **Next.js** on the frontend and **NestJS** on the backend.

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* NestJS
* TypeScript
* Prisma
* PostgreSQL

---

## Application Flow

```text
Browser
   │
   ▼
Next.js Frontend
   │
   │ HTTP API
   ▼
NestJS Backend
   │
   ├── Flight Providers
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

The frontend is responsible for the user interface.

The NestJS backend is responsible for the API and business logic.

PostgreSQL is accessed through Prisma.

---

## Current MVP

The MVP focuses on:

* Flight search
* Flight offers
* Customer booking
* Passenger information
* Booking management
* Admin dashboard
* Booking confirmation
* Booking cancellation
