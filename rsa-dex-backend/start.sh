#!/bin/bash

# RSA DEX Backend Startup Script
# This script will handle database setup and start the backend server

echo "🚀 Starting RSA DEX Backend..."
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! nc -z localhost 5432 2>/dev/null; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo ""
    echo "🔧 Please start PostgreSQL first:"
    echo "   macOS (Homebrew): brew services start postgresql"
    echo "   Linux (systemd): sudo systemctl start postgresql"
    echo "   Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found, using defaults"
fi

# Setup database
echo "📊 Setting up database..."
node setup-db.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo ""
    echo "🚀 Starting RSA DEX Backend server..."
    echo "   - Backend API: http://localhost:8001"
    echo "   - WebSocket: ws://localhost:8002"
    echo ""
    
    # Start the server
    npm start
else
    echo "❌ Database setup failed. Please check the error messages above."
    exit 1
fi