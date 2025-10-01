#!/bin/bash

# Deployment script for CPHVA Connect on Linode
set -e

echo "🚀 Starting deployment of CPHVA Connect..."

# Check if we're on the server
if [ ! -f "/etc/os-release" ] || ! grep -q "Ubuntu" /etc/os-release; then
    echo "❌ This script should be run on your Ubuntu Linode server"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx (for SSL termination if not using Docker)
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL certificates
echo "🔒 Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /opt/cphva-connect
cd /opt/cphva-connect

# Create SSL directory
mkdir -p ssl

# Create a simple self-signed certificate for initial setup
echo "🔐 Creating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✅ Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy your application files to /opt/cphva-connect"
echo "2. Run 'docker-compose up -d' to start the application"
echo "3. Configure your domain and get a real SSL certificate with:"
echo "   certbot --nginx -d yourdomain.com"
echo ""
echo "Your application will be available at:"
echo "- HTTP: http://your-server-ip"
echo "- HTTPS: https://your-server-ip (with self-signed cert)"
