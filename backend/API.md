# Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication

All client routes require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Chachu" // optional
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Chachu"
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Chachu"
  }
}
```

---

## Client Endpoints

All client endpoints require authentication.

### POST /clients
Create a new client.

**Request Body:**
```json
{
  "name": "Client Name", // required
  "mobile": "1234567890",
  "address": "Client Address",
  "workDescription": "Work description",
  "workDate": "2024-01-15",
  "nextWorkDate": "2024-01-20",
  "reminderTime": "09:00",
  "repeatAfterDays": 7,
  "totalAmount": 5000
}
```

**Response:**
```json
{
  "_id": "client_id",
  "userId": "user_id",
  "name": "Client Name",
  "mobile": "1234567890",
  "address": "Client Address",
  "workDescription": "Work description",
  "workDate": "2024-01-15T00:00:00.000Z",
  "nextWorkDate": "2024-01-20T00:00:00.000Z",
  "reminderTime": "09:00",
  "repeatAfterDays": 7,
  "totalAmount": 5000,
  "receivedAmount": 0,
  "remainingAmount": 5000,
  "status": "Pending",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### GET /clients
Get all clients for the authenticated user.

**Response:**
```json
[
  {
    "_id": "client_id",
    "name": "Client Name",
    "mobile": "1234567890",
    "status": "Pending",
    "totalAmount": 5000,
    "receivedAmount": 0,
    "remainingAmount": 5000,
    ...
  }
]
```

### GET /clients/:id
Get a single client by ID.

**Response:**
```json
{
  "_id": "client_id",
  "name": "Client Name",
  "mobile": "1234567890",
  "status": "Pending",
  ...
}
```

### PUT /clients/:id
Update a client.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "mobile": "9876543210",
  "address": "New Address",
  "workDescription": "Updated description",
  "workDate": "2024-01-16",
  "nextWorkDate": "2024-01-21",
  "reminderTime": "10:00",
  "repeatAfterDays": 14,
  "totalAmount": 6000
}
```

**Response:**
```json
{
  "_id": "client_id",
  "name": "Updated Name",
  ...
}
```

### POST /clients/:id/payment
Add a payment to a client.

**Request Body:**
```json
{
  "amount": 2000, // required if isFullPayment is false
  "notes": "Payment notes",
  "isFullPayment": false // if true, amount is ignored and remaining amount is used
}
```

**Response:**
```json
{
  "payment": {
    "_id": "payment_id",
    "userId": "user_id",
    "clientId": "client_id",
    "amount": 2000,
    "paymentDate": "2024-01-15T10:00:00.000Z",
    "notes": "Payment notes"
  },
  "client": {
    "_id": "client_id",
    "receivedAmount": 2000,
    "remainingAmount": 3000,
    "status": "Partial",
    ...
  }
}
```

### PUT /clients/:id/complete
Mark a client as completed (sets status to Completed, receivedAmount to totalAmount, remainingAmount to 0).

**Response:**
```json
{
  "message": "Client marked as completed",
  "client": {
    "_id": "client_id",
    "status": "Completed",
    "receivedAmount": 5000,
    "remainingAmount": 0,
    ...
  }
}
```

---

## Database Schemas

### User Schema
```javascript
{
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars, hashed),
  name: String (default: 'Chachu'),
  timestamps: true
}
```

### Client Schema
```javascript
{
  userId: ObjectId (ref: User, required),
  name: String (required),
  mobile: String,
  address: String,
  workDescription: String,
  workDate: Date (default: now),
  nextWorkDate: Date,
  reminderTime: String (default: '09:00', format: 'HH:MM'),
  repeatAfterDays: Number (default: 0),
  totalAmount: Number (default: 0),
  receivedAmount: Number (default: 0),
  remainingAmount: Number (auto-calculated),
  status: String (enum: ['Pending', 'Partial', 'Completed'], default: 'Pending'),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Payment Schema
```javascript
{
  userId: ObjectId (ref: User, required),
  clientId: ObjectId (ref: Client, required),
  amount: Number (required, min: 0),
  paymentDate: Date (default: now),
  notes: String,
  timestamps: true
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error message",
  "error": "Detailed error message" // in development
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error



