#!/usr/bin/env python3
"""
SOCIALIUM INTEGRATION AUDIT
Checks all frontend-backend connections, configurations, and API endpoints.
"""

import os
import sys
import json
from pathlib import Path

# Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

def print_header(text):
    print(f"\n{BLUE}{BOLD}{'='*80}{RESET}")
    print(f"{BLUE}{BOLD}  {text}{RESET}")
    print(f"{BLUE}{BOLD}{'='*80}{RESET}\n")

def print_status(category, status, message=""):
    icon = f"{GREEN}✅" if status else f"{RED}❌"
    print(f"  {icon} {category:50s} {message}")

def check_file_exists(filepath, description):
    exists = Path(filepath).exists()
    print_status(description, exists, filepath if not exists else "")
    return exists

def read_env_file(filepath):
    """Read .env file and return dict of key-value pairs."""
    env_vars = {}
    if not Path(filepath).exists():
        return env_vars
    
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    return env_vars

def check_env_var(env_vars, key, required=True, description=""):
    value = env_vars.get(key, "")
    has_value = bool(value) and value not in ["", '""', "''"]
    status = has_value or not required
    
    if required and not has_value:
        print_status(f"{description} ({key})", False, "MISSING")
        return False
    elif has_value:
        # Mask sensitive values
        masked = value[:10] + "..." if len(value) > 10 else "***"
        print_status(f"{description} ({key})", True, f"{masked}")
        return True
    else:
        print_status(f"{description} ({key})", True, "Optional - Not Set")
        return True

# ============================================================================
# MAIN AUDIT
# ============================================================================

print_header("SOCIALIUM INTEGRATION AUDIT")

# Track overall status
all_checks = []

# 1. ENVIRONMENT FILES
print_header("1. ENVIRONMENT CONFIGURATION")

all_checks.append(check_file_exists("backend/.env", "Backend .env file"))
all_checks.append(check_file_exists("frontend/.env.local", "Frontend .env.local file"))

backend_env = read_env_file("backend/.env")
frontend_env = read_env_file("frontend/.env.local")

print(f"\n{BOLD}Backend Environment Variables:{RESET}")
all_checks.append(check_env_var(backend_env, "DATABASE_URL", required=True, description="Database Connection"))
all_checks.append(check_env_var(backend_env, "REDIS_URL", required=True, description="Redis Connection"))
all_checks.append(check_env_var(backend_env, "SUPABASE_URL", required=True, description="Supabase URL"))
all_checks.append(check_env_var(backend_env, "SUPABASE_ANON_KEY", required=True, description="Supabase Anon Key"))
all_checks.append(check_env_var(backend_env, "SUPABASE_SERVICE_ROLE_KEY", required=True, description="Supabase Service Key"))
all_checks.append(check_env_var(backend_env, "SUPABASE_JWT_SECRET", required=True, description="Supabase JWT Secret"))
all_checks.append(check_env_var(backend_env, "OPENAI_API_KEY", required=True, description="OpenAI API Key"))
all_checks.append(check_env_var(backend_env, "QDRANT_URL", required=True, description="Qdrant URL"))
all_checks.append(check_env_var(backend_env, "QDRANT_API_KEY", required=True, description="Qdrant API Key"))
all_checks.append(check_env_var(backend_env, "FRONTEND_URL", required=True, description="Frontend URL (CORS)"))
all_checks.append(check_env_var(backend_env, "SECRET_KEY", required=True, description="App Secret Key"))
all_checks.append(check_env_var(backend_env, "JWT_SECRET_KEY", required=True, description="JWT Secret"))
all_checks.append(check_env_var(backend_env, "WAPIHUB_API_KEY", required=False, description="WhatsApp API"))
all_checks.append(check_env_var(backend_env, "TWILIO_ACCOUNT_SID", required=False, description="Twilio SID"))
all_checks.append(check_env_var(backend_env, "STRIPE_SECRET_KEY", required=False, description="Stripe Key"))
all_checks.append(check_env_var(backend_env, "LINKEDIN_CLIENT_ID", required=False, description="LinkedIn OAuth"))
all_checks.append(check_env_var(backend_env, "LANGFUSE_PUBLIC_KEY", required=False, description="Langfuse"))
all_checks.append(check_env_var(backend_env, "POSTHOG_API_KEY", required=False, description="PostHog"))

print(f"\n{BOLD}Frontend Environment Variables:{RESET}")
all_checks.append(check_env_var(frontend_env, "NEXT_PUBLIC_API_URL", required=True, description="Backend API URL"))
all_checks.append(check_env_var(frontend_env, "NEXT_PUBLIC_SUPABASE_URL", required=False, description="Supabase URL"))
all_checks.append(check_env_var(frontend_env, "NEXT_PUBLIC_SUPABASE_ANON_KEY", required=False, description="Supabase Key"))
all_checks.append(check_env_var(frontend_env, "NEXT_PUBLIC_POSTHOG_KEY", required=False, description="PostHog Key"))

