#!/bin/bash

# CPHVA Connect Database Setup Script
# This script sets up a local SQL database for development

set -e

echo "🚀 Setting up CPHVA Connect Database..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if PostgreSQL container is already running
if docker ps | grep -q cphva-postgres; then
    echo "📦 PostgreSQL container is already running"
else
    echo "📦 Starting PostgreSQL container..."
    docker run --name cphva-postgres \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_DB=cphva_connect \
        -p 5432:5432 \
        -d postgres:15
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql is not installed. Please install PostgreSQL client tools."
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Create database (if it doesn't exist)
echo "🗄️  Creating database..."
psql -h localhost -U postgres -c "CREATE DATABASE cphva_connect;" 2>/dev/null || echo "Database already exists"

# Run schema
echo "📋 Creating database schema..."
psql -h localhost -U postgres -d cphva_connect -f schema.sql

# Seed database
echo "🌱 Seeding database with sample data..."
psql -h localhost -U postgres -d cphva_connect -f seed.sql

echo "✅ Database setup complete!"
echo ""
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: cphva_connect"
echo "   Username: postgres"
echo "   Password: password"
echo ""
echo "🔗 Connection string: postgresql://postgres:password@localhost:5432/cphva_connect"
echo ""
echo "📝 Next steps:"
echo "   1. Update your application to connect to this database"
echo "   2. Implement authentication replacement for Firebase Auth"
echo "   3. Set up file storage replacement for Firebase Storage"
echo "   4. Test all functionality"
echo ""
echo "🛑 To stop the database: docker stop cphva-postgres"
echo "🔄 To restart: docker start cphva-postgres"
