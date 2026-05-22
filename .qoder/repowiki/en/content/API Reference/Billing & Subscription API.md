# Billing & Subscription API

<cite>
**Referenced Files in This Document**
- [billing.py](file://backend/app/routers/billing.py)
- [billing_service.py](file://backend/app/services/billing_service.py)
- [billing.py](file://backend/app/schemas/billing.py)
- [constants.py](file://backend/app/core/constants.py)
- [config.py](file://backend/app/config.py)
- [main.py](file://backend/app/main.py)
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx)
- [api.ts](file://frontend/src/lib/api.ts)
- [analytics.py](file://backend/app/schemas/analytics.py)
- [analytics.py](file://backend/app/models/analytics.py)
- [analytics_repository.py](file://backend/app/repositories/analytics_repository.py)
- [analytics_service.py](file://backend/app/services/analytics_service.py)
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
This document provides comprehensive API documentation for Socialium's billing and subscription system. It covers subscription management, payment processing, usage tracking, and billing cycle management. It also documents schemas for subscription plans, payment methods, invoicing, and usage analytics. Integration with Stripe for payment handling is described conceptually, along with practical examples for subscription upgrades/downgrades, payment processing workflows, usage-based billing, and frontend integration.

## Project Structure
The billing system is implemented as a FastAPI router with associated schemas and a service layer. The backend exposes endpoints under `/api/v1/billing`, while the frontend provides a billing settings page and typed API client.

```mermaid
graph TB
subgraph "Backend"
A["main.py<br/>Registers billing router"]
B["routers/billing.py<br/>Billing endpoints"]
C["services/billing_service.py<br/>Billing logic"]
D["schemas/billing.py<br/>Pydantic models"]
E["core/constants.py<br/>SubscriptionTier enum"]
F["config.py<br/>Stripe settings"]
end
subgraph "Frontend"
G["page.tsx<br/>Billing UI"]
H["api.ts<br/>Typed API client"]
end
A --> B
B --> C
C --> D
C --> E
C --> F
G --> H
H --> B
```

**Diagram sources**
- [main.py](file://backend/app/main.py#L76-L76)
- [billing.py](file://backend/app/routers/billing.py#L1-L77)
- [billing_service.py](file://backend/app/services/billing_service.py#L1-L80)
- [billing.py](file://backend/app/schemas/billing.py#L1-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L37)
- [config.py](file://backend/app/config.py#L62-L64)
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx#L1-L79)
- [api.ts](file://frontend/src/lib/api.ts#L1-L69)

**Section sources**
- [main.py](file://backend/app/main.py#L76-L76)
- [billing.py](file://backend/app/routers/billing.py#L1-L77)
- [billing_service.py](file://backend/app/services/billing_service.py#L1-L80)
- [billing.py](file://backend/app/schemas/billing.py#L1-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L37)
- [config.py](file://backend/app/config.py#L62-L64)
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx#L1-L79)
- [api.ts](file://frontend/src/lib/api.ts#L1-L69)

## Core Components
- Billing Router: Exposes endpoints for plans, subscription details, upgrades, usage metrics, payment methods, and invoices.
- Billing Service: Orchestrates subscription management, payment processing, and usage tracking. Currently stubbed for Stripe integrations.
- Pydantic Schemas: Define request/response models for plans, subscriptions, usage metrics, payment methods, and invoices.
- Constants: Provides SubscriptionTier enum and tier limits used for plan definitions.
- Configuration: Holds Stripe secrets and webhook secret for payment handling.
- Frontend: Provides a billing settings page and a typed API client for consuming the billing endpoints.

Key capabilities:
- Retrieve available subscription plans with pricing and feature sets.
- Get and update subscription status for a workspace.
- Fetch usage metrics for billing and capacity planning.
- Manage saved payment methods and invoices.

**Section sources**
- [billing.py](file://backend/app/routers/billing.py#L20-L76)
- [billing_service.py](file://backend/app/services/billing_service.py#L14-L79)
- [billing.py](file://backend/app/schemas/billing.py#L11-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L76)
- [config.py](file://backend/app/config.py#L62-L64)

## Architecture Overview
The billing API follows a layered architecture:
- Router layer handles HTTP requests and delegates to the service layer.
- Service layer encapsulates business logic and integrates with external systems (Stripe).
- Schema layer validates and serializes data.
- Configuration layer supplies Stripe credentials and environment settings.
- Frontend consumes endpoints via a typed API client.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant API as "FastAPI Router"
participant SVC as "BillingService"
participant STR as "Stripe"
FE->>API : GET /api/v1/billing/plans
API->>SVC : get_plans()
SVC-->>API : Plan list
API-->>FE : 200 OK
FE->>API : GET /api/v1/billing/subscription?workspace_id={id}
API->>SVC : get_subscription(workspace_id)
SVC->>STR : Fetch subscription
STR-->>SVC : Subscription details
SVC-->>API : Subscription dict
API-->>FE : 200 OK
FE->>API : POST /api/v1/billing/upgrade?workspace_id={id}
API->>SVC : upgrade(workspace_id, request)
SVC->>STR : Create/update payment intent/setup
STR-->>SVC : Payment confirmation
SVC-->>API : Updated subscription
API-->>FE : 200 OK
```

**Diagram sources**
- [billing.py](file://backend/app/routers/billing.py#L20-L45)
- [billing_service.py](file://backend/app/services/billing_service.py#L14-L79)
- [config.py](file://backend/app/config.py#L62-L64)

## Detailed Component Analysis

### Billing Router Endpoints
Endpoints exposed under `/api/v1/billing`:
- GET /plans: Returns available subscription plans.
- GET /subscription: Returns current subscription details for a workspace.
- POST /upgrade: Upgrades or changes subscription plan.
- GET /usage: Returns usage metrics for billing.
- GET /payment-methods: Lists saved payment methods.
- GET /invoices: Retrieves invoices with optional limit.

Implementation highlights:
- Uses SQLAlchemy async sessions for database-backed operations.
- Delegates business logic to BillingService.
- Responses are strongly typed via Pydantic models.

**Section sources**
- [billing.py](file://backend/app/routers/billing.py#L20-L76)

### Billing Service Layer
Responsibilities:
- Provide plan catalog.
- Retrieve and update subscription state via Stripe.
- Compute usage metrics.
- Manage payment methods and invoices via Stripe.

Notable behaviors:
- Methods raise NotImplementedError for Stripe-dependent operations, indicating pending implementation.
- Accepts optional AsyncSession for potential persistence needs.

```mermaid
classDiagram
class BillingService {
+get_plans() list
+get_subscription(workspace_id) dict
+upgrade(workspace_id, request) dict
+get_usage(workspace_id) dict
+get_payment_methods(workspace_id) list
+get_invoices(workspace_id, limit) list
}
```

**Diagram sources**
- [billing_service.py](file://backend/app/services/billing_service.py#L8-L79)

**Section sources**
- [billing_service.py](file://backend/app/services/billing_service.py#L14-L79)

### Pydantic Schemas
Models define request/response contracts:
- PlanDetail: Plan metadata including pricing and feature set.
- CurrentSubscription: Active subscription state and limits.
- UpgradeRequest: Target plan selection.
- PaymentMethodResponse: Saved payment method details.
- InvoiceResponse: Invoice metadata and PDF link.
- UsageMetrics: Usage indicators for billing calculations.

```mermaid
classDiagram
class PlanDetail {
+string tier
+string label
+float price_monthly
+float price_annual
+int posts_per_day
+int platforms_count
+int team_members
+string[] features
}
class CurrentSubscription {
+uuid workspace_id
+string tier
+string status
+datetime current_period_start
+datetime current_period_end
+bool cancel_at_period_end
+int posts_used_this_month
+int posts_limit
}
class UpgradeRequest {
+SubscriptionTier plan
}
class PaymentMethodResponse {
+string id
+string brand
+string last_four
+int exp_month
+int exp_year
+bool is_default
}
class InvoiceResponse {
+string id
+float amount
+string currency
+string status
+string invoice_pdf_url
+datetime created_at
}
class UsageMetrics {
+int posts_published
+int posts_limit
+float percentage_used
+int tokens_used
+float storage_used_mb
}
```

**Diagram sources**
- [billing.py](file://backend/app/schemas/billing.py#L11-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L37)

**Section sources**
- [billing.py](file://backend/app/schemas/billing.py#L11-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L37)

### Subscription Plans Catalog
The service returns a static catalog of plans with monthly and annual pricing, feature lists, and capacity limits. These align with SubscriptionTier enum values.

Integration note:
- The catalog is currently static; future implementation will sync with Stripe products and prices.

**Section sources**
- [billing_service.py](file://backend/app/services/billing_service.py#L14-L59)
- [constants.py](file://backend/app/core/constants.py#L32-L37)

### Usage Tracking and Analytics
Usage metrics for billing include:
- Posts published and limits.
- Percentage used.
- Tokens used and storage consumed.

Analytics models and repository/service indicate broader analytics capabilities:
- AnalyticsEvent model captures engagement metrics per post and platform.
- AnalyticsService and repository define methods for trends, top posts, and recommendations.

```mermaid
flowchart TD
Start(["Usage Query"]) --> FetchEvents["Fetch AnalyticsEvents for workspace"]
FetchEvents --> Aggregate["Aggregate posts_published, tokens_used, storage_used_mb"]
Aggregate --> Limits["Compare against tier limits"]
Limits --> Metrics["Compute percentage_used"]
Metrics --> Return["Return UsageMetrics"]
```

**Diagram sources**
- [analytics.py](file://backend/app/models/analytics.py#L14-L49)
- [analytics.py](file://backend/app/schemas/analytics.py#L9-L77)
- [analytics_repository.py](file://backend/app/repositories/analytics_repository.py#L6-L14)
- [analytics_service.py](file://backend/app/services/analytics_service.py#L6-L60)

**Section sources**
- [billing.py](file://backend/app/schemas/billing.py#L71-L79)
- [analytics.py](file://backend/app/models/analytics.py#L14-L49)
- [analytics.py](file://backend/app/schemas/analytics.py#L9-L77)
- [analytics_repository.py](file://backend/app/repositories/analytics_repository.py#L6-L14)
- [analytics_service.py](file://backend/app/services/analytics_service.py#L6-L60)

### Payment Processing and Stripe Integration
Configuration:
- Stripe secret key and webhook secret are configured via environment settings.

Conceptual flow:
- Upgrade endpoint triggers Stripe payment intent or subscription modification.
- Payment methods are retrieved from Stripe customer data.
- Invoices are fetched from Stripe invoice records.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Billing Router"
participant Service as "BillingService"
participant Stripe as "Stripe API"
Client->>Router : POST /upgrade
Router->>Service : upgrade(workspace_id, request)
Service->>Stripe : Create/confirm payment
Stripe-->>Service : Payment outcome
Service-->>Router : Updated subscription
Router-->>Client : 200 OK
```

**Diagram sources**
- [billing.py](file://backend/app/routers/billing.py#L37-L45)
- [billing_service.py](file://backend/app/services/billing_service.py#L65-L67)
- [config.py](file://backend/app/config.py#L62-L64)

**Section sources**
- [config.py](file://backend/app/config.py#L62-L64)
- [billing.py](file://backend/app/routers/billing.py#L37-L45)
- [billing_service.py](file://backend/app/services/billing_service.py#L65-L79)

### Frontend Integration
The billing settings page displays:
- Current usage progress and limits.
- Plan cards with upgrade actions.
- Saved payment method display.

The typed API client supports GET/POST/PUT/PATCH/DELETE with automatic JSON serialization and error handling.

```mermaid
sequenceDiagram
participant UI as "Billing Page"
participant API as "ApiClient"
participant BE as "Billing Router"
UI->>API : GET /api/v1/billing/usage
API->>BE : GET /billing/usage
BE-->>API : UsageMetrics
API-->>UI : Render usage
UI->>API : GET /api/v1/billing/plans
API->>BE : GET /billing/plans
BE-->>API : Plan list
API-->>UI : Render plans
UI->>API : POST /api/v1/billing/upgrade
API->>BE : POST /billing/upgrade
BE-->>API : CurrentSubscription
API-->>UI : Update UI
```

**Diagram sources**
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx#L15-L78)
- [api.ts](file://frontend/src/lib/api.ts#L20-L65)
- [billing.py](file://backend/app/routers/billing.py#L20-L45)

**Section sources**
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx#L15-L78)
- [api.ts](file://frontend/src/lib/api.ts#L1-L69)
- [billing.py](file://backend/app/routers/billing.py#L20-L45)

## Dependency Analysis
- Router depends on BillingService and schemas for request/response validation.
- BillingService depends on constants for plan tiers and configuration for Stripe keys.
- Frontend depends on typed API client and router endpoints.

```mermaid
graph LR
FE["page.tsx"] --> AC["api.ts"]
AC --> RT["billing.py (router)"]
RT --> SVC["billing_service.py"]
SVC --> SCH["billing.py (schemas)"]
SVC --> CST["constants.py"]
SVC --> CFG["config.py"]
```

**Diagram sources**
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx#L1-L79)
- [api.ts](file://frontend/src/lib/api.ts#L1-L69)
- [billing.py](file://backend/app/routers/billing.py#L1-L77)
- [billing_service.py](file://backend/app/services/billing_service.py#L1-L80)
- [billing.py](file://backend/app/schemas/billing.py#L1-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L37)
- [config.py](file://backend/app/config.py#L62-L64)

**Section sources**
- [billing.py](file://backend/app/routers/billing.py#L1-L77)
- [billing_service.py](file://backend/app/services/billing_service.py#L1-L80)
- [billing.py](file://backend/app/schemas/billing.py#L1-L79)
- [constants.py](file://backend/app/core/constants.py#L32-L37)
- [config.py](file://backend/app/config.py#L62-L64)
- [page.tsx](file://frontend/src/app/(dashboard)/settings/billing/page.tsx#L1-L79)
- [api.ts](file://frontend/src/lib/api.ts#L1-L69)

## Performance Considerations
- Use pagination for invoice retrieval via the limit parameter.
- Cache plan catalogs on the client to reduce network calls.
- Batch usage queries by workspace and time windows to minimize database load.
- Offload heavy analytics computations to background workers if needed.

## Troubleshooting Guide
Common issues and resolutions:
- Missing Stripe credentials: Ensure stripe_secret_key and stripe_webhook_secret are set in environment configuration.
- Endpoint not found: Verify the billing router is included under /api/v1/billing.
- Authentication errors: Confirm frontend API client includes required headers and tokens.
- NotImplementedError for billing operations: Implement Stripe integration in BillingService methods.

Operational checks:
- Health endpoint confirms application status.
- CORS configuration allows frontend origin.

**Section sources**
- [config.py](file://backend/app/config.py#L62-L64)
- [main.py](file://backend/app/main.py#L76-L76)
- [billing_service.py](file://backend/app/services/billing_service.py#L61-L79)
- [api.ts](file://frontend/src/lib/api.ts#L38-L44)

## Conclusion
The billing and subscription API provides a solid foundation for managing plans, usage, and payments. While Stripe integration is currently stubbed, the architecture cleanly separates concerns and offers clear extension points. The frontend integrates seamlessly via a typed API client, enabling a responsive billing experience.

## Appendices

### API Reference

- GET /api/v1/billing/plans
  - Description: Retrieve available subscription plans.
  - Response: Array of PlanDetail.

- GET /api/v1/billing/subscription?workspace_id={id}
  - Description: Get current subscription details for a workspace.
  - Response: CurrentSubscription.

- POST /api/v1/billing/upgrade?workspace_id={id}
  - Description: Upgrade or change subscription plan.
  - Request: UpgradeRequest.
  - Response: CurrentSubscription.

- GET /api/v1/billing/usage?workspace_id={id}
  - Description: Get current usage metrics.
  - Response: UsageMetrics.

- GET /api/v1/billing/payment-methods?workspace_id={id}
  - Description: List saved payment methods.
  - Response: Array of PaymentMethodResponse.

- GET /api/v1/billing/invoices?workspace_id={id}&limit={n}
  - Description: Retrieve invoices with optional limit.
  - Response: Array of InvoiceResponse.

**Section sources**
- [billing.py](file://backend/app/routers/billing.py#L20-L76)
- [billing.py](file://backend/app/schemas/billing.py#L11-L79)

### Example Workflows

- Subscription Upgrade
  - Client sends UpgradeRequest with target plan.
  - Server invokes BillingService.upgrade and returns updated subscription.

- Payment Processing
  - Client initiates upgrade; server creates/updates Stripe payment intent.
  - On confirmation, server returns updated subscription.

- Usage-Based Billing
  - Client queries /usage to compute percentage_used against tier limits.
  - AnalyticsService can provide deeper insights for recommendations.

**Section sources**
- [billing.py](file://backend/app/routers/billing.py#L37-L45)
- [billing_service.py](file://backend/app/services/billing_service.py#L65-L71)
- [analytics_service.py](file://backend/app/services/analytics_service.py#L16-L22)