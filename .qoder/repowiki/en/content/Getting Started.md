# Getting Started

<cite>
**Referenced Files in This Document**
- [backend/pyproject.toml](file://backend/pyproject.toml)
- [frontend/package.json](file://frontend/package.json)
- [backend/.env.example](file://backend/.env.example)
- [frontend/.env.local.example](file://frontend/.env.local.example)
- [backend/app/main.py](file://backend/app/main.py)
- [backend/app/config.py](file://backend/app/config.py)
- [backend/app/database.py](file://backend/app/database.py)
- [backend/alembic/env.py](file://backend/alembic/env.py)
- [backend/alembic.ini](file://backend/alembic.ini)
- [frontend/README.md](file://frontend/README.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [First Run and Health Checks](#first-run-and-health-checks)
7. [Local Development](#local-development)
8. [Basic Usage Examples](#basic-usage-examples)
9. [Troubleshooting](#troubleshooting)
10. [Verification Checklist](#verification-checklist)

## Introduction
Welcome to Socialium, an AI-powered social media automation platform. This guide walks you through setting up the complete development environment, configuring services, running database migrations, and bringing the system online for the first time.

## Prerequisites
Before installing Socialium, ensure you have the following installed on your machine:

- Python 3.12 or newer
- Node.js (compatible with the frontend package)
- PostgreSQL (tested with recent versions)
- Redis (for caching and background tasks)
- Docker (optional, for containerized services)

These requirements are derived from the backend dependencies and the frontend toolchain configuration.

**Section sources**
- [backend/pyproject.toml](file://backend/pyproject.toml#L5-L25)
- [frontend/package.json](file://frontend/package.json#L1-L45)

## Installation

### Backend Setup
1. Navigate to the backend directory.
2. Install Python dependencies using your preferred package manager. The project requires Python 3.12+ and lists FastAPI, SQLAlchemy, Alembic, Redis, and other libraries as dependencies.
3. Set up environment variables by copying the example file to `.env` and filling in values as described in Environment Configuration.

Key backend dependencies include:
- FastAPI for the web framework
- Uvicorn for ASGI server
- SQLAlchemy asyncio for async database operations
- Alembic for database migrations
- Redis client for caching and queues
- OpenAI and Anthropic clients for LLM integrations
- APScheduler for background jobs
- Qdrant client for vector storage

**Section sources**
- [backend/pyproject.toml](file://backend/pyproject.toml#L1-L49)

### Frontend Setup
1. Navigate to the frontend directory.
2. Install JavaScript dependencies using your preferred package manager. The frontend uses Next.js 16.2.6 with React 19 and TypeScript.
3. Configure environment variables by copying the example file to `.env.local` and filling in values as described in Environment Configuration.

The frontend scripts include:
- Development server: runs on port 3000
- Build and production start commands
- Linting support

**Section sources**
- [frontend/package.json](file://frontend/package.json#L1-L45)
- [frontend/README.md](file://frontend/README.md#L1-L37)

## Environment Configuration

### Backend Environment Variables
Copy the example file to `.env` and set the following categories:

- Application: app name, environment, debug flag, secret key, API prefix
- Database: connection URL and echo setting
- Redis: connection URL
- JWT: secret key, algorithm, and token expiration
- OpenAI: API key and model settings
- Anthropic: API key and model settings
- Qdrant: URL, optional API key, and collection name
- OAuth Providers: LinkedIn, Twitter, Instagram, Facebook credentials
- Billing: Stripe keys
- Frontend URL: for CORS configuration
- Monitoring: optional Langfuse and PostHog keys

Important defaults and ports:
- Database URL defaults to a local PostgreSQL instance
- Redis URL defaults to a local Redis instance
- Frontend URL defaults to http://localhost:3000

**Section sources**
- [backend/.env.example](file://backend/.env.example#L1-L56)
- [backend/app/config.py](file://backend/app/config.py#L12-L77)

### Frontend Environment Variables
Copy the example file to `.env.local` and set:

- NEXT_PUBLIC_API_URL: points to the backend API base URL
- NEXTAUTH_URL: the frontend origin for authentication
- NEXTAUTH_SECRET: a strong secret for NextAuth
- Optional OAuth providers: GitHub and Google client IDs and secrets

Defaults:
- API URL points to http://localhost:8000/api/v1
- NEXTAUTH_URL points to http://localhost:3000

**Section sources**
- [frontend/.env.local.example](file://frontend/.env.local.example#L1-L16)

## Database Setup

### Database Configuration
The backend uses an async SQLAlchemy engine configured via environment variables. The default connection string targets a local PostgreSQL instance. You can adjust the URL in the backend environment file.

Connection parameters include:
- Async driver for PostgreSQL
- Echo setting for SQL logging
- Connection pooling parameters

**Section sources**
- [backend/app/database.py](file://backend/app/database.py#L12-L24)
- [backend/app/config.py](file://backend/app/config.py#L25-L27)

### Running Migrations
The project includes Alembic for database migrations. Alembic reads the database URL from the backend settings and applies migrations against the configured database.

Key configuration points:
- Alembic environment loads settings and registers all models for autogenerate
- Migration script supports offline and online modes
- Alembic configuration file defines the default URL and logging

Recommended steps:
1. Ensure PostgreSQL is running and accessible.
2. Set the DATABASE_URL in the backend environment file to match your database.
3. Run Alembic migrations using the Alembic CLI from the backend directory.

**Section sources**
- [backend/alembic/env.py](file://backend/alembic/env.py#L10-L22)
- [backend/alembic/env.py](file://backend/alembic/env.py#L44-L58)
- [backend/alembic.ini](file://backend/alembic.ini#L1-L41)

## First Run and Health Checks

### Starting the Backend
- The backend entry point creates a FastAPI app with CORS enabled for the configured frontend URL.
- It registers routers for authentication, content, analytics, approvals, platforms, scheduling, memory, workspace, and billing.
- A health check endpoint returns application status, name, and environment.

Start the backend server using the ASGI server configured in the backend dependencies.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L36-L77)
- [backend/app/main.py](file://backend/app/main.py#L79-L83)

### Starting the Frontend
- The frontend development server runs on port 3000.
- Open http://localhost:3000 in your browser to access the dashboard.

**Section sources**
- [frontend/README.md](file://frontend/README.md#L5-L17)

### Health Check Verification
- Backend health endpoint: GET /health
- Expected response includes application status, name, and environment

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L79-L83)

## Local Development

### Hot Reload and Development Workflow
- Backend: Use the ASGI server configured in the backend dependencies for hot reload during development.
- Frontend: Use the Next.js development server with automatic page reloading.

Common development tasks:
- Run both backend and frontend servers concurrently.
- Verify CORS is configured to allow requests from the frontend origin.
- Monitor database queries with the echo setting if needed.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L46-L52)
- [frontend/package.json](file://frontend/package.json#L5-L10)

## Basic Usage Examples

### Authentication Flow
- The backend exposes an authentication router under the API prefix.
- The frontend uses NextAuth for authentication and communicates with the backend API.

Typical endpoints:
- Backend: /api/v1/auth/*
- Frontend: NextAuth routes configured via environment variables

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L58-L58)
- [frontend/.env.local.example](file://frontend/.env.local.example#L8-L9)

### Content and Scheduling
- Content creation and scheduling endpoints are exposed under the API prefix.
- The frontend provides pages for content creation, scheduling, and analytics dashboards.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L59-L76)

## Troubleshooting

### Common Setup Issues

- Database connectivity
  - Ensure PostgreSQL is running and the DATABASE_URL matches your database host, port, and credentials.
  - Verify the database exists and is accessible.

- Redis connectivity
  - Confirm Redis is running and the REDIS_URL matches your Redis host and port.
  - Test connectivity using a Redis client.

- CORS errors
  - Ensure FRONTEND_URL in backend environment matches the frontend origin.
  - Verify the frontend NEXTAUTH_URL also matches the frontend origin.

- Missing environment variables
  - Copy the example environment files to .env and .env.local respectively.
  - Fill in required values for OAuth providers, LLM APIs, and billing if needed.

- Migration failures
  - Confirm DATABASE_URL is correct.
  - Run migrations again after fixing connection issues.

**Section sources**
- [backend/.env.example](file://backend/.env.example#L8-L13)
- [backend/.env.example](file://backend/.env.example#L49-L50)
- [frontend/.env.local.example](file://frontend/.env.local.example#L5-L9)
- [backend/alembic/env.py](file://backend/alembic/env.py#L20-L22)

## Verification Checklist

- Backend
  - Python 3.12+ is installed
  - Dependencies installed via the backend package manager
  - .env file configured with database, Redis, JWT, and API keys
  - PostgreSQL and Redis are reachable
  - Alembic migrations applied successfully
  - Health check returns healthy status

- Frontend
  - Node.js dependencies installed
  - .env.local configured with API URL and NextAuth settings
  - Development server starts on port 3000
  - Browser opens the dashboard successfully

- Cross-cutting
  - CORS allows requests from frontend origin
  - API base URL in frontend matches backend API prefix

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L79-L83)
- [frontend/README.md](file://frontend/README.md#L5-L17)