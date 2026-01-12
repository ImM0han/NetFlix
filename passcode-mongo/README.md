# Password Manager

A full-stack password manager application built with React, Express.js, and MongoDB.

## Features

- 🔐 Secure password storage with user authentication
- 👤 User registration and login with email/phone/username
- 🔒 JWT-based authentication and session management
- 🌐 Website and username management
- 📋 Copy to clipboard functionality
- 🗑️ Delete passwords
- ✏️ Edit existing passwords
- 🔍 Search functionality
- 📱 Responsive design with Tailwind CSS
- 🛡️ User-specific password isolation

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for password hashing
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Create a `.env` file in the `backend` directory with the following variables:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=password_manager
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=password_manager
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
```

**Important:** Generate a strong, random JWT_SECRET for production use. You can use online generators or run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate one.

### 3. Start the Application

#### Option 1: Start Both Servers (Recommended)
```bash
npm run start:dev
```

#### Option 2: Start Servers Separately
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Password Management (Protected Routes)
- `GET /passwords` - Fetch user's passwords
- `POST /passwords` - Save a new password
- `DELETE /passwords/:id` - Delete a password by ID

### Legacy Routes (Protected)
- `GET /` - Fetch user's passwords
- `POST /` - Save a new password
- `DELETE /:id` - Delete a password by ID

## Project Structure

```
passcode-mongo/
├── backend/
│   ├── server.js          # Express server with authentication
│   ├── package.json       # Backend dependencies
│   └── .env               # Environment variables (create this)
├── src/
│   ├── comp/
│   │   ├── Auth.jsx       # Login/Register component
│   │   ├── Manager.jsx    # Main password management component
│   │   ├── Navbar.jsx     # Navigation component with logout
│   │   └── Footer.jsx     # Footer component
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context
│   ├── services/
│   │   └── api.js         # API service functions with auth
│   └── App.jsx            # Main app component with auth routing
├── vite.config.js         # Vite configuration with proxy
└── start-dev.js           # Development server starter
```

## Development

The application uses Vite's proxy feature to forward `/api` requests to the backend server, eliminating CORS issues during development.

## Security Notes

- This is a development application
- For production use, implement proper authentication and encryption
- Consider using environment variables for sensitive configuration
- Implement HTTPS in production

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or your Atlas connection string is correct
- Check that the database name in `.env` matches your MongoDB database

### Port Conflicts
- Backend runs on port 3000 by default
- Frontend runs on port 5173 by default
- Modify ports in `.env` and `vite.config.js` if needed

### CORS Issues
- The backend has CORS enabled for all origins
- The frontend uses Vite proxy to avoid CORS issues