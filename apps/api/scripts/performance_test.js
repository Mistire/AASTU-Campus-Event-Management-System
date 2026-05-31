import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 virtual users
    { duration: '1m', target: 50 },  // Stay at 50 users
    { duration: '30s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  // 1. Check health
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Fetch events list (public route or generic route)
  const eventsRes = http.get(`${BASE_URL}/events`);
  check(eventsRes, {
    'events fetched successfully': (r) => r.status === 200 || r.status === 401, // 401 if it requires auth
  });

  // 3. Get specific event (assuming 'event-1' exists, or this will return 404, which is fine for measuring basic speed)
  const singleEventRes = http.get(`${BASE_URL}/events/event-1`);
  check(singleEventRes, {
    'single event responds': (r) => [200, 404, 401].includes(r.status),
  });

  sleep(1);
}
