import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockPrefetch = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();

const mockGet = vi.fn(() => null);

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
    }),
    useSearchParams: () => ({
      get: mockGet,
      has: vi.fn(() => false),
      toString: vi.fn(() => ''),
    }),
    usePathname: () => '',
  };
});

// Setup environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock window.matchMedia for Radix UI / Framer Motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Export mock references for direct assertions in test files if needed
export { mockPush, mockReplace, mockGet };
