# Craftad Backend API

Craftad is a RESTful backend powering a handyman marketplace that connects customers with skilled artisans. The platform enables customers to hire professionals, securely pay through an escrow system, and manage jobs from creation to completion.

It is designed with scalability, security, and maintainability in mind using Node.js, Express, MongoDB, and Mongoose.

## Overview

Craftad is a backend service for a handyman marketplace that connects customers with verified artisans. Customers can post jobs, artisans can apply and complete work, and payments are handled through an escrow system to ensure secure transactions.

The backend is built with Node.js, Express, and MongoDB using a modular architecture that supports authentication, wallet management, notifications, and payment processing.

---

# Features

## Authentication

* User registration
* Secure login with JWT
* Role-based authorization
* Customer accounts
* Artisan accounts
* Admin accounts
* Protected routes
* Password hashing with bcrypt

---

## Artisan System

* Become an artisan
* Create artisan profile
* Update artisan profile
* Skill matching
* Location-based artisan search
* Experience tracking

---

## Job Management

Customers can:

* Create jobs
* View jobs
* Assign artisans
* Cancel jobs
* Track job progress

Artisans can:

* View suggested jobs
* Apply for jobs
* Accept assigned jobs
* Update job status
* View active jobs
* View completed jobs

---

## Job Lifecycle

```text
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
```

---

## Escrow Payment System

Craftad uses an escrow-based payment flow.

### Payment Flow

```text
Customer
      │
      ▼
Initialize Payment
      │
      ▼
Paystack Payment
      │
      ▼
Payment Verification
      │
      ▼
Escrow (Held)
      │
      ├──────────────► Customer Releases Payment
      │
      └──────────────► Auto Release after 7 days
                       (Cron Job)
      │
      ▼
Artisan Wallet
      │
      ▼
Withdrawal
```

---

## Wallet System

Each artisan has:

* Available balance
* Total earnings
* Withdrawal history

Supports:

* Withdrawal requests
* Admin approval
* Admin rejection

---

## Platform Earnings

The platform deducts a commission from every completed payment.

Example:

Customer pays:

₦100,000

Platform fee (10%):

₦10,000

Artisan receives:

₦90,000

---

## Transaction History

All financial activity is recorded.

Transaction types include:

* Escrow payment
* Earnings
* Withdrawal
* Refund
* Platform commission

This ensures full audit tracking.

---

## Notification System

Supports real-time notifications using Socket.IO alongside persistent notification storage.
Examples:

* New nearby job
* Payment received
* Payment released
* Withdrawal approved
* Withdrawal rejected
* Job assigned
* Job completed

---

## Admin Features

Admins can:

* View users
* View dashboard statistics
* View platform earnings
* Approve withdrawals
* Reject withdrawals
* Manage payments

---

## Security

The backend includes multiple security layers.

### Authentication

* JWT authentication
* Protected routes
* Role-based authorization

### API Protection

* Helmet
* Rate limiting
* HPP protection
* NoSQL injection protection
* Password hashing
* Webhook verification

### Payments

* Escrow system
* MongoDB transactions (atomic operations)
* Duplicate payment prevention
* Automatic escrow release
* Manual payment release

---

## Background Jobs

Node Cron handles automated tasks:

* Checks escrow expiration
* Releases eligible payments
* Updates wallets
* Records transactions
* Sends notifications

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT
* bcrypt

### Payments

* Paystack

### Realtime

* Socket.IO

### Security

* Helmet
* express-rate-limit
* express-mongo-sanitize
* HPP

### Background Jobs

* node-cron

---

## Folder Structure

```text
src/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── jobs/
├── sockets/
├── services/
├── utils/
├── app.js
└── server.js
```
## API Architecture

The backend follows REST principles.

Example endpoints:

POST /api/auth/register

POST /api/auth/login

POST /api/jobs/create

GET /api/jobs/suggested

POST /api/payments/initialize

PATCH /api/payments/release/:jobId

POST /api/wallet/withdraw
---

## Performance Optimization

MongoDB indexes are used for:

- User lookup
- Job status
- Assigned artisan
- Customer history
- GeoJSON location queries
- Artisan availability
- Ratings

## API Modules

* Authentication
* Artisan
* Jobs
* Payments
* Wallet
* Notifications
* Reviews
* Status
* Admin

---

## Current Status

Completed:

* JWT authentication
* Role-based authorization
* Artisan profiles
* Job management
* Escrow payments
* Wallet system
* Transaction recording
* Notification system
* Admin dashboard
* Automatic escrow release
* MongoDB transactions
* Security middleware

---

## Planned Improvements

* Refresh token authentication
* Email verification
* Password reset
* Cloudinary image upload
* Location radius search
* Search and filtering
* Pagination
* Analytics dashboard
* Unit testing
* API documentation (Swagger)
* Docker support
* CI/CD pipeline
* Redis caching
* Queue processing with BullMQ

---

## Author

**Ukpabi Godwin Michael**

Backend Developer

GitHub: https://github.com/gwindotcool

email: gwindotcool@gmail.com
