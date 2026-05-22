#!/bin/bash
# Phase 1 Authentication & Logging Test Script

echo "========================================="
echo "PHASE 1 - AUTHENTICATION TESTS"
echo "========================================="
echo ""

# Test 1: Unauthenticated request (should fail)
echo "TEST 1: Unauthenticated request to /api/v1/content/"
echo "Expected: 401 Unauthorized"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:8000/api/v1/content/)
echo "$RESPONSE"
echo ""

# Test 2: Health check (should succeed - public endpoint)
echo "TEST 2: Health check (public endpoint)"
echo "Expected: 200 OK"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:8000/health)
echo "$RESPONSE"
echo ""

# Test 3: Check request ID in response headers
echo "TEST 3: Request ID in response headers"
echo "Expected: X-Request-ID header present"
curl -s -D - http://localhost:8000/health | grep -i "x-request-id"
echo ""

# Test 4: Login to get token
echo "TEST 4: Login to get JWT token"
echo "Expected: 200 OK with access_token"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}')
echo "$LOGIN_RESPONSE"
echo ""

# Extract token (if login succeeded)
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "None" ]; then
  echo "✅ Token received: ${TOKEN:0:20}..."
  echo ""
  
  # Test 5: Authenticated request
  echo "TEST 5: Authenticated request to /api/v1/content/"
  echo "Expected: 200 OK with content list"
  AUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:8000/api/v1/content/ \
    -H "Authorization: Bearer $TOKEN")
  echo "$AUTH_RESPONSE"
  echo ""
  
  # Test 6: Request ID with authenticated request
  echo "TEST 6: Request ID with authenticated request"
  curl -s -D - http://localhost:8000/api/v1/content/ \
    -H "Authorization: Bearer $TOKEN" | grep -i "x-request-id"
  echo ""
else
  echo "⚠️  Login failed (expected if test user doesn't exist)"
  echo "To test authenticated requests, create a user first:"
  echo "  curl -X POST http://localhost:8000/api/v1/auth/signup \\"
  echo "    -H 'Content-Type: application/json' \\"
  echo "    -d '{\"email\":\"test@example.com\",\"password\":\"testpassword123\",\"username\":\"testuser\"}'"
fi

echo ""
echo "========================================="
echo "TESTS COMPLETE"
echo "========================================="
echo ""
echo "Check backend terminal for structured logs with request_id"
echo ""
