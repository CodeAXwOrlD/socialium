# Backend Architecture

<cite>
**Referenced Files in This Document**
- [backend/app/main.py](file://backend/app/main.py)
- [backend/app/config.py](file://backend/app/config.py)
- [backend/app/database.py](file://backend/app/database.py)
- [backend/app/dependencies.py](file://backend/app/dependencies.py)
- [backend/app/core/security.py](file://backend/app/core/security.py)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py)
- [backend/app/core/logging.py](file://backend/app/core/logging.py)
- [backend/app/core/constants.py](file://backend/app/core/constants.py)
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py)
- [backend/app/routers/content.py](file://backend/app/routers/content.py)
- [backend/app/schemas/auth.py](file://backend/app/schemas/auth.py)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py)
- [backend/app/models/user.py](file://backend/app/models/user.py)
- [backend/app/models/content.py](file://backend/app/models/content.py)
- [backend/app/repositories/user_repository.py](file://backend/app/repositories/user_repository.py)
- [backend/pyproject.toml](file://backend/pyproject.toml)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the backend architecture of Socialium’s FastAPI application. It explains how the system follows a clean architecture pattern with clear separation between:
- Presentation (routers)
- Application (services)
- Domain (models)
- Infrastructure (database, external services)

It also documents application initialization, dependency injection, middleware configuration, routing and request/response flow, error handling, security (JWT, CORS), database integration (SQLAlchemy ORM, connection pooling, transactions), logging, monitoring, and cross-cutting concerns such as validation and rate limiting.

## Project Structure
The backend is organized into layered packages:
- app.main: Application entrypoint, lifespan, middleware, and router registration
- app.config: Centralized settings management using Pydantic Settings
- app.dependencies: Dependency injection type aliases
- app.database: Async SQLAlchemy engine, session factory, base model
- app.core: Security utilities, exception handlers, logging, constants
- app.models: SQLAlchemy ORM models
- app.repositories: Data access abstractions
- app.schemas: Pydantic request/response models
- app.services: Business logic orchestration
- app.routers: FastAPI route handlers
- app.workers: Background job coordination (future extension)

```mermaid
graph TB
subgraph "Presentation Layer"
RAuth["routers/auth.py"]
RContent["routers/content.py"]
end
subgraph "Application Layer"
SAuth["services/auth_service.py"]
SContent["services/content_generation_service.py"]
end
subgraph "Domain Layer"
MUser["models/user.py"]
MContent["models/content.py"]
end
subgraph "Infrastructure Layer"
DB["database.py"]
Cfg["config.py"]
Sec["core/security.py"]
Log["core/logging.py"]
Ex["core/exceptions.py"]
Dep["dependencies.py"]
end
RAuth --> SAuth
RContent --> SContent
SAuth --> DB
SContent --> DB
SAuth --> MUser
SContent --> MContent
DB --> Cfg
Sec --> Cfg
Log --> Cfg
Ex --> Cfg
Dep --> DB
Dep --> Cfg
```

**Diagram sources**
- [backend/app/main.py](file://backend/app/main.py#L1-L83)
- [backend/app/config.py](file://backend/app/config.py#L1-L83)
- [backend/app/database.py](file://backend/app/database.py#L1-L43)
- [backend/app/dependencies.py](file://backend/app/dependencies.py#L1-L14)
- [backend/app/core/security.py](file://backend/app/core/security.py#L1-L50)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L1-L90)
- [backend/app/core/logging.py](file://backend/app/core/logging.py#L1-L25)
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L1-L69)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L1-L94)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L1-L68)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L1-L98)
- [backend/app/models/user.py](file://backend/app/models/user.py#L1-L48)
- [backend/app/models/content.py](file://backend/app/models/content.py#L1-L42)

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L1-L83)
- [backend/app/config.py](file://backend/app/config.py#L1-L83)
- [backend/app/database.py](file://backend/app/database.py#L1-L43)
- [backend/app/dependencies.py](file://backend/app/dependencies.py#L1-L14)
- [backend/app/core/security.py](file://backend/app/core/security.py#L1-L50)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L1-L90)
- [backend/app/core/logging.py](file://backend/app/core/logging.py#L1-L25)
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L1-L69)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L1-L94)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L1-L68)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L1-L98)
- [backend/app/models/user.py](file://backend/app/models/user.py#L1-L48)
- [backend/app/models/content.py](file://backend/app/models/content.py#L1-L42)

## Core Components
- Application entrypoint and lifecycle: Initializes FastAPI app, sets lifespan, registers middleware, exception handlers, and includes routers.
- Configuration: Centralized settings via Pydantic Settings with environment variable loading and caching.
- Dependency injection: Typed dependency aliases for database sessions and settings.
- Database: Async SQLAlchemy engine with connection pooling and automatic commit/rollback.
- Security: JWT utilities for token creation/refresh/verification and password hashing.
- Exceptions: Custom exception hierarchy and global handlers returning structured JSON responses.
- Logging: Structured logging configuration with leveled output and suppressed noisy loggers.
- Constants: Enumerations and platform limits used across services and schemas.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L1-L83)
- [backend/app/config.py](file://backend/app/config.py#L1-L83)
- [backend/app/dependencies.py](file://backend/app/dependencies.py#L1-L14)
- [backend/app/database.py](file://backend/app/database.py#L1-L43)
- [backend/app/core/security.py](file://backend/app/core/security.py#L1-L50)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L1-L90)
- [backend/app/core/logging.py](file://backend/app/core/logging.py#L1-L25)
- [backend/app/core/constants.py](file://backend/app/core/constants.py#L1-L85)

## Architecture Overview
The system follows a layered clean architecture:
- Presentation (routers) accept requests and delegate to services.
- Application (services) encapsulate business logic and coordinate repositories/models.
- Domain (models) define persistent entities and relationships.
- Infrastructure (database, external services) provides persistence and integrations.

```mermaid
graph TB
Client["Client"]
Router["FastAPI Router<br/>routers/*"]
Service["Service<br/>services/*"]
Repo["Repository<br/>repositories/*"]
Model["ORM Model<br/>models/*"]
DB["Async Engine & Session<br/>database.py"]
Cfg["Settings<br/>config.py"]
Sec["Security Utilities<br/>core/security.py"]
Log["Logging<br/>core/logging.py"]
Ex["Exceptions<br/>core/exceptions.py"]
Client --> Router
Router --> Service
Service --> Repo
Repo --> Model
Model --> DB
Service --> DB
Service --> Sec
Service --> Cfg
Router --> Ex
Service --> Ex
DB --> Cfg
Log --> Cfg
```

**Diagram sources**
- [backend/app/main.py](file://backend/app/main.py#L1-L83)
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L1-L69)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L1-L94)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L1-L68)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L1-L98)
- [backend/app/repositories/user_repository.py](file://backend/app/repositories/user_repository.py#L1-L40)
- [backend/app/models/user.py](file://backend/app/models/user.py#L1-L48)
- [backend/app/models/content.py](file://backend/app/models/content.py#L1-L42)
- [backend/app/database.py](file://backend/app/database.py#L1-L43)
- [backend/app/config.py](file://backend/app/config.py#L1-L83)
- [backend/app/core/security.py](file://backend/app/core/security.py#L1-L50)
- [backend/app/core/logging.py](file://backend/app/core/logging.py#L1-L25)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L1-L90)

## Detailed Component Analysis

### Application Initialization and Lifecycle
- Lifespan: Startup/shutdown hooks print environment info and allow cleanup.
- Middleware: CORS configured for frontend origin with credentials, methods, and headers.
- Exception handlers: Global handlers for custom exceptions and generic errors.
- Router registration: Includes routers under a versioned prefix with tags.

```mermaid
sequenceDiagram
participant Client as "Client"
participant App as "FastAPI App"
participant Lifespan as "Lifespan"
participant CORS as "CORS Middleware"
participant Ex as "Exception Handlers"
participant Router as "Routers"
Client->>App : "HTTP Request"
App->>Lifespan : "Startup (on cold start)"
Lifespan-->>App : "Ready"
App->>CORS : "Apply CORS policy"
App->>Ex : "Register handlers"
App->>Router : "Route to handler"
Router-->>Client : "Response"
App->>Lifespan : "Shutdown (on exit)"
```

**Diagram sources**
- [backend/app/main.py](file://backend/app/main.py#L26-L58)

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L1-L83)

### Dependency Injection Setup
- Typed dependencies: DatabaseDep and SettingsDep enable consistent injection across routers and services.
- Session lifecycle: get_db yields a scoped AsyncSession, commits on success, rolls back on exceptions, and closes the session.

```mermaid
flowchart TD
Start(["Handler Entry"]) --> GetDep["Resolve Dependencies<br/>DatabaseDep, SettingsDep"]
GetDep --> UseDB["Use AsyncSession in Service"]
UseDB --> TryCommit{"Operation Success?"}
TryCommit --> |Yes| Commit["Commit Transaction"]
TryCommit --> |No| Rollback["Rollback Transaction"]
Commit --> Close["Close Session"]
Rollback --> Close
Close --> End(["Handler Exit"])
```

**Diagram sources**
- [backend/app/dependencies.py](file://backend/app/dependencies.py#L1-L14)
- [backend/app/database.py](file://backend/app/database.py#L32-L42)

**Section sources**
- [backend/app/dependencies.py](file://backend/app/dependencies.py#L1-L14)
- [backend/app/database.py](file://backend/app/database.py#L1-L43)

### Routing Structure and Request/Response Flow
- Routers define endpoints under a versioned prefix and tag groups.
- Handlers depend on get_db and construct service instances to process requests.
- Responses are Pydantic models validated automatically by FastAPI.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Router Endpoint"
participant Handler as "Handler Function"
participant Service as "Service"
participant Repo as "Repository"
participant Model as "Model"
participant DB as "AsyncSession"
Client->>Router : "POST /api/v1/auth/signup"
Router->>Handler : "Invoke handler"
Handler->>Service : "Instantiate service with DB"
Service->>Repo : "Data access"
Repo->>Model : "ORM mapping"
Model->>DB : "Execute SQL"
DB-->>Repo : "Result"
Repo-->>Service : "Domain object"
Service-->>Handler : "Response model"
Handler-->>Client : "JSON response"
```

**Diagram sources**
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L19-L27)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L21-L33)
- [backend/app/repositories/user_repository.py](file://backend/app/repositories/user_repository.py#L17-L19)
- [backend/app/models/user.py](file://backend/app/models/user.py#L14-L44)
- [backend/app/database.py](file://backend/app/database.py#L32-L42)

**Section sources**
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L1-L69)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L1-L94)
- [backend/app/schemas/auth.py](file://backend/app/schemas/auth.py#L1-L63)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L1-L68)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L1-L98)

### Error Handling Mechanisms
- Custom exceptions: SocialiumException and specialized subclasses for common scenarios.
- Global handlers: Catch-all for SocialiumException and generic Python exceptions, returning structured JSON with status codes.

```mermaid
flowchart TD
A["Service raises SocialiumException"] --> B["Global handler catches"]
B --> C{"Known exception?"}
C --> |Yes| D["Return JSON with status_code"]
C --> |No| E["Generic handler returns 500 JSON"]
```

**Diagram sources**
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L71-L89)

**Section sources**
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L1-L90)

### Security Architecture: JWT Authentication and Authorization
- JWT utilities: Create access/refresh tokens with expiration, decode and validate tokens.
- Password hashing: bcrypt-based hashing and verification.
- Authorization pattern: Handlers instantiate services; JWT decoding is planned for extracting user identity (placeholder in current implementation).

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Auth Router"
participant Service as "AuthService"
participant Sec as "Security Utils"
participant DB as "AsyncSession"
Client->>Router : "POST /api/v1/auth/login"
Router->>Service : "Call login()"
Service->>Sec : "Verify password"
Sec-->>Service : "Match result"
Service->>Sec : "Create access/refresh tokens"
Sec-->>Service : "JWT strings"
Service-->>Router : "TokenResponse"
Router-->>Client : "Tokens"
```

**Diagram sources**
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L30-L37)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L35-L45)
- [backend/app/core/security.py](file://backend/app/core/security.py#L15-L49)

**Section sources**
- [backend/app/core/security.py](file://backend/app/core/security.py#L1-L50)
- [backend/app/routers/auth.py](file://backend/app/routers/auth.py#L1-L69)
- [backend/app/services/auth_service.py](file://backend/app/services/auth_service.py#L1-L68)

### CORS Configuration
- Configured during app initialization with origins from settings, allowing credentials, all methods, and headers.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L45-L52)
- [backend/app/config.py](file://backend/app/config.py#L66-L67)

### Database Integration: SQLAlchemy ORM, Pooling, Transactions
- Engine: Async PostgreSQL engine with pre-ping, pool size, and overflow.
- Session factory: AsyncSession with expire_on_commit disabled for performance.
- Base model: Declarative base for ORM models.
- Session dependency: Provides a session per request, committing on success, rolling back on exceptions, and closing the session.

```mermaid
classDiagram
class DatabaseEngine {
+create_async_engine(url, echo, pool_pre_ping, pool_size, max_overflow)
}
class AsyncSessionFactory {
+async_sessionmaker(engine, class_=AsyncSession, expire_on_commit)
}
class Base {
<<DeclarativeBase>>
}
class get_db {
+AsyncGenerator[AsyncSession]
}
DatabaseEngine --> AsyncSessionFactory : "configured with"
AsyncSessionFactory --> Base : "used by models"
get_db --> AsyncSessionFactory : "yields session"
```

**Diagram sources**
- [backend/app/database.py](file://backend/app/database.py#L12-L24)
- [backend/app/database.py](file://backend/app/database.py#L27-L29)
- [backend/app/database.py](file://backend/app/database.py#L32-L42)

**Section sources**
- [backend/app/database.py](file://backend/app/database.py#L1-L43)
- [backend/app/models/user.py](file://backend/app/models/user.py#L1-L48)
- [backend/app/models/content.py](file://backend/app/models/content.py#L1-L42)

### Logging Architecture and Monitoring
- Logging: Structured format with timestamps, levels, and module names; noisy loggers suppressed.
- Monitoring keys: Langfuse and PostHog keys present in settings for observability.

**Section sources**
- [backend/app/core/logging.py](file://backend/app/core/logging.py#L1-L25)
- [backend/app/config.py](file://backend/app/config.py#L69-L72)

### Cross-Cutting Concerns: Validation and Rate Limiting
- Validation: Pydantic models define request/response schemas with field constraints.
- Rate limiting: Placeholder exception class exists; implementation is pending.

**Section sources**
- [backend/app/schemas/auth.py](file://backend/app/schemas/auth.py#L1-L63)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L54-L58)
- [backend/app/core/constants.py](file://backend/app/core/constants.py#L71-L76)

### Examples of Service Composition and Dependency Resolution
- Router to service: Handlers instantiate services with injected AsyncSession.
- Service orchestration: Services compose repositories and models to fulfill business logic.
- Configuration-driven behavior: Services rely on settings for external provider keys and limits.

```mermaid
sequenceDiagram
participant Router as "Router"
participant Service as "Service"
participant Repo as "Repository"
participant Model as "Model"
participant DB as "AsyncSession"
participant Cfg as "Settings"
Router->>Service : "new Service(db)"
Service->>Cfg : "read provider keys"
Service->>Repo : "persist/read domain objects"
Repo->>Model : "map ORM"
Model->>DB : "execute"
DB-->>Repo : "rows"
Repo-->>Service : "domain objects"
Service-->>Router : "response model"
```

**Diagram sources**
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L20-L27)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L23-L40)
- [backend/app/repositories/user_repository.py](file://backend/app/repositories/user_repository.py#L17-L19)
- [backend/app/models/content.py](file://backend/app/models/content.py#L14-L38)
- [backend/app/database.py](file://backend/app/database.py#L32-L42)
- [backend/app/config.py](file://backend/app/config.py#L38-L46)

**Section sources**
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L1-L94)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L1-L98)
- [backend/app/repositories/user_repository.py](file://backend/app/repositories/user_repository.py#L1-L40)
- [backend/app/models/content.py](file://backend/app/models/content.py#L1-L42)
- [backend/app/config.py](file://backend/app/config.py#L1-L83)

## Dependency Analysis
- External libraries: FastAPI, Uvicorn, SQLAlchemy asyncio, Alembic, asyncpg, Pydantic, Pydantic Settings, python-jose, passlib, httpx, redis, APScheduler, Qdrant client, OpenAI, Anthropic, python-dotenv, email-validator.
- Internal dependencies: Routers depend on services; services depend on repositories and models; repositories depend on AsyncSession; services and routers depend on settings; security utilities depend on settings.

```mermaid
graph LR
Pyd["pyproject.toml"]
FA["fastapi"]
UV["uvicorn"]
SA["sqlalchemy[asyncio]"]
AL["alembic"]
APG["asyncpg"]
PD["pydantic"]
PS["pydantic-settings"]
JJ["python-jose[cryptography]"]
PB["passlib[bcrypt]"]
HM["httpx"]
RD["redis"]
AS["apscheduler"]
QC["qdrant-client"]
OA["openai"]
AN["anthropic"]
ED["python-dotenv"]
EV["email-validator"]
Pyd --> FA
Pyd --> UV
Pyd --> SA
Pyd --> AL
Pyd --> APG
Pyd --> PD
Pyd --> PS
Pyd --> JJ
Pyd --> PB
Pyd --> HM
Pyd --> RD
Pyd --> AS
Pyd --> QC
Pyd --> OA
Pyd --> AN
Pyd --> ED
Pyd --> EV
```

**Diagram sources**
- [backend/pyproject.toml](file://backend/pyproject.toml#L6-L25)

**Section sources**
- [backend/pyproject.toml](file://backend/pyproject.toml#L1-L49)

## Performance Considerations
- Async database: Uses SQLAlchemy asyncio for non-blocking IO.
- Connection pooling: Pre-ping enabled and tunable pool sizes reduce stale connections.
- Session lifecycle: Per-request sessions with automatic commit/rollback minimize long-lived transactions.
- Logging: Suppression of noisy third-party loggers reduces overhead.
- Recommendations: Use pagination for large lists, avoid N+1 queries with eager loading, and consider caching for repeated reads.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Health check: GET /health returns app status and environment.
- Exception handling: Global handlers return structured JSON with status codes; inspect logs for stack traces.
- CORS issues: Verify frontend URL in settings matches the origin making requests.
- Database connectivity: Confirm DATABASE_URL and credentials; check pool settings and timeouts.
- JWT problems: Ensure secret key and algorithm match; verify token expiration and claims.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L78-L82)
- [backend/app/core/exceptions.py](file://backend/app/core/exceptions.py#L71-L89)
- [backend/app/config.py](file://backend/app/config.py#L25-L30)
- [backend/app/core/security.py](file://backend/app/core/security.py#L35-L39)

## Conclusion
Socialium’s backend implements a clean architecture with clear layer separation, robust dependency injection, and modular components. The design supports scalability, maintainability, and extensibility while providing strong foundations for authentication, persistence, and cross-cutting concerns. Future work includes implementing repository methods, completing JWT-based authorization, and adding rate limiting and background job orchestration.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Configuration Management Patterns
- Centralized settings via Pydantic Settings with environment file loading and caching.
- Environment-specific toggles for debug, docs URLs, and production readiness.

**Section sources**
- [backend/app/config.py](file://backend/app/config.py#L1-L83)

### Data Models Overview
```mermaid
erDiagram
USERS {
uuid id PK
string email UK
string username UK
string password_hash
string full_name
string avatar_url
string bio
string stripe_customer_id
enum subscription_tier
boolean is_active
timestamptz created_at
timestamptz updated_at
}
CONTENT_SOURCES {
uuid id PK
uuid workspace_id FK
enum source_type
text source_url
text source_text
text document_path
text extracted_text
jsonb metadata
timestamptz created_at
}
USERS ||--o{ WORKSPACES : "owns"
USERS ||--o{ WORKSPACE_MEMBERS : "belongs_to"
CONTENT_SOURCES ||--o{ DRAFTS : "generates"
```

**Diagram sources**
- [backend/app/models/user.py](file://backend/app/models/user.py#L14-L44)
- [backend/app/models/content.py](file://backend/app/models/content.py#L14-L38)