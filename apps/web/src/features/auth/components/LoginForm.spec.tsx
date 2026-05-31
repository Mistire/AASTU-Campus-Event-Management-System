import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { toast } from 'sonner';
import { mockPush, mockGet } from '../../../../vitest.setup';

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useAuthStore
const mockSetAuth = vi.fn();
vi.mock('@/features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    setAuth: mockSetAuth,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render the login form inputs and submit button', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Portal/i })).toBeInTheDocument();
  });

  it('should update inputs on typing', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'student@aastu.edu.et' } });
    fireEvent.change(passwordInput, { target: { value: 'secretpass' } });

    expect(emailInput.value).toBe('student@aastu.edu.et');
    expect(passwordInput.value).toBe('secretpass');
  });

  it('should handle successful login for a STUDENT and redirect to /discovery', async () => {
    const mockSuccessResponse = {
      ok: true,
      json: async () => ({
        data: {
          access_token: 'student-token',
          refresh_token: 'student-refresh-token',
          user: {
            id: 'user-stud-123',
            fullName: 'Abebe Kebede',
            email: 'student@aastu.edu.et',
            role: 'STUDENT',
          },
        },
      }),
    };
    (global.fetch as any).mockResolvedValue(mockSuccessResponse);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });

    fireEvent.change(emailInput, { target: { value: 'student@aastu.edu.et' } });
    fireEvent.change(passwordInput, { target: { value: 'secretpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'student@aastu.edu.et',
            password: 'secretpass',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        'student-token',
        'student-refresh-token',
        expect.objectContaining({
          id: 'user-stud-123',
          role: 'STUDENT',
          full_name: 'Abebe Kebede',
        })
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome back!', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/discovery');
    });
  });

  it('should handle successful login for an ADMIN and redirect to /dashboard', async () => {
    const mockSuccessResponse = {
      ok: true,
      json: async () => ({
        data: {
          access_token: 'admin-token',
          refresh_token: 'admin-refresh-token',
          user: {
            id: 'user-admin-123',
            fullName: 'Admin User',
            email: 'admin@aastu.edu.et',
            role: 'ADMIN',
          },
        },
      }),
    };
    (global.fetch as any).mockResolvedValue(mockSuccessResponse);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });

    fireEvent.change(emailInput, { target: { value: 'admin@aastu.edu.et' } });
    fireEvent.change(passwordInput, { target: { value: 'adminpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should handle login failure and show error toast', async () => {
    const mockErrorResponse = {
      ok: false,
      json: async () => ({
        message: 'Invalid email or password',
      }),
    };
    (global.fetch as any).mockResolvedValue(mockErrorResponse);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@aastu.edu.et' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Login Failed',
        expect.objectContaining({
          description: 'Invalid email or password',
        })
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
