# Chachu Client Management System

A complete production-ready personal client management website for tracking client work and payments with reminder notifications.

## Features

- ✅ **Authentication**: Secure login/signup with JWT
- ✅ **Client Management**: Add, edit, delete clients with full details
- ✅ **Payment Tracking**: Record full or partial payments with history
- ✅ **Reminder System**: Browser notifications and sound alarms for due dates
- ✅ **Auto-Reschedule**: Automatic reminder rescheduling based on repeat days
- ✅ **Dashboard**: View all clients in card or table format
- ✅ **Client History**: Detailed view with payment history
- ✅ **Mobile Responsive**: Clean, modern UI that works on all devices

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Project Structure

```
chachu_website/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   └── payments.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientCard.jsx
│   │   │   ├── ClientForm.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── NotificationManager.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ClientDetail.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

**Backend `.env` file** (already configured):
```
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
```

### 3. Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 5000
MongoDB connected successfully
```

### 4. Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:3000/
```

### 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

### 6. Create Account

1. Open http://localhost:3000
2. Click "Register"
3. Enter email and password
4. Start adding clients!

**For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with your MongoDB connection string. If you need to modify it:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

4. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

**Backend:**
The backend is ready for production. Make sure to:
- Set `NODE_ENV=production` in your `.env` file
- Use a strong `JWT_SECRET`
- Configure proper CORS settings if needed

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Add Clients**: Click "Add Client" to create a new client record
3. **Set Reminders**: Configure next work date, reminder time, and repeat days
4. **Record Payments**: Mark payments as full or partial with notes
5. **View History**: Click on any client to see full payment history
6. **Notifications**: Allow browser notifications to receive reminders with sound alarms

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Clients
- `GET /api/clients` - Get all clients (protected)
- `GET /api/clients/:id` - Get single client (protected)
- `POST /api/clients` - Create client (protected)
- `PUT /api/clients/:id` - Update client (protected)
- `DELETE /api/clients/:id` - Delete client (protected)
- `GET /api/clients/reminders/today` - Get today's reminders (protected)

### Payments
- `GET /api/payments/client/:clientId` - Get payments for client (protected)
- `POST /api/payments` - Add payment (protected)
- `DELETE /api/payments/:id` - Delete payment (protected)

## Reminder System

The reminder system works as follows:

1. **Browser Notifications**: When a client's reminder time matches the current time, a browser notification is shown
2. **Sound Alarm**: A beep sound plays when the reminder triggers
3. **Auto-Reschedule**: If `repeatAfterDays` is set, the next work date is automatically updated
4. **Daily Reset**: Notifications reset at midnight to allow reminders for the next day

**Note**: 
- Make sure to allow browser notifications when prompted for the reminder system to work
- Notifications only trigger when the browser tab is open (or in background with permission)
- The alarm sound uses Web Audio API and works in modern browsers

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected API routes
- User-specific data isolation
- Input validation

## License

This project is for personal use.

## Support

For issues or questions, please check the code comments or modify as needed for your specific requirements.

