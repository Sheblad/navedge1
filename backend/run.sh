#!/bin/bash

# NavEdge Phase 2 Backend Deployment Script
# This script sets up and runs the NavEdge backend on your VPS

set -e

echo "🚀 Starting NavEdge Phase 2 Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Python 3.11 and pip
print_status "Installing Python 3.11 and pip..."
apt install -y python3.11 python3.11-pip python3.11-venv

# Install system dependencies
print_status "Installing system dependencies..."
apt install -y \
    postgresql postgresql-contrib \
    redis-server \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ara \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    libgtk-3-0 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libatlas-base-dev \
    python3-dev \
    build-essential \
    nginx \
    supervisor

# Install Node.js (for frontend)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create application directory
print_status "Setting up application directory..."
mkdir -p /opt/navedge
cd /opt/navedge

# Create virtual environment
print_status "Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Setup PostgreSQL
print_status "Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE navedge;
CREATE USER navedge_user WITH PASSWORD 'navedge_password';
GRANT ALL PRIVILEGES ON DATABASE navedge TO navedge_user;
\q
EOF

# Setup Redis
print_status "Setting up Redis..."
systemctl start redis-server
systemctl enable redis-server

# Create upload directories
print_status "Creating upload directories..."
mkdir -p /opt/navedge/uploads/{contracts,damage/{before,after},documents,reports}

# Set permissions
chown -R www-data:www-data /opt/navedge/uploads
chmod -R 755 /opt/navedge/uploads

# Create environment file
print_status "Creating environment configuration..."
cat > /opt/navedge/backend/.env << EOF
# NavEdge Phase 2 Backend Configuration

# Database
DATABASE_URL=postgresql://navedge_user:navedge_password@localhost/navedge
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Authentication
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379

# WhatsApp Integration
WHATSAPP_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_ID=your-whatsapp-phone-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI Services
TESSERACT_PATH=/usr/bin/tesseract
OPENAI_API_KEY=your-openai-api-key

# Dubai Police Integration
DUBAI_POLICE_BASE_URL=https://www.dubaipolice.gov.ae

# File Storage
UPLOAD_DIR=/opt/navedge/uploads
MAX_FILE_SIZE=10485760

# Environment
ENVIRONMENT=production
DEBUG=false
EOF

# Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/navedge-backend.service << EOF
[Unit]
Description=NavEdge Phase 2 Backend API
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/navedge/backend
Environment=PATH=/opt/navedge/venv/bin
ExecStart=/opt/navedge/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/navedge << EOF
server {
    listen 80;
    server_name navedge.ai www.navedge.ai;

    # Frontend (React app)
    location / {
        root /opt/navedge/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # File uploads
    location /uploads/ {
        alias /opt/navedge/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/navedge /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start services
print_status "Starting services..."
systemctl daemon-reload
systemctl enable navedge-backend
systemctl start navedge-backend
systemctl restart nginx

# Check service status
print_status "Checking service status..."
systemctl status navedge-backend --no-pager

# Setup SSL with Let's Encrypt (optional)
print_warning "To setup SSL with Let's Encrypt, run:"
echo "certbot --nginx -d navedge.ai -d www.navedge.ai"

print_status "🎉 NavEdge Phase 2 Backend deployment completed!"
print_status "Backend API: http://navedge.ai/api/"
print_status "API Documentation: http://navedge.ai/api/docs"
print_status "Health Check: http://navedge.ai/api/health"

echo ""
print_status "Next steps:"
echo "1. Configure your Supabase credentials in /opt/navedge/backend/.env"
echo "2. Setup WhatsApp Business API credentials"
echo "3. Configure email SMTP settings"
echo "4. Run database migrations: cd /opt/navedge/backend && python -c 'from core.database import Base, engine; Base.metadata.create_all(bind=engine)'"
echo "5. Deploy your frontend to /opt/navedge/frontend/"