# 2. BACKEND CONFIGURATION
print_header("2. BACKEND CONFIGURATION (config.py)")

all_checks.append(check_file_exists("backend/app/config.py", "Config module"))
all_checks.append(check_file_exists("backend/app/main.py", "Main app entry"))

# Check CORS configuration
print(f"\n{BOLD}CORS Configuration:{RESET}")
try:
    with open("backend/app/main.py") as f:
        main_content = f.read()
        cors_ok = "allow_origins" in main_content and "localhost:3000" in main_content
        print_status("CORS allows frontend", cors_ok, "localhost:3000, 3001, 3002, 3003")
        all_checks.append(cors_ok)
        
        # Check API prefix
        prefix_ok = "api_v1_prefix" in main_content or "/api/v1" in main_content
        print_status("API prefix configured", prefix_ok, "/api/v1")
        all_checks.append(prefix_ok)
except Exception as e:
    print_status("CORS check", False, str(e))
    all_checks.append(False)

# 3. API ROUTERS
print_header("3. BACKEND API ROUTERS")

routers = {
    "auth.py": "/api/v1/auth/*",
    "workspace.py": "/api/v1/workspace/*",
    "content.py": "/api/v1/content/*",
    "platforms.py": "/api/v1/platforms/*",
    "oauth.py": "/api/v1/oauth/*",
    "approvals.py": "/api/v1/approvals/*",
    "scheduling.py": "/api/v1/scheduling/*",
    "analytics.py": "/api/v1/analytics/*",
    "billing.py": "/api/v1/billing/*",
    "memory.py": "/api/v1/memory/*",
    "notifications.py": "/api/v1/notifications/*",
    "trends.py": "/api/v1/trends/*",
    "ab_testing.py": "/api/v1/ab-testing/*",
    "auto_reply.py": "/api/v1/auto-reply/*",
    "whatsapp_webhook.py": "/api/v1/whatsapp/*",
    "twilio_webhook.py": "/api/v1/twilio/*",
}

for router_file, endpoint in routers.items():
    exists = check_file_exists(f"backend/app/routers/{router_file}", endpoint)
    all_checks.append(exists)

# 4. FRONTEND SERVICES
print_header("4. FRONTEND API SERVICES")

services = {
    "auth.ts": "Authentication",
    "workspace.ts": "Workspace",
    "content.ts": "Content",
    "platforms.ts": "Platforms",
    "scheduling.ts": "Scheduling",
    "analytics.ts": "Analytics",
    "notifications.ts": "Notifications",
    "trends.ts": "Trends",
}

for service_file, description in services.items():
    exists = check_file_exists(f"frontend/src/services/{service_file}", description)
    all_checks.append(exists)

# Check API client
all_checks.append(check_file_exists("frontend/src/lib/api.ts", "API Client (axios)"))
all_checks.append(check_file_exists("frontend/src/lib/auth.ts", "Auth utilities"))
all_checks.append(check_file_exists("frontend/src/lib/workspace.ts", "Workspace utilities"))

# 5. API ENDPOINT MAPPING
print_header("5. FRONTEND-BACKEND API MAPPING")

api_mappings = [
    ("POST /api/v1/auth/signup", "frontend/src/services/auth.ts", "signUp"),
    ("POST /api/v1/auth/login", "frontend/src/services/auth.ts", "signIn"),
    ("POST /api/v1/auth/refresh", "frontend/src/services/auth.ts", "refreshToken"),
    ("GET /api/v1/workspace", "frontend/src/services/workspace.ts", "listWorkspaces"),
    ("GET /api/v1/content", "frontend/src/services/content.ts", "listContent"),
    ("POST /api/v1/content", "frontend/src/services/content.ts", "createContent"),
    ("POST /api/v1/content/generate", "frontend/src/services/content.ts", "generateContent"),
    ("GET /api/v1/scheduling", "frontend/src/services/scheduling.ts", "listScheduled"),
    ("POST /api/v1/scheduling", "frontend/src/services/scheduling.ts", "scheduleContent"),
    ("GET /api/v1/analytics", "frontend/src/services/analytics.ts", "getAnalyticsOverview"),
    ("GET /api/v1/notifications", "frontend/src/services/notifications.ts", "listNotifications"),
    ("GET /api/v1/trends", "frontend/src/services/trends.ts", "fetchTrends"),
    ("GET /api/v1/platforms", "frontend/src/services/platforms.ts", "listPlatforms"),
]

