# User Service

A Node.js microservice responsible for managing all user-related operations, including registration, authentication, profile management, and user data updates. Built with MongoDB for flexible and scalable storage.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [API Endpoints](#api-endpoints)  
- [Getting Started](#getting-started)  
- [Configuration](#configuration)  
- [Usage](#usage)

---

## Features

- **User Registration:** Create new user accounts with validation.  
- **User Authentication:** Secure login and logout functionality using JWT.  
- **Profile Management:** Fetch and update user details.  
- **Password Management:** Update passwords securely with hashing.  
- **Role-Based Access Control:** Optional support for roles and permissions.  
- **Token-Based Authentication:** JWT for session management.  

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose ODM  
- **Authentication:** JSON Web Tokens (JWT)  
- **Validation:** Joi  

---

## API Endpoints

| Endpoint                   | Method | Description                            | Request Body / Params                     |
|----------------------------|--------|----------------------------------------|------------------------------------------|
| `/api/users/register`      | POST   | Register a new user                     | `{ "name": "", "email": "", "password": "" }` |
| `/api/users/login`         | POST   | Authenticate a user and return a token | `{ "email": "", "password": "" }`        |
| `/api/users/logout`        | POST   | Logout user and invalidate token       | Authorization: Bearer `<token>`          |
| `/api/users/:id`           | GET    | Get user details by ID                  | Authorization: Bearer `<token>`          |
| `/api/users/:id`           | PUT    | Update user information                 | `{ "name": "", "email": "" }`            |
| `/api/users/:id/password`  | PUT    | Update user password                    | `{ "oldPassword": "", "newPassword": "" }` |

---

## Getting Started

### Prerequisites

- Node.js v18+  
- MongoDB (local or cloud)  
- Git  

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/user-service.git
cd user-service

# Install dependencies
npm install

# Start the development server
npm run dev
```


Configuration

Create a .env file at the root of the project and add the following variables:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/user_service
JWT_SECRET=your_jwt_secret
TOKEN_EXPIRY=1d
```
