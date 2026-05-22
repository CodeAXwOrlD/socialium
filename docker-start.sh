#!/bin/bash

echo "🚀 Starting Socialium with Docker Compose..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Error: Docker Compose is not installed."
    exit 1
fi

echo "✅ Docker is running"
echo "✅ Docker Compose is available"
echo ""

# Build and start services
echo "📦 Building and starting services..."
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🎉 Services are starting!"
echo ""
echo "📝 Access Points:"
echo "   - Frontend:    http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs:    http://localhost:8000/docs"
echo "   - Redis:       localhost:6379"
echo "   - PostgreSQL:  localhost:5432"
echo "   - Qdrant:      http://localhost:6333"
echo ""
echo "🔍 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
echo ""
echo "🗑  Stop and remove volumes:"
echo "   docker compose down -v"
echo ""
