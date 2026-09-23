# EventFlow — Event Management & Digital Ticketing Platform

<p align="center">
  <strong>A full-stack event management platform for organizers and attendees</strong>
</p>

<p align="center">
  Create events • Manage registrations • Process payments • Generate digital passes • Scan attendees
</p>

<p align="center">
  <a href="https://event-flow-two-phi.vercel.app/">Live Demo</a>
  &nbsp;•&nbsp;
  <a href="https://github.com/Huzaifa-develpor/Event-Flow">GitHub Repository</a>
</p>

---

## 📌 Overview

**EventFlow** is a full-stack event management and digital ticketing platform built with **Next.js, MongoDB, Mongoose, JWT authentication, role-based authorization, and SafePay payment integration**.

The platform provides separate workflows for **attendees** and **organizers**.

Attendees can discover events, register for tickets, complete ticket payments, receive digital passes with QR codes, and use those passes for event check-in.

Organizers can create events, configure General and VIP tickets, pay the required listing fee, publish events, manage registrations, monitor attendance, and use an organizer dashboard for event analytics and management.

The project was also used as a practical implementation of Next.js App Router concepts, API routes, middleware, dynamic routing, service-layer architecture, authentication, authorization, database relationships, payment integration, webhooks, QR codes, and deployment.

---

## 🌐 Live Demo

**Live Application:**  
https://event-flow-two-phi.vercel.app/

**GitHub Repository:**  
https://github.com/Huzaifa-develpor/Event-Flow

> Payment functionality is implemented with the SafePay test/sandbox flow for development and learning purposes.

---

# ✨ Features

## 👤 Authentication & Authorization

- User signup and login
- Password hashing with `bcryptjs`
- JWT-based authentication
- JWT contains user identity and role
- Bearer token authentication
- Protected API routes
- Role-based authorization
- Attendee and Organizer workflows
- Admin authorization for protected management operations
- Centralized request handling through Next.js proxy/middleware

---

## 🎪 Event Management

Organizers can:

- Create events
- Add title and description
- Set event date and location
- Define event capacity
- Create General and VIP ticket types
- Set ticket prices
- Set ticket quantities
- Publish events after the required payment flow
- Manage their own events

### Event Status

```text
draft
  ↓
published
  ↓
cancelled
```

An event starts as a **draft** and is published only after the organizer completes the required listing/payment flow.

---

## 🎟️ Ticket & Registration System

Attendees can:

- Discover published events
- View event details
- Select General or VIP tickets
- Register for an event
- Submit attendee information
- Complete ticket payment
- View their registrations
- Cancel registrations where applicable

The registration service handles:

- Event validation
- Published-event validation
- Ticket-type validation
- Ticket availability
- Duplicate registration checking
- Ticket price assignment from the selected event ticket
- Ticket inventory updates

This means the attendee does not manually decide the final ticket price. The registration uses the price configured by the organizer for that ticket type.

---

## 💳 SafePay Payment Integration

EventFlow contains **two separate payment flows**.

### 1. Organizer Payment

The organizer creates an event as a draft.

Before the event can be published:

```text
Create Event
    ↓
Draft Event
    ↓
Organizer Listing Payment
    ↓
Payment Processing
    ↓
Payment Confirmation
    ↓
Publish Event
```

The event publishing request is kept separate from the payment creation flow so the application can verify the payment state before allowing the event to become published.

### 2. Attendee Payment

For an attendee:

```text
Select Event
    ↓
Select Ticket
    ↓
Create Registration
    ↓
Create Payment
    ↓
SafePay Checkout
    ↓
Payment Confirmation
    ↓
Confirm Registration
    ↓
Digital Pass + QR Code
```

The attendee's digital pass is tied to successful payment confirmation.

---

## 🔔 Payment Webhooks

SafePay webhook integration is used to receive payment-status events.

The application can use the webhook result to update internal payment records and continue the related business flow.

The payment model keeps information such as:

- User
- Event
- Registration
- Payment type
- Amount
- Currency
- Payment status
- Payment method
- Transaction ID
- Gateway
- Payment completion time

Example payment states include:

```text
pending
processing
completed
failed
refunded
cancelled
```

---

## 🎫 Digital Pass & QR Code

After successful attendee payment, EventFlow provides a digital ticket/pass containing a unique ticket identifier and QR code.

The QR code can be used at the event entrance for attendee verification and check-in.

The project uses:

- `qrcode`
- `react-qr-code`

The payment confirmation flow is connected to digital-pass availability so an unpaid registration does not receive a confirmed entry pass.

---