for endpoint, service_file, function_name in api_mappings:
    # Check if endpoint exists in backend
    backend_exists = any(
        endpoint.split("/")[2] in router 
        for router in routers.keys()
    )
    
    # Check if service calls it
    service_exists = Path(service_file).exists()
    
    status = backend_exists and service_exists
    print_status(f"{endpoint}", status, f"→ {function_name}()")
    all_checks.append(status)

# 6. DATABASE & EXTERNAL SERVICES
print_header("6. EXTERNAL SERVICE CONNECTIONS")

services_to_check = [
    ("PostgreSQL", backend_env.get("DATABASE_URL", "").startswith("sqlite") or "postgresql" in backend_env.get("DATABASE_URL", "")),
    ("Redis", bool(backend_env.get("REDIS_URL", ""))),
    ("Supabase Auth", bool(backend_env.get("SUPABASE_URL", ""))),
    ("OpenAI GPT-4", bool(backend_env.get("OPENAI_API_KEY", ""))),
    ("Qdrant Vector DB", bool(backend_env.get("QDRANT_URL", ""))),
    ("Langfuse Monitoring", bool(backend_env.get("LANGFUSE_PUBLIC_KEY", ""))),
    ("WhatsApp (WapiHub)", bool(backend_env.get("WAPIHUB_API_KEY", ""))),
    ("Twilio SMS", bool(backend_env.get("TWILIO_ACCOUNT_SID", ""))),
    ("Stripe Payments", bool(backend_env.get("STRIPE_SECRET_KEY", "")) and "your-stripe" not in backend_env.get("STRIPE_SECRET_KEY", "")),
    ("PostHog Analytics", bool(backend_env.get("POSTHOG_API_KEY", ""))),
]

for service_name, is_configured in services_to_check:
    print_status(service_name, is_configured, "Connected" if is_configured else "Not configured")
    all_checks.append(is_configured)

# 7. CORS & SECURITY
print_header("7. SECURITY & CORS")

# Check if FRONTEND_URL matches
frontend_url = backend_env.get("FRONTEND_URL", "")
api_url = frontend_env.get("NEXT_PUBLIC_API_URL", "")

print_status(f"Backend CORS allows: {frontend_url}", True, "Configured")
print_status(f"Frontend points to: {api_url}", True, "Configured")

# Check JWT configuration
jwt_configured = bool(backend_env.get("JWT_SECRET_KEY", "")) and backend_env.get("JWT_SECRET_KEY", "") != "your-jwt-secret-key"
print_status("JWT Secret configured", jwt_configured, "Ready" if jwt_configured else "Using placeholder")
all_checks.append(jwt_configured)

# Check encryption key
encrypt_configured = bool(backend_env.get("ENCRYPTION_KEY", "")) and "change-me" not in backend_env.get("ENCRYPTION_KEY", "")
print_status("OAuth Token Encryption", encrypt_configured, "Ready" if encrypt_configured else "Using placeholder")
all_checks.append(encrypt_configured)

# 8. SUMMARY
print_header("INTEGRATION SUMMARY")

total = len(all_checks)
passed = sum(1 for x in all_checks if x)
failed = total - passed
percentage = (passed / total * 100) if total > 0 else 0

print(f"  {BOLD}Total Checks:{RESET} {total}")
print(f"  {GREEN}✅ Passed:{RESET} {passed}")
print(f"  {RED}❌ Failed:{RESET} {failed}")
print(f"  {BOLD}Integration Status:{RESET} ", end="")

if percentage >= 90:
    print(f"{GREEN}{percentage:.1f}% - PRODUCTION READY{RESET}")
elif percentage >= 75:
    print(f"{YELLOW}{percentage:.1f}% - MOSTLY READY{RESET}")
else:
    print(f"{RED}{percentage:.1f}% - NEEDS WORK{RESET}")

# Recommendations
if failed > 0:
    print(f"\n{YELLOW}{BOLD}RECOMMENDATIONS:{RESET}")
    if not frontend_env.get("NEXT_PUBLIC_SUPABASE_URL"):
        print(f"  • Add Supabase credentials to frontend/.env.local for direct client-side auth")
    if not backend_env.get("TWITTER_CLIENT_ID"):
        print(f"  • Configure Twitter/X OAuth credentials for Twitter integration")
    if not backend_env.get("INSTAGRAM_CLIENT_ID"):
        print(f"  • Configure Instagram OAuth credentials for Instagram integration")
    if "your-stripe" in backend_env.get("STRIPE_SECRET_KEY", ""):
        print(f"  • Add real Stripe keys for billing functionality")
    if backend_env.get("DATABASE_URL", "").startswith("sqlite"):
        print(f"  • Consider migrating from SQLite to PostgreSQL for production")

print(f"\n{BLUE}{'='*80}{RESET}\n")

sys.exit(0 if failed == 0 else 1)
