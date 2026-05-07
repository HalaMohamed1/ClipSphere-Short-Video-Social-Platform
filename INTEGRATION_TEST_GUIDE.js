// Quick Integration Tests for Person 1 Phase 3 Infrastructure
// Run these tests after starting the backend to verify socket infrastructure

/**
 * TEST 1: Socket Connection with JWT
 * 
 * Open browser DevTools console on http://localhost:3000 while logged in
 */
function testSocketConnection() {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    console.log('❌ No token found - login first');
    return;
  }

  // The socket service should auto-connect
  const socket = getSocket?.();
  if (!socket) {
    console.log('❌ Socket not initialized - call initializeSocket(token)');
    return;
  }

  console.log('✅ Socket connected:', socket.connected);
  console.log('✅ Socket ID:', socket.id);
  console.log('✅ User room:', socket.auth?.token ? 'JWT attached' : 'No JWT');
}

/**
 * TEST 2: Engagement Hub Hook
 * 
 * In a React component using useEngagementHub
 */
function testEngagementHub() {
  const { 
    notifications, 
    hasUnread, 
    unreadCount, 
    isLoading, 
    error 
  } = useEngagementHub(true);

  console.log('✅ Engagement Hub loaded');
  console.log('  - Loading:', isLoading);
  console.log('  - Has Unread:', hasUnread);
  console.log('  - Unread Count:', unreadCount);
  console.log('  - Total Notifications:', notifications.length);
  console.log('  - Errors:', error);
}

/**
 * TEST 3: Follow Button Functionality
 * 
 * Postman test for follow endpoints
 */
const FOLLOW_TEST = {
  // Get JWT token from login first
  getToken: {
    url: 'POST http://localhost:5000/api/v1/auth/login',
    body: {
      email: 'user@example.com',
      password: 'password123'
    },
    header: 'Content-Type: application/json'
  },

  // Follow a user
  follow: {
    url: 'POST http://localhost:5000/api/v1/users/USER_ID/follow',
    headers: {
      'Authorization': 'Bearer TOKEN',
      'Content-Type': 'application/json'
    },
    expectedResponse: {
      status: 'success',
      message: 'You are now following this user',
      data: {
        follow: { follower: '...', following: '...' },
        notificationDecision: { ... }
      }
    },
    expectedSocketEvent: {
      event: 'new-follower',
      receivedBy: 'Followed user\'s socket room',
      data: { followerId: '...', followerUsername: '...', type: 'follow' }
    }
  },

  // Get following list
  getFollowing: {
    url: 'GET http://localhost:5000/api/v1/users/:id/following?page=1&limit=20',
    headers: { 'Authorization': 'Bearer TOKEN' },
    expectedResponse: {
      status: 'success',
      data: {
        users: [{ _id: '...', username: '...', ... }],
        pagination: { total: 5, page: 1, limit: 20, pages: 1 }
      }
    }
  },

  // Unfollow a user
  unfollow: {
    url: 'DELETE http://localhost:5000/api/v1/users/USER_ID/unfollow',
    headers: { 'Authorization': 'Bearer TOKEN' },
    expectedResponse: {
      status: 'success',
      message: 'You have unfollowed this user'
    }
  }
};

/**
 * TEST 4: Notification Badge Updates
 * 
 * In browser on logged-in page
 */
function testNotificationBadge() {
  // The badge should be visible in navbar
  const badge = document.querySelector('[aria-label="Activity notifications"]');
  if (!badge) {
    console.log('❌ Activity icon not found');
    return;
  }

  console.log('✅ Activity icon found');

  // Check for red dot
  const redDot = badge.querySelector('.bg-red-500');
  if (redDot) {
    console.log('✅ Red notification dot visible');
  }

  // Check for count badge
  const countBadge = badge.querySelector('.text-white');
  if (countBadge) {
    console.log('✅ Notification count:', countBadge.textContent);
  }
}

/**
 * TEST 5: Validation Errors
 * 
 * Test invalid requests
 */
const VALIDATION_TESTS = {
  // Invalid user ID format
  invalidUserId: {
    url: 'POST http://localhost:5000/api/v1/users/not-a-valid-id/follow',
    headers: { 'Authorization': 'Bearer TOKEN' },
    expectedResponse: {
      status: 'fail',
      message: 'Validation failed: id - Invalid user ID format'
    }
  },

  // Self-follow
  selfFollow: {
    url: 'POST http://localhost:5000/api/v1/users/YOUR_OWN_ID/follow',
    headers: { 'Authorization': 'Bearer TOKEN' },
    expectedResponse: {
      status: 'fail',
      message: 'You cannot follow yourself'
    }
  },

  // Already following
  alreadyFollowing: {
    url: 'POST http://localhost:5000/api/v1/users/USER_ID/follow',
    headers: { 'Authorization': 'Bearer TOKEN' },
    expectedResponse: {
      status: 'fail',
      message: 'You are already following this user'
    }
  }
};

/**
 * TEST 6: Security Headers
 * 
 * In browser DevTools Network tab, check response headers
 */
function testSecurityHeaders() {
  // Make a request and check headers
  fetch('http://localhost:5000/health')
    .then(r => {
      console.log('✅ Security Headers:');
      console.log('  - X-Content-Type-Options:', r.headers.get('X-Content-Type-Options'));
      console.log('  - X-Frame-Options:', r.headers.get('X-Frame-Options'));
      console.log('  - X-XSS-Protection:', r.headers.get('X-XSS-Protection'));
      console.log('  - Referrer-Policy:', r.headers.get('Referrer-Policy'));
      console.log('  - Content-Security-Policy:', r.headers.get('Content-Security-Policy')?.substring(0, 50) + '...');
    });
}

/**
 * TEST 7: Socket Event Emission
 * 
 * Manually trigger follow and check socket event
 */
function testSocketEventEmission() {
  // In browser console while two users are logged in
  
  // User A - Listen for follow event
  const socket = getSocket();
  
  socket.on('new-follower', (data) => {
    console.log('✅ Received new-follower event:');
    console.log('  - From:', data.followerUsername);
    console.log('  - Follower ID:', data.followerId);
    console.log('  - Type:', data.type);
    console.log('  - Timestamp:', data.timestamp);
  });

  console.log('Listening for follow events...');
  console.log('Now go follow this user in another browser window');
}

/**
 * COMPLETE INTEGRATION TEST FLOW
 */
function runFullIntegrationTest() {
  console.log('🧪 Starting Full Integration Test...\n');

  // 1. Check Socket Connection
  console.log('1️⃣ Testing Socket Connection');
  testSocketConnection();
  console.log('');

  // 2. Check Badge
  console.log('2️⃣ Testing Notification Badge');
  testNotificationBadge();
  console.log('');

  // 3. Check Security Headers
  console.log('3️⃣ Testing Security Headers');
  testSecurityHeaders();
  console.log('');

  console.log('✅ Integration test complete!');
  console.log('');
  console.log('Next: Test follow endpoints with Postman using FOLLOW_TEST object');
  console.log('Then: Open Activity page and verify notifications appear');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSocketConnection,
    testEngagementHub,
    testNotificationBadge,
    testSecurityHeaders,
    testSocketEventEmission,
    runFullIntegrationTest,
    FOLLOW_TEST,
    VALIDATION_TESTS
  };
}

// Run immediately if in browser
if (typeof window !== 'undefined') {
  window.runIntegrationTest = runFullIntegrationTest;
  console.log('Integration test available at: runIntegrationTest()');
}
