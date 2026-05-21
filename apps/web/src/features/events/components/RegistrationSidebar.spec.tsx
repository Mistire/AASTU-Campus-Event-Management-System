import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegistrationSidebar } from './RegistrationSidebar';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock CemsButton
vi.mock('@/components/cems/CemsButton', () => ({
  CemsButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

const defaultProps = {
  isRegistering: false,
  isFull: false,
  capacityPercent: 40,
  handleRegister: vi.fn(),
  handleCancel: vi.fn(),
};

describe('RegistrationSidebar', () => {
  it('should render the register button for a new registration', () => {
    render(<RegistrationSidebar {...defaultProps} status="none" />);
    expect(screen.getByText(/Register for Entry/i)).toBeInTheDocument();
    expect(screen.getByText(/40% full/i)).toBeInTheDocument();
  });

  it('should call handleRegister when the register button is clicked', () => {
    const handleRegister = vi.fn();
    render(<RegistrationSidebar {...defaultProps} handleRegister={handleRegister} status="none" />);
    fireEvent.click(screen.getByText(/Register for Entry/i));
    expect(handleRegister).toHaveBeenCalledOnce();
  });

  it('should display "Event is Full" and disable the register button when isFull is true', () => {
    render(<RegistrationSidebar {...defaultProps} isFull={true} capacityPercent={100} status="none" />);
    const btn = screen.getByRole('button', { name: /Event is Full/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('should display "Confirmed" status badge when status is confirmed', () => {
    render(<RegistrationSidebar {...defaultProps} status="confirmed" />);
    expect(screen.getByText(/Confirmed/i)).toBeInTheDocument();
    // Heading text is split across React fragments: "You're" + <span>In!</span>
    // so we verify the full h3 textContent instead
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.textContent).toMatch(/You're\s*In!/i);
  });

  it('should display cancel button and call handleCancel when status is confirmed', () => {
    const handleCancel = vi.fn();
    render(<RegistrationSidebar {...defaultProps} status="confirmed" handleCancel={handleCancel} />);
    fireEvent.click(screen.getByText(/Cancel Registration/i));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it('should display "Waitlisted" status and waitlist position', () => {
    render(<RegistrationSidebar {...defaultProps} status="waitlisted" waitlistPosition={3} />);
    // Heading "On the Waitlist" is split across fragments — check textContent
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.textContent).toMatch(/On the\s*Waitlist/i);
    // Status badge should show the position
    expect(screen.getByText(/Waitlisted #3/i)).toBeInTheDocument();
  });

  it('should display "Pending Approval" status when status is pending', () => {
    render(<RegistrationSidebar {...defaultProps} status="pending" />);
    // Status badge shows "Pending Approval"
    expect(screen.getByText(/Pending Approval/i)).toBeInTheDocument();
    // Heading shows "Approval Pending" — check full h3 textContent
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.textContent).toMatch(/Approval\s*Pending/i);
  });

  it('should display "Event Ended" state when isEnded is true', () => {
    render(<RegistrationSidebar {...defaultProps} status="none" isEnded={true} />);
    expect(screen.getByText(/Event Ended/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Event Ended/i });
    expect(btn).toBeDisabled();
  });

  it('should display the organizer name in the host profile section', () => {
    render(<RegistrationSidebar {...defaultProps} organizerName="Dr. Kebede Abebe" />);
    expect(screen.getByText('Dr. Kebede Abebe')).toBeInTheDocument();
    expect(screen.getByText('Verified Organizer')).toBeInTheDocument();
  });
});
