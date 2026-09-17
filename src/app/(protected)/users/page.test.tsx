import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersPage from './page';
import { apiClient } from '@/services/api';

describe('UsersPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user list table upon successful API response', async () => {
    const mockUsersData = {
      success: true,
      pagination: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'user-001',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          role: 'SuperAdmin',
        },
        {
          _id: 'user-002',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          role: 'Admin',
        },
      ],
    };

    jest.spyOn(apiClient, 'get').mockResolvedValue(mockUsersData);

    render(<UsersPage />);

    expect(screen.getByText('Loading users data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Users Management')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
      expect(screen.getByText('user-001')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('All Members (2)')).toBeInTheDocument();
    });
  });

  it('displays empty state when no users are returned', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: [],
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('No user records found.')).toBeInTheDocument();
    });
  });

  it('displays error alert and supports retry on fetch error', async () => {
    const getSpy = jest
      .spyOn(apiClient, 'get')
      .mockRejectedValueOnce(new Error('Network connection timeout'))
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            _id: 'user-003',
            firstName: 'Recovered',
            lastName: 'User',
            email: 'recovered@example.com',
            role: 'User',
          },
        ],
      });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Network connection timeout')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Recovered User')).toBeInTheDocument();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });
});
