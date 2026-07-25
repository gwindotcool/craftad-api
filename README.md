# Craftad Backend API

A secure backend API for **Craftad**, a handyman marketplace that connects customers with skilled artisans. The platform supports job posting, artisan matching, escrow payments, wallet management, notifications, reviews, and an admin dashboard.

---

# Features

## Authentication & Authorization

* JWT Authentication
* Role-based access control
* Customer accounts
* Artisan accounts
* Admin accounts
* Protected routes
* Password hashing using bcrypt

---

## Artisan System

* Become an artisan
* Create artisan profile
* Manage skills
* Service location
* GeoJSON location support
* Nearby artisan matching
* Availability status

---

## Job Management

Customers can:

* Create jobs
* View jobs
* Assign artisans
* Cancel jobs

Artisans can:

* View suggested jobs
* Apply for jobs
* Accept assigned jobs
* Update job progress
* Complete jobs

Job lifecycle:

Pending

↓

Assigned

↓

Accepted

↓

In Progress

↓

Completed

↓

Paid

---

## Reviews

Customers can:

* Leave reviews
* Rate artisans
* Improve artisan reputation

---

## Escrow Payment System

Integrated with **Paystack**

Flow:

Customer creates job

↓

Customer pays

↓

Payment enters escrow

↓

Artisan completes work

↓

Customer releases payment

OR

Automatic release after 7 days

---

## Wallet System

Each artisan has:

* Wallet balance
* Total earnings
* Withdrawal requests
* Withdrawal history

Platform has:

* Platform wallet
* Marketplace commission tracking

---

## Transaction System

Every money movement is recorded.

Supported transaction types:

* Escrow payment
* Earnings
* Withdrawal
* Platform commission
* Refund (planned)

Each transaction stores:

* Amount
* Previous balance
* New balance
* Payment reference
* Job reference
* Timestamp
* Description

---

## Notifications

Real-time notifications using Socket.IO.

Examples:

* New job nearby
* Job assigned
* Payment received
* Payment released
* Withdrawal approved
* Withdrawal rejected

Notifications are stored in MongoDB and also delivered in real time.

---

## Admin Features

Admin can:

* View users
* View platform earnings
* View withdrawal requests
* Approve withdrawals
* Reject withdrawals
* Monitor platform activity

---

# Security Features

## Authentication

* JWT Authentication
* Protected routes
* Role authorization
* Secure password hashing

---

## API Security

* Helmet
* CORS
* HTTP Parameter Pollution protection
* MongoDB Injection protection
* Rate limiting
* Compression
* Request logging with Morgan

---

## Payment Security

* Paystack webhook verification
* Escrow payments
* Duplicate payment protection
* Atomic payment release

---

## Database Security

MongoDB Transactions are used for:

* Payment release
* Wallet updates
* Platform earnings
* Job status updates

This ensures all operations succeed together or roll back completely.

---

# Tech Stack

Backend

* Node.js
* Express.js

Database

* MongoDB
* Mongoose

Authentication

* JWT
* bcrypt

Payments

* Paystack

Realtime

* Socket.IO

Scheduling

* node-cron

Security

* Helmet
* express-rate-limit
* express-mongo-sanitize
* HPP

Logging

* Morgan

Compression

* compression

---

# Project Structure

```
src/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── jobs/
├── sockets/
├── utils/
├── app.js
└── server.js
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Create an environment file

```bash
cp .env.example .env
```

Start the development server

```bash
npm run dev
```

---

# Environment Variables

Example:

```env
PORT=3000

MONGO_URI=your_database_url

JWT_SECRET=your_secret

PAYSTACK_SECRET_KEY=your_paystack_secret

PAYSTACK_PUBLIC_KEY=your_public_key
```

Never commit your real `.env` file.

---

# API Modules

* Authentication
* Artisan
* Jobs
* Payments
* Wallet
* Reviews
* Notifications
* Admin

---

# Current Security Status

Implemented:

* JWT Authentication
* Role Authorization
* MongoDB Transactions
* Escrow Payments
* Wallet Protection
* API Rate Limiting
* Mongo Sanitization
* HPP Protection
* Secure Webhooks
* Socket Authentication

---

# Future Improvements

* Refresh token authentication
* Email verification
* Password reset flow
* Refund system
* Customer wallet
* Push notifications
* File uploads
* SMS notifications
* Two-factor authentication
* Audit logs
* API documentation with Swagger
* Docker deployment
* CI/CD pipeline
* Automated testing
* Redis caching

---

# Author

**Ukpabi Godwin Michael**

Backend Developer

GitHub: https://github.com/gwindotcool
