# NavEdge Fleet Management - FastAPI Integration Guide

## Base URL
```
http://185.241.151.219:8000
```

## Authentication

All API requests require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

### Endpoints

#### Register New User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user_id": "123"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Content-Type:** `application/x-www-form-urlencoded`
- **Body:**
  ```
  username=user@example.com
  password=password123
  ```
- **Response:**
  ```json
  {
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
  ```

## Document Processing (OCR)

### Upload Emirates ID
- **POST** `/api/documents/upload-id`
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `file` field
- **Response:**
  ```json
  {
    "extracted_data": {
      "name": "Ahmed Mohammed",
      "id_number": "784-1990-1234567-1",
      "expiry_date": "2025-12-31",
      "nationality": "UAE"
    },
    "confidence": 0.95
  }
  ```

### Upload Driver License
- **POST** `/api/documents/upload-license`
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `file` field
- **Response:**
  ```json
  {
    "extracted_data": {
      "name": "Ahmed Mohammed",
      "license_number": "12345678",
      "expiry_date": "2025-12-31"
    },
    "confidence": 0.93
  }
  ```

## Contracts

### Create Contract
- **POST** `/api/contracts/create`
- **Body:**
  ```json
  {
    "driver_id": "driver123",
    "vehicle_id": "vehicle456",
    "start_date": "2024-01-01",
    "end_date": "2025-01-01",
    "rental_amount": 1200,
    "deposit_amount": 5000
  }
  ```
- **Response:**
  ```json
  {
    "contract_id": "contract789",
    "status": "active",
    "created_at": "2024-01-01T10:00:00Z"
  }
  ```

### Get My Contracts
- **GET** `/api/contracts/my-contracts`
- **Response:**
  ```json
  [
    {
      "contract_id": "contract789",
      "driver_id": "driver123",
      "vehicle_id": "vehicle456",
      "start_date": "2024-01-01",
      "end_date": "2025-01-01",
      "rental_amount": 1200,
      "deposit_amount": 5000,
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
  ```

### Get Contract PDF
- **GET** `/api/contracts/{contract_id}/pdf`
- **Response:** PDF file (application/pdf)

## Damage Detection

### Upload Before Photo
- **POST** `/api/damage/upload-before`
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `file` field
- **Response:**
  ```json
  {
    "photo_id": "photo123"
  }
  ```

### Upload After Photo
- **POST** `/api/damage/upload-after`
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `file` field
- **Response:**
  ```json
  {
    "photo_id": "photo456"
  }
  ```

### Compare Damage Photos
- **POST** `/api/damage/compare/{contract_id}`
- **Response:**
  ```json
  {
    "damages_detected": true,
    "damage_locations": [
      {
        "type": "Scratch",
        "severity": "Minor",
        "location": "Front Bumper",
        "confidence": 0.89
      }
    ],
    "estimated_cost": 250.00
  }
  ```

## Fine Management

### Check Dubai Police Fines
- **POST** `/api/fines/check-dubai-police`
- **Body:**
  ```json
  {
    "vehicle_plate": "ABC123"
  }
  ```
- **Response:**
  ```json
  {
    "fines": [
      {
        "fine_id": "fine123",
        "violation": "Speeding",
        "amount": 500,
        "date": "2024-01-15",
        "status": "pending",
        "location": "Sheikh Zayed Road"
      }
    ],
    "total_amount": 500
  }
  ```

### Get My Fines
- **GET** `/api/fines/my-fines`
- **Response:**
  ```json
  {
    "fines": [
      {
        "fine_id": "fine123",
        "violation": "Speeding",
        "amount": 500,
        "date": "2024-01-15",
        "status": "pending",
        "location": "Sheikh Zayed Road"
      }
    ],
    "total_amount": 500
  }
  ```

## Chatbot

### Send Message
- **POST** `/api/chatbot/message`
- **Body:**
  ```json
  {
    "message": "How long do I have left on my contract?",
    "conversation_id": "conv_12345"
  }
  ```
- **Response:**
  ```json
  {
    "message": "You have 6 months remaining on your contract, ending on 2025-01-01.",
    "suggestions": [
      "Do I have any fines?",
      "How many km do I have left?"
    ]
  }
  ```

## WhatsApp Notifications

### Send WhatsApp Notification
- **POST** `/api/notifications/whatsapp/send`
- **Body:**
  ```json
  {
    "phone_number": "+971501234567",
    "message": "Your monthly rental payment is due.",
    "template_name": "payment_reminder"
  }
  ```
- **Response:**
  ```json
  {
    "message_id": "msg123",
    "status": "sent"
  }
  ```

## Reports

### Get Dashboard Report
- **GET** `/api/reports/dashboard`
- **Response:**
  ```json
  {
    "total_contracts": 150,
    "active_contracts": 120,
    "total_revenue": 180000,
    "pending_fines": 15,
    "vehicles_in_use": 95,
    "damages_reported": 3
  }
  ```

### Export PDF Report
- **GET** `/api/reports/export-pdf`
- **Response:** PDF file (application/pdf)

## Component Integration

### Login Component
- Uses `/api/auth/login` for authentication
- Falls back to demo mode if API is unavailable
- Stores JWT token in localStorage as 'fastapi_token'

### Document OCR Component
- Uses `/api/documents/upload-id` and `/api/documents/upload-license`
- Displays extracted data with confidence scores
- Supports Emirates ID and Driver License scanning

### Damage Detection Component
- Uses `/api/damage/upload-before`, `/api/damage/upload-after`, and `/api/damage/compare/{contract_id}`
- Shows AI-detected damage with severity levels
- Provides cost estimation for repairs

### Contract Generator Component
- Uses `/api/contracts/create` to generate contracts
- Fetches PDF using `/api/contracts/{contract_id}/pdf`
- Integrates with Document OCR for automatic data extraction

### Contracts Component
- Uses `/api/contracts/my-contracts` to load user's contracts
- Falls back to mock data if API is unavailable

### Renter Chatbot Component
- Uses `/api/chatbot/message` for intelligent responses
- Provides contextual suggestions based on user role
- Supports quick queries about contracts, fines, and km limits

### WhatsApp Sender Component
- Uses `/api/notifications/whatsapp/send`
- Provides quick templates for common notifications
- Supports custom messages

### Reports Component
- Uses `/api/reports/dashboard` for analytics data
- Uses `/api/reports/export-pdf` for PDF export
- Falls back to local data visualization if API is unavailable

### Fines Component
- Uses `/api/fines/check-dubai-police` for live fine checking
- Uses `/api/fines/my-fines` to fetch user's fines
- Displays fine details with payment status

## Error Handling

All components implement proper error handling:
- Try FastAPI backend first
- Fallback to local/mock data on failure
- Display user-friendly error messages
- Log errors to console for debugging

## Security

- All requests include JWT token in Authorization header
- Tokens stored securely in localStorage
- API calls use HTTPS (ensure backend supports it)
- Sensitive data encrypted in transit
