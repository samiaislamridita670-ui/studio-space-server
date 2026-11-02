# StudioSpace — Backend API

StudioSpace Backend is a RESTful API built with Node.js, Express.js, and MongoDB. It powers the StudioSpace Creative Studio Booking Platform by managing studio listings, booking-related operations, and secure server-side communication.

## 🌐 Live Backend

* **Live API:** https://studio-space-server-jbg6.vercel.app
* **Health Check:** https://studio-space-server-jbg6.vercel.app/api/health

## 📌 Project Overview

The backend provides APIs for managing creative studio listings and supporting communication between the frontend and database.

### Main Responsibilities

* Retrieve available studio listings.
* Search and filter studios.
* Create new studio listings.
* Update existing studio listings.
* Delete studio listings.
* Manage studio ownership.
* Protect internal API operations.
* Support secure communication with the frontend.

## 🔗 Project Repositories

* **Backend Repository:** https://github.com/samiaislamridita670-ui/studio-space-server
* **Frontend Repository:** https://github.com/samiaislamridita670-ui/studio-space-client
* **Live Website:** https://studio-space-client-orpin.vercel.app/

## 🛠️ Technology Stack

* Node.js
* Express.js
* MongoDB
* MongoDB Node.js Driver
* JavaScript
* dotenv
* CORS
* Internal API Secret Verification

## ✨ Features

### Studio Management

* Get all available studios.
* Search studios.
* Filter studios by category.
* Limit and sort studio results.
* Get individual studio details.
* Create new studio listings.
* Update existing studio listings.
* Delete studio listings.
* Retrieve authenticated user's studio listings.

### Security

* Protected studio management endpoints.
* Internal API secret verification.
* Authenticated user identity verification.
* Studio ownership validation.
* Prevent unauthorized listing modifications.
* Server-side request validation.
* Environment-based secret configuration.

## 📁 Project Structure

```text
studio-space-server/
│
├── middleware/
│   └── verifyInternalRequest.js
│
├── routes/
│   ├── auth.js
│   └── studios.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/samiaislamridita670-ui/studio-space-server.git
```

### 2. Navigate to the Project

```bash
cd studio-space-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend root directory.

Add the required environment variables:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
INTERNAL_API_SECRET=your_shared_internal_api_secret
```

If additional variables are required by your project configuration, add them using the exact names expected by the source code.

**Important:**

* Never upload your `.env` file to GitHub.
* Keep database credentials and secret keys private.
* Configure the same `INTERNAL_API_SECRET` wherever internal request verification requires it.

### 5. Run the Development Server

```bash
npm run dev
```

The local backend API is expected to run at:

```text
http://localhost:8000
```

Use the development command defined in your `package.json`.

## 🔌 API Endpoints

### Base URL

```text
/api
```

### Studio APIs

| Method | Endpoint            | Description                       |
| ------ | ------------------- | --------------------------------- |
| GET    | `/api/studios`      | Get all studios                   |
| GET    | `/api/studios/:id`  | Get studio details                |
| GET    | `/api/studios/mine` | Get authenticated user's listings |
| POST   | `/api/studios`      | Create a studio                   |
| PUT    | `/api/studios/:id`  | Update a studio                   |
| DELETE | `/api/studios/:id`  | Delete a studio                   |

**Note:** Private listing operations require the appropriate authenticated internal requests from the frontend server.

### Authentication Routes

Authentication-related routes are available under:

```text
/api/auth
```

## 🔗 Frontend Integration

The frontend communicates with the backend through server-side Next.js API routes.

Configure the frontend environment variable:

```env
BACKEND_URL=http://localhost:8000
```

For production, use the deployed backend URL.

The frontend server communicates with the backend using the configured internal request verification mechanism.

## 🔐 Security Notes

* Internal API requests are verified using a shared secret.
* Secret comparisons use timing-safe verification.
* Authenticated user information is validated on the server.
* Studio ownership is checked before update and delete operations.
* Client-provided ownership information is not trusted for protected operations.
* Environment variables are excluded from version control.

## 🚀 Deployment

The backend is deployed using Vercel.

Production deployment requires:

* A valid MongoDB connection string.
* Correct production environment variables.
* A securely configured internal API secret.
* Proper frontend and backend integration.

**Live Backend URL:**
https://studio-space-server-jbg6.vercel.app

**Health Check:**
https://studio-space-server-jbg6.vercel.app/api/health

## 👩‍💻 Author

**Samia Islam Ridita**
CSE Undergraduate Student
Green University of Bangladesh
Dhaka, Bangladesh

**GitHub:** https://github.com/samiaislamridita670-ui

---

*StudioSpace — Find Your Creative Space.*