## 📷 Attendee Check-in

Organizers can manage event check-ins using attendee ticket/QR information.

The registration system tracks:

- Ticket code
- QR code
- Check-in status
- Check-in time

This creates a complete flow from:

```text
Registration
    ↓
Payment
    ↓
Digital Pass
    ↓
QR Code
    ↓
Check-in
```

---

# 📊 Organizer Dashboard

EventFlow provides a dedicated **Organizer Dashboard**.

The dashboard is designed around the organizer's operational needs and includes information such as:

- Total events
- Total registrations
- Attendance/check-in statistics
- Upcoming events
- Registration analytics
- Attendee information
- Event management
- Check-in management
- Revenue/payment information

The dashboard is protected so it is available to authenticated organizers rather than general attendees.

---

# 🛡️ Middleware & Protected Routes

The project uses a centralized proxy/middleware approach for protected API routes.

The authentication middleware:

1. Reads the `Authorization` header.
2. Extracts the Bearer token.
3. Verifies the JWT.
4. Retrieves the user's ID and role.
5. Passes authenticated user information to the protected request.

Role middleware then controls access based on the authenticated user's role.

### Example Access Model

| Area | Access |
|---|---|
| Authentication | Public |
| Event discovery | Public where applicable |
| Event creation/management | Organizer / Admin |
| Attendee registration | Attendee |
| Organizer dashboard | Organizer |
| Protected payment operations | Authenticated user |
| Event management operations | Organizer / Admin |

---

# 🏗️ Application Architecture

EventFlow follows a layered Next.js application structure.

```text
Frontend
   │
   ▼
Next.js App Router
   │
   ▼
API Routes
   │
   ▼
Proxy / Authentication Middleware
   │
   ▼
Role Authorization
   │
   ▼
Service Layer
   │
   ├── Auth Service
   ├── Event Service
   ├── Registration Service
   ├── Payment Service
   └── Organizer Dashboard Service
   │
   ▼
Mongoose Models
   │
   ▼
MongoDB
```

Payment integration extends the architecture:

```text
Application
    │
    ▼
Payment Service
    │
    ▼
SafePay
    │
    ▼
Checkout / Payment
    │
    ▼
SafePay Webhook
    │
    ▼
Payment Status Update
    │
    ├── Registration Confirmation
    ├── Event Publishing Flow
    └── Digital Pass Availability
```

---

# 📁 Project Structure

The main application structure is organized around the Next.js App Router, API routes, services, models, middleware, and shared utilities.

```text
Event-Flow/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── publish/
│   │   │   │   │       └── route.js
│   │   │   │   └── route.js
│   │   │   │
│   │   │   ├── organizer/
│   │   │   │
│   │   │   ├── payments/
│   │   │   │
│   │   │   └── registrations/
│   │   │
│   │   ├── create-event/
│   │   ├── events/
│   │   ├── login/
│   │   ├── organizer/
│   │   ├── signup/
│   │   └── globals.css
│   │
│   ├── models/
│   │   ├── User
│   │   ├── Event
│   │   ├── Registration
│   │   └── Payment
│   │
│   ├── services/
│   │   ├── auth.service
│   │   ├── event.service
│   │   ├── registration.service
│   │   ├── payment.service
│   │   └── organizer dashboard service
│   │
│   ├── middleware/
│   │   ├── authMiddleware
│   │   └── roleMiddleware
│   │
│   ├── lib/
│   │   ├── mongodb
│   │   ├── jwt
│   │   └── safepay
│   │
│   └── proxy.js
│
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
└── postcss.config.mjs
```

### Main API Areas

```text
/api/auth
/api/events
/api/events/[id]/publish
/api/organizer
/api/payments
/api/registrations
```

The project also uses dynamic API routing such as:

```text
/api/events/[id]
/api/events/[id]/publish
```

---

# 🗄️ Database Models

MongoDB is used as the application's primary database through Mongoose.

### User

Stores account and authorization information.

```text
User
 ├── firstName
 ├── lastName
 ├── email
 ├── password
 ├── phone
 └── role
```

### Event

Stores event information and organizer ownership.

```text
Event
 ├── title
 ├── description
 ├── capacity
 ├── tickets[]
 │    ├── type
 │    ├── price
 │    └── quantity
 ├── date
 ├── location
 ├── organizerId
 └── status
```

### Registration

Connects an attendee with an event and selected ticket.

```text
Registration
 ├── userId
 ├── eventId
 ├── ticketType
 ├── ticketPrice
 ├── attendee information
 ├── paymentStatus
 ├── ticketCode
 ├── qrCode
 ├── checkedIn
 └── checkedInAt
```

