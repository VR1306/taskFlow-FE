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
          role: 'Taskflow Admin',
        },
        {
          _id: 'user-002',
          userId: 'TF0002',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          role: 'Project Manager',
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
          role: 'Project Manager',
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
            role: 'Developer',
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
          role: 'Taskflow Admin',
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
          role: 'Project Manager',
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
    const adminOption = screen.getByRole('option', { name: 'Project Manager' });
    fireEvent.click(adminOption);

    const statusControl = screen.getByText('All Status');
    fireEvent.mouseDown(statusControl);
    const activeOption = screen.getByRole('option', { name: 'Active (Full Access)' });
    fireEvent.click(activeOption);

    // 3. Click Apply Filters
    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/getAllUsers?page=1&limit=10&role=Project+Manager&status=Active'
      );
    });

    // 4. Verify filter chips and badge count
    expect(screen.getByText('Role:')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Clear all')).toBeInTheDocument();

    // 5. Remove Role filter chip
    const removeRoleBtn = screen.getByLabelText('Remove role filter: Project Manager');
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

  it('changes page and rows-per-page via pagination, and resets to page 1 when searching/clearing from page 2', async () => {
    // The reducer syncs currentPage/limit from the response's pagination block, so the
    // mock must echo back whatever page/limit was actually requested.
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      const parsed = new URL(url, 'http://localhost');
      const page = Number(parsed.searchParams.get('page') || '1');
      const limit = Number(parsed.searchParams.get('limit') || '10');
      return Promise.resolve({
        success: true,
        data: [
          {
            _id: 'user-010',
            userId: 'TF0010',
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah@example.com',
            role: 'Developer',
          },
        ],
        pagination: { totalItems: 15, totalPages: 2, currentPage: page, limit },
      });
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    });

    // Redux dispatches (setLimit/setCurrentPage) are synchronous reducers, so we assert
    // directly against store state rather than the (cached) network call, and only wait
    // for isLoading to settle before interacting with controls that get disabled mid-fetch.
    const waitForIdle = () =>
      waitFor(() => expect(store.getState().users.isLoading).toBe(false), { timeout: 2000 });

    // Change rows-per-page -> covers handleLimitChange
    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '20' } });
    expect(store.getState().users.limit).toBe(20);
    await waitForIdle();

    // Navigate to page 2 -> covers handlePageChange
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(store.getState().users.currentPage).toBe(2);
    await waitForIdle();

    // Typing a search term while on page 2 resets currentPage to 1 immediately (line 96-97)
    fireEvent.change(screen.getByPlaceholderText('Search members by name, email, or user ID...'), {
      target: { value: 'Sarah' },
    });
    expect(store.getState().users.currentPage).toBe(1);

    // Wait for the debounce + refetch to settle so pagination controls re-enable
    await waitForIdle();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Page 2' })).not.toBeDisabled();
    });

    // Go back to page 2 with the search term still populated
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(store.getState().users.currentPage).toBe(2);
    await waitForIdle();

    // Clearing the search from page 2 resets currentPage to 1 immediately (line 105-106)
    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(store.getState().users.currentPage).toBe(1);
  });

  it('removes the status filter chip independently and refetches without it', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'user-020',
          userId: 'TF0020',
          firstName: 'Kyle',
          lastName: 'Reese',
          email: 'kyle@example.com',
          role: 'QA',
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

    fireEvent.click(screen.getByRole('button', { name: /open user filter drawer/i }));

    const roleControl = screen.getByText('All Roles');
    fireEvent.mouseDown(roleControl);
    fireEvent.click(screen.getByRole('option', { name: 'QA' }));

    const statusControl = screen.getByText('All Status');
    fireEvent.mouseDown(statusControl);
    fireEvent.click(screen.getByRole('option', { name: 'Active (Full Access)' }));

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/getAllUsers?page=1&limit=10&role=QA&status=Active'
      );
    });

    const removeStatusBtn = screen.getByLabelText('Remove status filter: Active');
    fireEvent.click(removeStatusBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/users/getAllUsers?page=1&limit=10&role=QA');
      expect(screen.queryByText('Status:')).not.toBeInTheDocument();
      expect(screen.getByText('Role:')).toBeInTheDocument();
    });
  });

  it('opens Edit User drawer from actions menu and closes it, then cancels the delete confirmation without deleting', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'user-030',
          userId: 'TF0030',
          firstName: 'John',
          lastName: 'Connor',
          email: 'john@example.com',
          role: 'Developer',
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
      expect(screen.getByText('John Connor')).toBeInTheDocument();
    });

    // Open actions menu and click Edit User -> covers handleEditUser
    fireEvent.click(screen.getByRole('button', { name: /actions for john connor/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /edit user/i }));

    expect(screen.getByText('Edit User Profile')).toBeInTheDocument();

    // Close via Cancel -> covers handleCloseEditDrawer
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Edit User Profile')).not.toBeInTheDocument();
    });

    // Open Delete confirmation and cancel it -> covers handleCloseDeleteModal
    fireEvent.click(screen.getByRole('button', { name: /actions for john connor/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete user/i }));

    expect(screen.getByText('Delete User Account')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Delete User Account')).not.toBeInTheDocument();
    });

    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  it('renders an Inactive status badge for users with isActive set to false', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'user-040',
          userId: 'TF0040',
          firstName: 'Miles',
          lastName: 'Dyson',
          email: 'miles@example.com',
          role: 'Developer',
          isActive: false,
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
      expect(screen.getByText('Miles Dyson')).toBeInTheDocument();
    });

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  describe('CSV/JSON export', () => {
    let originalCreateElement: typeof document.createElement;
    let clickMock: jest.Mock;

    beforeEach(() => {
      clickMock = jest.fn();
      originalCreateElement = document.createElement.bind(document);

      window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      window.URL.revokeObjectURL = jest.fn();

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const element = originalCreateElement(tagName) as HTMLAnchorElement;
          element.click = clickMock;
          return element;
        }
        return originalCreateElement(tagName);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const exportUser = {
      _id: 'user-050',
      userId: 'TF0050',
      firstName: 'Ellen',
      lastName: 'Ripley',
      email: 'ellen@example.com',
      role: 'Project Manager',
      isActive: true,
      createdAt: '2026-01-05T00:00:00.000Z',
    };
    const exportUser2 = {
      _id: 'user-051',
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      isActive: false,
      createdAt: '',
    };
    const exportUser3 = {
      _id: '',
      userId: '',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Developer',
      isActive: true,
      createdAt: '2026-01-05T00:00:00.000Z',
    };

    it('exports users as CSV and as JSON, fetching all matching users and triggering a download', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [exportUser, exportUser2, exportUser3],
        pagination: { totalItems: 3, totalPages: 1, currentPage: 1, limit: 10 },
      });

      const store = createMockStore();

      render(
        <Provider store={store}>
          <UsersPage />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Ellen Ripley')).toBeInTheDocument();
      });

      // Export as CSV -> covers fetchAllMatchingUsers (success path) and handleExportCsv
      fireEvent.click(screen.getByRole('button', { name: /export options/i }));
      fireEvent.click(screen.getByText('Export as CSV (.csv)'));

      await waitFor(() => {
        expect(clickMock).toHaveBeenCalled();
      });

      // Export as JSON -> covers formatUserForJson and handleExportJson
      fireEvent.click(screen.getByRole('button', { name: /export options/i }));
      fireEvent.click(screen.getByText('Export as JSON (.json)'));

      await waitFor(() => {
        expect(clickMock).toHaveBeenCalledTimes(2);
      });
    });

    it('exports with active search and filters query params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [exportUser],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
      });

      const store = createMockStore();

      render(
        <Provider store={store}>
          <UsersPage />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Ellen Ripley')).toBeInTheDocument();
      });

      // Type in search box to set debouncedSearch
      fireEvent.change(screen.getByPlaceholderText(/search members by name/i), {
        target: { value: 'Ellen' },
      });

      // Open filter drawer, apply role and status filters
      fireEvent.click(screen.getByRole('button', { name: /open user filter drawer/i }));
      fireEvent.mouseDown(screen.getByText('All Roles'));
      fireEvent.click(screen.getByRole('option', { name: 'Project Manager' }));
      fireEvent.mouseDown(screen.getByText('All Status'));
      fireEvent.click(screen.getByText('Active (Full Access)'));
      fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

      // Wait for debounce and search query
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('search=Ellen'));
      });

      // Now trigger export CSV
      fireEvent.click(screen.getByRole('button', { name: /export options/i }));
      fireEvent.click(screen.getByText('Export as CSV (.csv)'));

      await waitFor(() => {
        expect(clickMock).toHaveBeenCalled();
      });
    });

    it('falls back to cached users when the export fetch returns no data', async () => {
      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: [exportUser],
          pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
        })
        .mockResolvedValueOnce({ success: true, data: [] });

      const store = createMockStore();

      render(
        <Provider store={store}>
          <UsersPage />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Ellen Ripley')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /export options/i }));
      fireEvent.click(screen.getByText('Export as CSV (.csv)'));

      await waitFor(() => {
        expect(clickMock).toHaveBeenCalled();
      });
    });

    it('falls back to cached users when the export fetch rejects', async () => {
      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: [exportUser],
          pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
        })
        .mockRejectedValueOnce(new Error('Export fetch failed'));

      const store = createMockStore();

      render(
        <Provider store={store}>
          <UsersPage />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Ellen Ripley')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /export options/i }));
      fireEvent.click(screen.getByText('Export as JSON (.json)'));

      await waitFor(() => {
        expect(clickMock).toHaveBeenCalled();
      });
    });
  });
});
