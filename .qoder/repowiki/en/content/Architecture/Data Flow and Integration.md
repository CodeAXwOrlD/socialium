# Data Flow and Integration

<cite>
**Referenced Files in This Document**
- [backend/app/main.py](file://backend/app/main.py)
- [backend/app/config.py](file://backend/app/config.py)
- [backend/app/database.py](file://backend/app/database.py)
- [frontend/src/lib/api.ts](file://frontend/src/lib/api.ts)
- [backend/app/routers/content.py](file://backend/app/routers/content.py)
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py)
- [backend/app/routers/approvals.py](file://backend/app/routers/approvals.py)
- [backend/app/routers/analytics.py](file://backend/app/routers/analytics.py)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py)
- [backend/app/services/approval_workflow_service.py](file://backend/app/services/approval_workflow_service.py)
- [backend/app/services/analytics_service.py](file://backend/app/services/analytics_service.py)
- [backend/app/workers/generation_worker.py](file://backend/app/workers/generation_worker.py)
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py)
- [backend/app/workers/analytics_worker.py](file://backend/app/workers/analytics_worker.py)
- [backend/app/workers/embedding_worker.py](file://backend/app/workers/embedding_worker.py)
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
This document describes the end-to-end data flow for Socialium’s integrated system. It covers how frontend user interactions propagate through FastAPI routers and services to backend workers and external platform APIs. It documents request-response patterns, data transformations, validation flows, OAuth integrations, webhooks, rate limiting, content generation pipeline, approval workflows, notifications, analytics collection, performance metrics aggregation, recommendation engine processing, memory system semantics, and error propagation with retry mechanisms.

## Project Structure
The system is split into:
- Backend (FastAPI): Routers, Services, Workers, Models, Repositories, Schemas, and configuration.
- Frontend (Next.js): API client, pages, hooks, and UI components.

```mermaid
graph TB
FE["Frontend (Next.js)"]
API["FastAPI App (main.py)"]
CFG["Settings (config.py)"]
DB["Database Engine (database.py)"]
RT_CONTENT["Routers: content.py"]
RT_PLATFORMS["Routers: platforms.py"]
RT_APPROVALS["Routers: approvals.py"]
RT_ANALYTICS["Routers: analytics.py"]
SVC_CONTENT["Services: content_generation_service.py"]
SVC_PLATFORMS["Services: platform_integration_service.py"]
SVC_APPROVALS["Services: approval_workflow_service.py"]
SVC_ANALYTICS["Services: analytics_service.py"]
WRK_GEN["Workers: generation_worker.py"]
WRK_PUB["Workers: publishing_worker.py"]
WRK_ANA["Workers: analytics_worker.py"]
WRK_EMB["Workers: embedding_worker.py"]
FE --> API
API --> CFG
API --> DB
API --> RT_CONTENT
API --> RT_PLATFORMS
API --> RT_APPROVALS
API --> RT_ANALYTICS
RT_CONTENT --> SVC_CONTENT
RT_PLATFORMS --> SVC_PLATFORMS
RT_APPROVALS --> SVC_APPROVALS
RT_ANALYTICS --> SVC_ANALYTICS
SVC_CONTENT --> WRK_GEN
SVC_PLATFORMS --> WRK_PUB
SVC_ANALYTICS --> WRK_ANA
SVC_CONTENT --> WRK_EMB
```

**Diagram sources**
- [backend/app/main.py](file://backend/app/main.py#L36-L76)
- [backend/app/config.py](file://backend/app/config.py#L9-L76)
- [backend/app/database.py](file://backend/app/database.py#L12-L24)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L17-L94)
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py#L14-L56)
- [backend/app/routers/approvals.py](file://backend/app/routers/approvals.py#L16-L61)
- [backend/app/routers/analytics.py](file://backend/app/routers/analytics.py#L10-L44)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L13-L98)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L8-L56)
- [backend/app/services/approval_workflow_service.py](file://backend/app/services/approval_workflow_service.py#L8-L48)
- [backend/app/services/analytics_service.py](file://backend/app/services/analytics_service.py#L6-L60)
- [backend/app/workers/generation_worker.py](file://backend/app/workers/generation_worker.py#L4-L6)
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py#L4-L11)
- [backend/app/workers/analytics_worker.py](file://backend/app/workers/analytics_worker.py#L4-L6)
- [backend/app/workers/embedding_worker.py](file://backend/app/workers/embedding_worker.py#L4-L6)

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L36-L76)
- [backend/app/config.py](file://backend/app/config.py#L9-L76)
- [backend/app/database.py](file://backend/app/database.py#L12-L24)

## Core Components
- Configuration: Centralized settings for environment, database, Redis, JWT, AI providers, OAuth clients, Stripe, frontend origin, and monitoring keys.
- Database: Async SQLAlchemy engine and session factory with connection pooling and automatic rollback on errors.
- Routers: API endpoints for content, platforms, approvals, and analytics, each delegating to respective services.
- Services: Orchestration layer implementing business logic, validation, and coordination with external systems.
- Workers: Background tasks for generation, publishing, analytics collection, and embeddings.

Key responsibilities:
- Content Generation Service: Orchestrates multi-agent content creation, brand voice alignment, platform-specific formatting, optional image generation, and semantic embeddings.
- Platform Integration Service: Manages OAuth connections, account sync, and publishing to supported platforms.
- Approval Workflow Service: Implements state machine for draft lifecycle and human review.
- Analytics Service: Aggregates metrics, computes trends, and produces recommendations.
- Workers: Asynchronous processing for heavy tasks and periodic jobs.

**Section sources**
- [backend/app/config.py](file://backend/app/config.py#L9-L76)
- [backend/app/database.py](file://backend/app/database.py#L12-L43)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L17-L94)
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py#L14-L56)
- [backend/app/routers/approvals.py](file://backend/app/routers/approvals.py#L16-L61)
- [backend/app/routers/analytics.py](file://backend/app/routers/analytics.py#L10-L44)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L13-L98)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L8-L56)
- [backend/app/services/approval_workflow_service.py](file://backend/app/services/approval_workflow_service.py#L8-L48)
- [backend/app/services/analytics_service.py](file://backend/app/services/analytics_service.py#L6-L60)
- [backend/app/workers/generation_worker.py](file://backend/app/workers/generation_worker.py#L4-L6)
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py#L4-L11)
- [backend/app/workers/analytics_worker.py](file://backend/app/workers/analytics_worker.py#L4-L6)
- [backend/app/workers/embedding_worker.py](file://backend/app/workers/embedding_worker.py#L4-L6)

## Architecture Overview
The system follows a layered architecture:
- Presentation: Next.js frontend interacts with FastAPI via a typed client.
- API Layer: Routers define endpoints and depend on database sessions.
- Business Logic: Services encapsulate workflows and integrate with external APIs.
- Persistence: Async database sessions with commit/rollback semantics.
- Background Processing: Workers handle long-running tasks.

```mermaid
graph TB
subgraph "Presentation"
FE_API["Frontend API Client (api.ts)"]
end
subgraph "API Gateway"
APP["FastAPI App (main.py)"]
CORS["CORS Middleware"]
end
subgraph "Core"
CFG["Settings (config.py)"]
DB["Async DB (database.py)"]
RT["Routers"]
SVC["Services"]
end
subgraph "External Systems"
OAUTH["OAuth Providers"]
PLATFORMS["Social Platforms"]
AI["OpenAI / Anthropic"]
EMB["Qdrant"]
MON["Langfuse / PostHog"]
end
subgraph "Workers"
GEN["Generation Worker"]
PUB["Publishing Worker"]
ANA["Analytics Worker"]
EMB_WRK["Embedding Worker"]
end
FE_API --> APP
APP --> CORS
APP --> CFG
APP --> DB
APP --> RT
RT --> SVC
SVC --> OAUTH
SVC --> PLATFORMS
SVC --> AI
SVC --> EMB
SVC --> MON
SVC --> GEN
SVC --> PUB
SVC --> ANA
SVC --> EMB_WRK
```

**Diagram sources**
- [backend/app/main.py](file://backend/app/main.py#L36-L76)
- [backend/app/config.py](file://backend/app/config.py#L9-L76)
- [backend/app/database.py](file://backend/app/database.py#L12-L24)
- [frontend/src/lib/api.ts](file://frontend/src/lib/api.ts#L3-L68)
- [backend/app/workers/generation_worker.py](file://backend/app/workers/generation_worker.py#L4-L6)
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py#L4-L11)
- [backend/app/workers/analytics_worker.py](file://backend/app/workers/analytics_worker.py#L4-L6)
- [backend/app/workers/embedding_worker.py](file://backend/app/workers/embedding_worker.py#L4-L6)

## Detailed Component Analysis

### Frontend API Client
- Provides a typed client with base URL from environment, JSON headers, and error handling.
- Supports GET, POST, PUT, PATCH, DELETE with optional query parameters.
- TODO: Add auth token injection.

```mermaid
sequenceDiagram
participant UI as "Frontend Page"
participant API as "ApiClient (api.ts)"
participant BE as "FastAPI Router"
participant SVC as "Service"
participant EXT as "External API"
UI->>API : "request(method, path, body, params)"
API->>API : "build URL with params"
API->>BE : "fetch(url, {headers, method, body})"
BE->>SVC : "invoke handler"
SVC->>EXT : "call platform/OAuth/AI"
EXT-->>SVC : "external response"
SVC-->>BE : "domain response"
BE-->>API : "JSON response"
API-->>UI : "data or error"
```

**Diagram sources**
- [frontend/src/lib/api.ts](file://frontend/src/lib/api.ts#L20-L45)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L20-L27)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L23-L40)

**Section sources**
- [frontend/src/lib/api.ts](file://frontend/src/lib/api.ts#L3-L68)

### Content Generation Pipeline
End-to-end flow from user request to published posts:
- Request: ContentGenerateRequest
- Steps:
  1) Extract and process source content
  2) Look up brand voice from MemoryService (via Semantic Memory)
  3) For each selected platform:
     - Construct platform-specific prompt
     - Call LLM for content generation
     - Optionally generate image via DALL-E
     - Create Draft record
  4) Generate embeddings for semantic memory
  5) Return list of DraftResponse objects

```mermaid
sequenceDiagram
participant UI as "Frontend"
participant Router as "content.py"
participant Service as "ContentGenerationService"
participant LLM as "LLM Service"
participant Embed as "EmbeddingService"
participant Mem as "MemoryService"
participant DB as "Database"
participant PubW as "Publishing Worker"
UI->>Router : "POST /content/generate"
Router->>Service : "generate_post(request)"
Service->>Mem : "lookup brand voice"
Service->>LLM : "generate content per platform"
LLM-->>Service : "generated content"
Service->>Embed : "generate embeddings"
Embed-->>Service : "embeddings stored"
Service->>DB : "persist Drafts"
DB-->>Service : "ok"
Service-->>Router : "DraftResponse[]"
Router-->>UI : "201 Created"
Note over Service,PubW : "Later, Publishing Worker publishes drafts"
```

**Diagram sources**
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L20-L27)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L23-L40)
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py#L4-L6)

**Section sources**
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L13-L98)
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L20-L27)

### Platform Integration and OAuth
- Connect: Exchanges OAuth code for access tokens, fetches platform user profile, encrypts tokens, creates PlatformAccount.
- Sync: Refreshes account metadata (followers, profile info).
- Publish: Formats content per platform, uploads media if needed, calls platform publish API, updates draft status.
- Disconnect: Revokes tokens and removes account.

```mermaid
sequenceDiagram
participant UI as "Frontend"
participant Router as "platforms.py"
participant Service as "PlatformIntegrationService"
participant OAuth as "OAuth Provider"
participant Plat as "Social Platform API"
participant DB as "Database"
UI->>Router : "POST /platforms/connect"
Router->>Service : "connect(request, workspace_id)"
Service->>OAuth : "exchange code for tokens"
OAuth-->>Service : "access_token, refresh_token"
Service->>Plat : "GET user profile"
Plat-->>Service : "profile"
Service->>DB : "store encrypted tokens + account"
DB-->>Service : "ok"
Service-->>Router : "PlatformAccountResponse"
Router-->>UI : "201 Created"
UI->>Router : "POST /platforms/accounts/{id}/sync"
Router->>Service : "sync_account(account_id)"
Service->>Plat : "GET account data"
Plat-->>Service : "updated stats"
Service->>DB : "update account"
DB-->>Service : "ok"
Service-->>Router : "PlatformAccountResponse"
Router-->>UI : "200 OK"
```

**Diagram sources**
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py#L27-L35)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L21-L31)
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py#L48-L55)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L37-L39)

**Section sources**
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L8-L56)
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py#L17-L55)

### Approval Workflow and Notifications
- State Machine: draft → pending_approval → approved | rejected | changes_requested
- Actions:
  - Submit for approval: move draft to pending_approval
  - Review: approve, reject, or request changes with feedback
  - Add comment: append comments to approval record
  - History: retrieve full approval timeline

```mermaid
stateDiagram-v2
[*] --> draft
draft --> pending_approval : "submit_for_approval()"
pending_approval --> approved : "review(approve)"
pending_approval --> rejected : "review(reject)"
pending_approval --> draft : "review(request_changes)"
approved --> [*]
rejected --> [*]
draft --> [*]
```

**Diagram sources**
- [backend/app/services/approval_workflow_service.py](file://backend/app/services/approval_workflow_service.py#L8-L48)

**Section sources**
- [backend/app/services/approval_workflow_service.py](file://backend/app/services/approval_workflow_service.py#L8-L48)
- [backend/app/routers/approvals.py](file://backend/app/routers/approvals.py#L19-L60)

### Analytics Collection, Metrics, and Recommendations
- Overview: Aggregated dashboard metrics over a time window.
- Trends: Time-series data for a specific metric.
- Recommendations: AI-driven insights for content and scheduling.
- Best Posting Times: Derived from engagement data.

```mermaid
flowchart TD
Start(["Trigger Analytics"]) --> Collect["Collect raw events from platforms"]
Collect --> Aggregate["Aggregate by day/period"]
Aggregate --> Compute["Compute metrics (impressions, engagement rate, etc.)"]
Compute --> Store["Persist analytics records"]
Store --> Insights["Run recommendation engine"]
Insights --> Return["Return overview/trends/recommendations"]
```

**Diagram sources**
- [backend/app/routers/analytics.py](file://backend/app/routers/analytics.py#L13-L43)
- [backend/app/services/analytics_service.py](file://backend/app/services/analytics_service.py#L16-L59)

**Section sources**
- [backend/app/services/analytics_service.py](file://backend/app/services/analytics_service.py#L6-L60)
- [backend/app/routers/analytics.py](file://backend/app/routers/analytics.py#L13-L43)

### Memory System for Semantic Search and Brand Voice Learning
- Embedding Worker generates vector embeddings for content.
- Qdrant is configured for semantic storage and retrieval.
- Memory Service integrates embeddings into semantic memory for brand voice and context.

```mermaid
sequenceDiagram
participant Gen as "ContentGenerationService"
participant EmbW as "Embedding Worker"
participant QD as "Qdrant"
participant DB as "Database"
Gen->>EmbW : "run_embedding(content_id, text)"
EmbW->>QD : "create collection / upload vectors"
QD-->>EmbW : "ok"
EmbW->>DB : "mark embeddings processed"
DB-->>EmbW : "ok"
```

**Diagram sources**
- [backend/app/workers/embedding_worker.py](file://backend/app/workers/embedding_worker.py#L4-L6)
- [backend/app/config.py](file://backend/app/config.py#L47-L50)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L34-L35)

**Section sources**
- [backend/app/workers/embedding_worker.py](file://backend/app/workers/embedding_worker.py#L4-L6)
- [backend/app/config.py](file://backend/app/config.py#L47-L50)

### Publishing Pipeline
- Scheduled posts are published by Publishing Worker.
- For each post, retrieve draft and platform account, format content, upload media if needed, call platform publish API, and update status.

```mermaid
sequenceDiagram
participant Scheduler as "Scheduler"
participant PubW as "Publishing Worker"
participant PlatformSvc as "PlatformIntegrationService"
participant PlatformAPI as "Social Platform API"
participant DB as "Database"
Scheduler->>PubW : "run_publish(scheduled_post_id)"
PubW->>PlatformSvc : "publish_post(account_id, draft_id)"
PlatformSvc->>PlatformAPI : "POST publish"
PlatformAPI-->>PlatformSvc : "post_id"
PlatformSvc->>DB : "update draft status = published"
DB-->>PlatformSvc : "ok"
PlatformSvc-->>PubW : "published result"
PubW-->>Scheduler : "done"
```

**Diagram sources**
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py#L4-L6)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L41-L51)

**Section sources**
- [backend/app/workers/publishing_worker.py](file://backend/app/workers/publishing_worker.py#L4-L11)
- [backend/app/services/platform_integration_service.py](file://backend/app/services/platform_integration_service.py#L41-L56)

### Rate Limiting and Retry Mechanisms
- External API rate limiting: Implement per-platform backoff and retry policies in Platform Integration Service.
- Database retries: Session rollback on exceptions; callers should retry idempotent operations.
- Worker retries: Use queue-based workers with dead-letter exchanges and exponential backoff for transient failures.

[No sources needed since this section provides general guidance]

### Error Propagation and Validation
- Frontend API client throws on non-OK responses with error payload.
- Routers depend on AsyncSession; database session commits on success, rolls back on exceptions.
- Services raise NotImplementedError placeholders indicating missing implementations.

**Section sources**
- [frontend/src/lib/api.ts](file://frontend/src/lib/api.ts#L38-L41)
- [backend/app/database.py](file://backend/app/database.py#L32-L42)
- [backend/app/services/content_generation_service.py](file://backend/app/services/content_generation_service.py#L40-L41)

## Dependency Analysis
- Routers depend on database sessions via dependency provider.
- Services depend on AsyncSession and coordinate with external systems.
- Workers are invoked by services or schedulers for background tasks.
- Configuration drives database, Redis, JWT, AI providers, OAuth clients, and monitoring.

```mermaid
graph LR
CFG["config.py"] --> APP["main.py"]
DB["database.py"] --> RT["routers/*"]
RT --> SVC["services/*"]
SVC --> WRK["workers/*"]
FE["frontend/api.ts"] --> APP
```

**Diagram sources**
- [backend/app/main.py](file://backend/app/main.py#L57-L76)
- [backend/app/config.py](file://backend/app/config.py#L9-L76)
- [backend/app/database.py](file://backend/app/database.py#L12-L24)
- [frontend/src/lib/api.ts](file://frontend/src/lib/api.ts#L3-L68)

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L57-L76)
- [backend/app/config.py](file://backend/app/config.py#L9-L76)
- [backend/app/database.py](file://backend/app/database.py#L12-L24)

## Performance Considerations
- Use async database sessions and connection pooling to minimize latency.
- Offload heavy workloads to workers to keep API responses fast.
- Cache frequently accessed configuration and tokens.
- Monitor and instrument analytics and recommendations for performance.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Health check endpoint: Verify application availability.
- Database connectivity: Confirm async engine configuration and pool settings.
- OAuth failures: Validate client credentials and callback URLs.
- Publishing errors: Inspect platform API responses and logs; implement retries.
- Analytics gaps: Ensure workers are running and event collection is enabled.

**Section sources**
- [backend/app/main.py](file://backend/app/main.py#L79-L82)
- [backend/app/database.py](file://backend/app/database.py#L12-L24)
- [backend/app/config.py](file://backend/app/config.py#L52-L64)

## Conclusion
Socialium’s architecture cleanly separates concerns across routers, services, workers, and persistence. The data flows from frontend interactions through validated API endpoints into orchestrated services that integrate with external platforms, AI providers, and semantic memory. Background workers handle heavy and periodic tasks, while configuration centralizes environment-specific settings. The approval workflow and analytics components provide governance and insights. Robust error handling, rate limiting, and retry strategies are essential for production stability.

## Appendices
- API Endpoints Overview:
  - Content: generate, variants, drafts list/get/update/status/delete
  - Platforms: accounts list/connect/disconnect/sync
  - Approvals: pending list, history, review, add comment
  - Analytics: overview, trends, recommendations

**Section sources**
- [backend/app/routers/content.py](file://backend/app/routers/content.py#L20-L94)
- [backend/app/routers/platforms.py](file://backend/app/routers/platforms.py#L17-L55)
- [backend/app/routers/approvals.py](file://backend/app/routers/approvals.py#L19-L60)
- [backend/app/routers/analytics.py](file://backend/app/routers/analytics.py#L13-L43)