### Payment

Keeps payment records separate from events and registrations.

```text
Payment
 ├── userId
 ├── eventId
 ├── registrationId
 ├── paymentType
 ├── amount
 ├── currency
 ├── paymentStatus
 ├── paymentMethod
 ├── transactionId
 ├── gateway
 └── paidAt
```

---

# 🧰 Tech Stack

## Frontend

- Next.js 16
- React 19
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

## Backend

- Next.js App Router
- Next.js API Routes
- Node.js runtime
- MongoDB
- Mongoose

## Authentication

- JWT
- bcryptjs
- Bearer token authentication
- Role-Based Access Control
- Next.js proxy/middleware

## Payments

- SafePay Node SDK
- SafePay checkout
- Payment status tracking
- Webhooks

## Digital Ticketing

- QR Code generation
- `qrcode`
- `react-qr-code`
- Digital ticket/pass flow

## Deployment

- Vercel
- MongoDB / MongoDB Atlas

---

# 🔐 Security Concepts Implemented

The project demonstrates several common backend security patterns:

- Password hashing instead of storing plain-text passwords
- JWT-based authentication
- Bearer token validation
- Protected API routes
- Role-based authorization
- User ownership checks
- Organizer ownership checks for events
- Duplicate registration checks
- Payment status validation
- Environment variables for secrets
- Webhook-based payment state updates

Sensitive values such as JWT secrets, database credentials, and SafePay credentials are kept outside the source code using environment variables.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

- Node.js installed
- npm installed
- MongoDB / MongoDB Atlas
- SafePay developer/test credentials

## Installation

Clone the repository:

```bash
git clone https://github.com/Huzaifa-develpor/Event-Flow.git
```

Move into the project:

```bash
cd Event-Flow
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

SAFEPAY_API_KEY=your_safepay_api_key
SAFEPAY_WEBHOOK_SECRET=your_safepay_webhook_secret
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Testing the Payment Flow

The payment integration is intended to be tested with the SafePay test/sandbox environment.

A typical organizer test flow is:

```text
Signup / Login
     ↓
Create Event
     ↓
Event saved as Draft
     ↓
Enter Listing Payment Flow
     ↓
SafePay Test Payment
     ↓
Payment Confirmation
     ↓
Publish Event
```

A typical attendee flow is:

```text
Login
  ↓
Discover Event
  ↓
Select Ticket
  ↓
Register
  ↓
Payment
  ↓
Payment Confirmation
  ↓
Digital Pass
  ↓
QR Check-in
```

Use test credentials provided by the payment provider when working in the test environment. Never commit real payment credentials or secret keys to GitHub.

---

# 🌍 Deployment

The application is deployed on **Vercel**.

Production/test deployment requires the required environment variables to be configured in the Vercel project.

The deployed application is available here:

**https://event-flow-two-phi.vercel.app/**

Payment webhook configuration must point to the deployed application's webhook endpoint when testing the deployed payment flow.

---

# 📚 Key Concepts Practiced

This project was built as a practical full-stack learning project and covers:

- Next.js App Router
- React
- Tailwind CSS
- Dynamic routing
- API routes
- REST-style API design
- MongoDB
- Mongoose
- Database relationships
- Service-layer architecture
- JWT authentication
- bcrypt password hashing
- Role-Based Access Control
- Middleware
- Protected routes
- Organizer ownership validation
- Registration systems
- Ticket inventory management
- Payment gateway integration
- Payment webhooks
- Payment status management
- QR code generation
- Digital ticketing
- Event check-in
- Organizer dashboards
- Analytics
- Environment variables
- Third-party API integration
- Vercel deployment

---

# 🔮 Future Improvements

Potential improvements for future versions include:

- Email confirmation after registration
- Automated event reminder emails
- Refund workflow
- Advanced admin panel
- Event image/banner uploads
- Pagination and advanced filtering
- More detailed financial analytics
- Automated digital-pass email delivery
- Advanced QR check-in analytics
- Multiple payment methods

---

# 👨‍💻 Author

## Muhammad Huzaifa Anwar

BSCS Student & Full-Stack Developer

Focused on building full-stack applications with JavaScript, React, Next.js, Node.js, MongoDB, APIs, authentication, authorization, and third-party integrations.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Demo | https://event-flow-two-phi.vercel.app/ |
| 💻 GitHub | https://github.com/Huzaifa-develpor/Event-Flow |

---

## 📄 License

This project was built for learning, development, and portfolio purposes.
