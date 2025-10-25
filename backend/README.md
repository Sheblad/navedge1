# NavEdge Phase 2 Backend API

Complete rental management system with AI features for fleet management.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Supabase JWT with role-based access (Owner/Renter)
- **Document OCR**: Emirates ID and driver license text extraction
- **Contract Generation**: Automated PDF contract creation
- **Damage Detection**: AI-powered before/after photo comparison
- **Fine Management**: Daily Dubai Police fine checking
- **Renter Chatbot**: Simple Q&A for renters
- **WhatsApp Integration**: Automated notifications
- **Reports & Analytics**: PDF/CSV export capabilities

### AI-Powered Features
- **OCR Processing**: Extract text from Emirates ID and driver licenses
- **Damage Detection**: Computer vision for vehicle damage assessment
- **Smart Notifications**: Context-aware alerts and reminders

## 🏗️ Architecture

```
NavEdge Backend
├── FastAPI (Python 3.11+)
├── PostgreSQL (via Supabase)
├── Redis (background jobs)
├── Tesseract OCR
├── OpenCV (image processing)
├── WhatsApp Business API
└── Email SMTP
```

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL
- Redis
- Tesseract OCR
- OpenCV
- Node.js 18+ (for frontend)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository>
cd navedge1/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your credentials
```

### 3. Database Setup
```bash
# Create database tables
python -c "from core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### 4. Run Development Server
```bash
python main.py
```

## 🔧 Production Deployment

### Automated Deployment (Recommended)
```bash
# Run the deployment script on your VPS
sudo ./run.sh
```

### Manual Deployment
1. **Install Dependencies**:
   ```bash
   apt update && apt upgrade -y
   apt install -y python3.11 python3.11-pip postgresql redis-server tesseract-ocr nginx
   ```

2. **Setup Database**:
   ```bash
   sudo -u postgres createdb navedge
   ```

3. **Configure Services**:
   - Copy systemd service file
   - Configure Nginx
   - Setup SSL with Let's Encrypt

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Document Processing
- `POST /api/documents/upload-id` - Upload Emirates ID for OCR
- `POST /api/documents/upload-license` - Upload driver license for OCR
- `GET /api/documents/my-documents` - Get user's documents

### Contract Management
- `POST /api/contracts/create` - Create new rental contract
- `GET /api/contracts/my-contracts` - Get user's contracts
- `GET /api/contracts/expiring` - Get expiring contracts
- `GET /api/contracts/{id}/pdf` - Download contract PDF

### Damage Detection
- `POST /api/damage/upload-before` - Upload before photos
- `POST /api/damage/upload-after` - Upload after photos
- `POST /api/damage/compare/{contract_id}` - Compare photos with AI
- `GET /api/damage/report/{contract_id}` - Get damage report

### Fine Management
- `POST /api/fines/check-dubai-police` - Check Dubai Police for fines
- `POST /api/fines/manual-add` - Manually add fine
- `GET /api/fines/my-fines` - Get user's fines

### Renter Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/intents` - Get available intents

### Notifications
- `POST /api/notifications/whatsapp/send` - Send WhatsApp notification
- `POST /api/notifications/email/send` - Send email notification
- `GET /api/notifications/my-notifications` - Get user's notifications

### Reports & Analytics
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/financial/summary` - Get financial summary
- `GET /api/reports/export-pdf` - Export PDF report
- `GET /api/reports/export-csv` - Export CSV report

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/navedge
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Authentication
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# WhatsApp Integration
WHATSAPP_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_ID=your-whatsapp-phone-id

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI Services
TESSERACT_PATH=/usr/bin/tesseract
OPENAI_API_KEY=your-openai-api-key
```

## 🤖 Background Jobs

The system includes automated background jobs:

- **Daily Fine Checking**: Checks Dubai Police at 9 AM UAE time
- **Contract Expiry Alerts**: Sends reminders at 8 AM UAE time
- **Daily Reports**: Generates reports at 6 PM UAE time

## 📱 WhatsApp Integration

### Setup WhatsApp Business API
1. Create WhatsApp Business Account
2. Get API credentials from Meta
3. Configure webhook for incoming messages
4. Update environment variables

### Message Templates
- Contract Created
- Fine Detected
- Damage Detected
- Contract Expiring
- Payment Reminder

## 🔍 AI Services

### OCR Processing
- **Emirates ID**: Extract name, ID number, DOB, nationality
- **Driver License**: Extract license number, name, expiry date

### Damage Detection
- **Before/After Comparison**: AI-powered damage assessment
- **Confidence Scoring**: Reliability metrics for damage detection
- **Damage Classification**: Categorize damage types (scratches, dents, etc.)

## 📊 Database Schema

### Core Tables
- `users` - User accounts (owners/renters)
- `organizations` - Fleet management organizations
- `cars` - Vehicle information
- `contracts` - Rental agreements
- `fines` - Traffic violations
- `damage_reports` - Vehicle damage assessments
- `document_uploads` - OCR processed documents
- `notifications` - Alert history

## 🚨 Health Monitoring

### Health Endpoints
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status
- `GET /health/database` - Database connectivity
- `GET /health/external` - External service status

## 🔧 Development

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
black .
flake8 .
```

### Database Migrations
```bash
alembic upgrade head
```

## 📈 Performance

### Optimizations
- Database indexing for common queries
- Redis caching for frequent data
- Background job processing
- Image compression for uploads
- CDN for static files

### Monitoring
- Application metrics
- Database performance
- Background job status
- Error tracking

## 🛡️ Security

### Security Features
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- File upload restrictions
- Rate limiting
- CORS configuration

### Best Practices
- Environment variable management
- Secret key rotation
- Database connection pooling
- Secure file storage
- HTTPS enforcement

## 📞 Support

For technical support or questions:
- Email: support@navedge.ai
- Documentation: https://docs.navedge.ai
- API Docs: http://navedge.ai/api/docs

## 📄 License

Copyright © 2024 NavEdge Fleet Management. All rights reserved.
