# StudioSpace — Backend API

StudioSpace Backend is a RESTful API built with Node.js, Express.js, and MongoDB. It powers the StudioSpace Creative Studio Booking Platform by managing studio listings, authentication, and secure server-side operations.

## Project Overview

The backend provides APIs for:

* Retrieving available studios.
* Searching and filtering studio listings.
* Creating new studio listings.
* Updating and deleting studio listings.
* Managing studio ownership.
* Protecting private API operations.
* Supporting secure communication with the frontend.

## Backend Repository

https://github.com/samiaislamridita670-ui/studio-space-server

## Frontend Repository

https://github.com/samiaislamridita670-ui/studio-space-client

## Technology Stack

* Node.js
* Express.js 5
* MongoDB
* MongoDB Node.js Driver
* JSON Web Token (JWT)
* bcrypt
* dotenv
* CORS

## Features

### Studio Management

* Get all available studios.
* Search studios.
* Filter studios by category.
* Limit and sort studio results.
* Get individual studio details.
* Create new studio listings.
* Update existing studio listings.
* Delete studio listings.

### Security

* Protected studio management endpoints.
* Internal API secret verification.
* Authenticated user identity verification.
* Secure studio ownership validation.
* Prevents unauthorized listing modifications.
* Server-side request validation.

## Project Structure

```text
studio-space-server/
├── middleware/
│   └── verifyInternalRequest.js
├── routes/
│   ├── auth.js
│   └── studios.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

* Node.js
* npm
* MongoDB database
* Git

### 1. Clone the Repository

```bash id="1e5r1a"
git clone https://github.com/samiaislamridita670-ui/studio-space-server.git
```

### 2. Navigate to the Project

```bash id="7b7g8s"
cd studio-space-server
```

### 3. Install Dependencies

```bash id="6b5r4n"
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend root directory.

Add your own credentials:

```env id="d7p4fk"
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
INTERNAL_API_SECRET=your_shared_internal_api_secret
```

**Important:**

* Never upload `.env` to GitHub.
* Keep all secret credentials private.
* Use the same `INTERNAL_API_SECRET` in the frontend and backend environments.

### 5. Run the Development Server

```bash id="n5m4gq"
npm run dev
```

The backend API runs locally at:

http://localhost:5000

### 6. Run in Production Mode

```bash id="8d7w4v"
npm start
```

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Studio APIs

| Method | Endpoint        | Description                       |
| ------ | --------------- | --------------------------------- |
| GET    | `/studios`      | Get all studios                   |
| GET    | `/studios/:id`  | Get studio details                |
| GET    | `/studios/mine` | Get authenticated user's listings |
| POST   | `/studios`      | Create a studio                   |
| PUT    | `/studios/:id`  | Update a studio                   |
| DELETE | `/studios/:id`  | Delete a studio                   |

**Note:** The `/studios/mine` endpoint and studio modification operations require authenticated internal requests from the frontend server.

### Authentication

The backend also contains authentication-related routes under:

```text
/api/auth
```

## Frontend Integration

The frontend communicates with this backend through server-side Next.js API routes.

Configure the frontend environment variable:

```env id="1d0q2b"
BACKEND_URL=http://localhost:5000
```

The frontend sends authenticated user information and the internal API secret through server-side requests.

## Security Notes

* Internal API requests are verified using a shared secret.
* Secret comparisons use timing-safe verification.
* Authenticated user information is validated on the server.
* Studio ownership is checked before update and delete operations.
* Client-provided ownership information is not trusted for protected operations.
* Environment variables are excluded from version control.

## Deployment

The backend is intended to be deployed as a Node.js web service.

Production deployment requires:

* A valid MongoDB connection string.
* A secure JWT secret.
* A shared internal API secret.
* Correct production environment variables.

**Live Backend URL:** To be added after deployment.

## Author

**Samia Islam Ridita**

CSE Undergraduate Student
Green University of Bangladesh
Dhaka, Bangladesh

GitHub: https://github.com/samiaislamridita670-ui

---

*StudioSpace — Find Your Creative Space.*
