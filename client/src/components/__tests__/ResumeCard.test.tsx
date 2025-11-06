import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import ResumeCard from '../ResumeCard';
import { Resume } from '../../types/resume';

describe('ResumeCard', () => {
  const mockResume: Resume = {
    id: 1,
    title: 'Software Engineer Resume',
    template: 'classic' as const,
    accent_color: '#3B82F6',
    is_public: false,
    public_id: 'test-public-id-123',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  };

  const mockOnDelete = vi.fn();
  const mockOnDuplicate = vi.fn();

  it('renders resume title', () => {
    render(
      <ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} />
    );

    expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
  });

  it('displays last updated date', () => {
    render(
      <ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} />
    );

    // Check that some date is displayed
    expect(screen.getByText(/Updated/i)).toBeInTheDocument();
  });
});
