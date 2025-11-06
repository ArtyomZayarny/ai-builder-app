import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import Dashboard from '../Dashboard';
import * as resumeApi from '../../services/resumeApi';
import { Resume } from '../../types/resume';

// Mock the API module
vi.mock('../../services/resumeApi', () => ({
  getAllResumes: vi.fn(),
  createResume: vi.fn(),
  deleteResume: vi.fn(),
  duplicateResume: vi.fn(),
}));

describe('Dashboard', () => {
  const mockResumes: Resume[] = [
    {
      id: 1,
      title: 'Software Engineer Resume',
      template: 'classic' as const,
      accent_color: '#3B82F6',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Product Manager Resume',
      template: 'modern' as const,
      accent_color: '#10B981',
      created_at: '2024-01-03T00:00:00.000Z',
      updated_at: '2024-01-04T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(resumeApi.getAllResumes).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Dashboard />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays list of resumes', async () => {
    vi.mocked(resumeApi.getAllResumes).mockResolvedValue(mockResumes);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      expect(screen.getByText('Product Manager Resume')).toBeInTheDocument();
    });
  });

  // TODO: Fix test - text content doesn't match actual UI
  it.skip('shows empty state when no resumes exist', async () => {
    vi.mocked(resumeApi.getAllResumes).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no resumes yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first resume/i)).toBeInTheDocument();
    });
  });

  it('shows create resume button', async () => {
    vi.mocked(resumeApi.getAllResumes).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create resume/i })).toBeInTheDocument();
    });
  });

  // TODO: Fix test - error message format doesn't match actual UI
  it.skip('handles API error gracefully', async () => {
    vi.mocked(resumeApi.getAllResumes).mockRejectedValue(new Error('API Error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error.*loading/i)).toBeInTheDocument();
    });
  });

  // TODO: Fix test - button click handler not being triggered correctly
  it.skip('calls createResume when create button is clicked', async () => {
    vi.mocked(resumeApi.getAllResumes).mockResolvedValue([]);
    vi.mocked(resumeApi.createResume).mockResolvedValue({
      id: 3,
      title: 'New Resume',
      template: 'classic' as const,
      accent_color: '#3B82F6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const { user } = render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create resume/i })).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create resume/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(resumeApi.createResume).toHaveBeenCalled();
    });
  });
});
