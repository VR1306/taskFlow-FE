import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UsersPage from './page';
import { apiClient } from '@/services/api';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';

jest.mock('@/services/api');

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
    },
  });
};

describe('UsersPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user list table with TF0001 IDs and Create User button', async () => {
    const mockUsersData = {
      success: true,
      pagination: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'user-001',
          userId: 'TF0001',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          role: 'SuperAdmin',
        },
        {
          _id: 'user-002',
          userId: 'TF0002',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          role: 'Admin',
        },
      ],
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockUsersData);

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    expect(screen.getAllByTestId('table-skeleton-row')).toHaveLength(5);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
      expect(screen.getByText('TF0001')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('TF0002')).toBeInTheDocument();
      expect(screen.getByText('All Members (2)')).toBeInTheDocument();
    });
  });

  it('opens and closes Create User modal on button click', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 },
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Create New User')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
    });
  });

  it('handles user actions: View Details, Edit User, Delete User', async () => {
    const mockUsersData = {
      success: true,
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
      data: [
        {
          _id: 'user-002',
          userId: 'TF0002',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          role: 'Admin',
        },
      ],
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockUsersData);
    (apiClient.delete as jest.Mock).mockResolvedValue({ success: true, message: 'Deleted' });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    // Open Actions menu
    const actionsBtn = screen.getByRole('button', { name: /actions for john smith/i });
    fireEvent.click(actionsBtn);

    expect(screen.getByRole('menuitem', { name: /view details/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /edit user/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /delete user/i })).toBeInTheDocument();

    // Click View Details
    fireEvent.click(screen.getByRole('menuitem', { name: /view details/i }));
    expect(screen.getByText('User Profile Details')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));

    // Reopen menu and click Delete User
    fireEvent.click(actionsBtn);
    fireEvent.click(screen.getByRole('menuitem', { name: /delete user/i }));
    expect(screen.getByText('Delete User Account')).toBeInTheDocument();

    // Confirm Delete
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete User' });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/users/deleteUser/user-002');
    });
  });

  it('displays empty state when no users are returned', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 },
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user records found.')).toBeInTheDocument();
    });
  });

  it('displays error alert and supports retry on fetch error', async () => {
    (apiClient.get as jest.Mock)
      .mockRejectedValueOnce(new Error('Network connection timeout'))
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            _id: 'user-003',
            userId: 'TF0003',
            firstName: 'Recovered',
            lastName: 'User',
            email: 'recovered@example.com',
            role: 'User',
          },
        ],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
      });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Network connection timeout')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Recovered User')).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('filters users by typing in search input with debounce and allows clearing', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'user-001',
          userId: 'TF0001',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          role: 'SuperAdmin',
        },
      ],
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search members by name, email, or user ID...')
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search members by name, email, or user ID...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/users/getAllUsers?page=1&limit=10&search=Jane');
    });

    // Clear search button should appear
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('displays search empty message when debounced search returns 0 results', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 },
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search members by name, email, or user ID...')
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search members by name, email, or user ID...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentUser' } });

    await waitFor(() => {
      expect(screen.getByText('No users matching "NonexistentUser" found.')).toBeInTheDocument();
    });
  });

  it('opens filter drawer, applies role and status filters, renders active chips, and clears filters', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'user-001',
          userId: 'TF0001',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          role: 'Admin',
          isActive: true,
        },
      ],
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open user filter drawer/i })).toBeInTheDocument();
    });

    // 1. Open Filter drawer
    const filterBtn = screen.getByRole('button', { name: /open user filter drawer/i });
    fireEvent.click(filterBtn);

    expect(screen.getByText('Filter Team Members')).toBeInTheDocument();

    // 2. Select role and status
    const roleControl = screen.getByText('All Roles');
    fireEvent.mouseDown(roleControl);
    const adminOption = screen.getByRole('option', { name: 'Admin' });
    fireEvent.click(adminOption);

    const statusControl = screen.getByText('All Statuses');
    fireEvent.mouseDown(statusControl);
    const activeOption = screen.getByRole('option', { name: 'Active (Full Access)' });
    fireEvent.click(activeOption);

    // 3. Click Apply Filters
    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/getAllUsers?page=1&limit=10&role=Admin&status=Active'
      );
    });

    // 4. Verify filter chips and badge count
    expect(screen.getByText('Role:')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Clear all')).toBeInTheDocument();

    // 5. Remove Role filter chip
    const removeRoleBtn = screen.getByLabelText('Remove role filter: Admin');
    fireEvent.click(removeRoleBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/getAllUsers?page=1&limit=10&status=Active'
      );
    });

    // 6. Click Clear all
    const clearAllBtn = screen.getByText('Clear all');
    fireEvent.click(clearAllBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/users/getAllUsers?page=1&limit=10');
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });
  });
});
