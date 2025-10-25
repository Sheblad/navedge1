#!/bin/bash

# NavEdge Phase 2 Deployment Script
# Run this script to deploy to your VPS

echo "🚀 Starting NavEdge Phase 2 Deployment..."

# VPS Details
VPS_IP="185.241.151.219"
VPS_USER="root"
VPS_PASSWORD="Upwork123"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf navedge-backend.tar.gz backend/

# Upload to VPS using rsync with password
echo "📤 Uploading to VPS..."
sshpass -p "$VPS_PASSWORD" scp navedge-backend.tar.gz $VPS_USER@$VPS_IP:/tmp/

# Execute deployment commands on VPS
echo "🔧 Deploying on VPS..."
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_IP << 'EOF'
    # Extract the package
    cd /tmp
    tar -xzf navedge-backend.tar.gz
    
    # Create application directory
    mkdir -p /opt/navedge
    cp -r backend/* /opt/navedge/
    
    # Make deployment script executable
    chmod +x /opt/navedge/run.sh
    
    # Run the deployment
    cd /opt/navedge
    ./run.sh
    
    echo "✅ Deployment completed!"
EOF

echo "🎉 NavEdge Phase 2 deployment completed!"
echo "🌐 Your API should be available at: http://185.241.151.219:8000"
echo "📚 API Documentation: http://185.241.151.219:8000/api/docs"
echo "🏥 Health Check: http://185.241.151.219:8000/health"
