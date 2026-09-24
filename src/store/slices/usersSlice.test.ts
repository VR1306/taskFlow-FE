import usersReducer, {
  setCurrentPage,
  setLimit,
  setSearch,
  setFilters,
  clearFilters,
  setFilterField,
  invalidateUsersCache,
  clearUsersError,
  fetchUsers,
  createUserThunk,
  updateUserThunk,
  deleteUserThunk,
  UsersState,
} from './usersSlice';
import { apiClient } from '@/services/api';

jest.mock('@/services/api');

describe('usersSlice Redux Reducer & Async Thunks', () => {
  const initialUsersState: UsersState = {
    cachedPages: {},
    currentPage: 1,
    limit: 10,
    search: '',
    filters: {},
    totalItems: 0,
    totalPages: 1,
    isLoading: false,
    isActionLoading: false,
    error: null,
    ttlMs: 120000,
  };

  const mockUsersData = [
    {
      _id: 'usr-1',
      userId: 'TF0001',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      role: 'Admin',
      isActive: true,
    },
  ];

  const mockPagination = {
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles initial state', () => {
    expect(usersReducer(undefined, { type: 'unknown' })).toEqual(initialUsersState);
  });

  it('handles setCurrentPage', () => {
    const state = usersReducer(initialUsersState, setCurrentPage(3));
    expect(state.currentPage).toBe(3);
  });

  it('handles setLimit and resets currentPage to 1', () => {
    const populatedState: UsersState = {
      ...initialUsersState,
      currentPage: 4,
    };
    const state = usersReducer(populatedState, setLimit(50));
    expect(state.limit).toBe(50);
    expect(state.currentPage).toBe(1);
  });

  it('handles setSearch and resets currentPage to 1', () => {
    const populatedState: UsersState = {
      ...initialUsersState,
      currentPage: 4,
    };
    const state = usersReducer(populatedState, setSearch('Alice'));
    expect(state.search).toBe('Alice');
    expect(state.currentPage).toBe(1);
  });

  it('handles setFilters and resets currentPage to 1', () => {
    const populatedState: UsersState = {
      ...initialUsersState,
      currentPage: 4,
    };
    const state = usersReducer(populatedState, setFilters({ role: 'Admin', status: 'Active' }));
    expect(state.filters).toEqual({ role: 'Admin', status: 'Active' });
    expect(state.currentPage).toBe(1);
  });

  it('handles clearFilters and resets currentPage to 1', () => {
    const populatedState: UsersState = {
      ...initialUsersState,
      currentPage: 4,
      filters: { role: 'Admin', status: 'Active' },
    };
    const state = usersReducer(populatedState, clearFilters());
    expect(state.filters).toEqual({});
    expect(state.currentPage).toBe(1);
  });

  it('handles setFilterField and resets currentPage to 1', () => {
    const populatedState: UsersState = {
      ...initialUsersState,
      currentPage: 4,
      filters: { role: 'Admin' },
    };
    const state = usersReducer(
      populatedState,
      setFilterField({ field: 'status', value: 'Active' })
    );
    expect(state.filters).toEqual({ role: 'Admin', status: 'Active' });
    expect(state.currentPage).toBe(1);
  });

  it('handles invalidateUsersCache', () => {
    const populatedState: UsersState = {
      ...initialUsersState,
      cachedPages: {
        '1-10---': {
          data: mockUsersData,
          pagination: mockPagination,
          timestamp: Date.now(),
        },
      },
    };

    const state = usersReducer(populatedState, invalidateUsersCache());
    expect(state.cachedPages).toEqual({});
  });

  it('handles clearUsersError', () => {
    const errorState: UsersState = {
      ...initialUsersState,
      error: 'Something went wrong',
    };
    const state = usersReducer(errorState, clearUsersError());
    expect(state.error).toBeNull();
  });

  it('fetches users and stores in cache on fulfilled', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockUsersData,
      pagination: mockPagination,
    });

    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = fetchUsers({ page: 1, limit: 10 });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/fetchUsers/fulfilled');
    expect(apiClient.get).toHaveBeenCalledWith('/users/getAllUsers?page=1&limit=10');

    // Test reducer handling fulfilled action
    const state = usersReducer(initialUsersState, result);
    expect(state.isLoading).toBe(false);
    expect(state.totalItems).toBe(1);
    expect(state.cachedPages['1-10---']?.data).toEqual(mockUsersData);
  });

  it('fetches users with search query and encodes parameter', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockUsersData,
      pagination: mockPagination,
    });

    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = fetchUsers({ page: 1, limit: 10, search: 'Alice Smith' });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/fetchUsers/fulfilled');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/users/getAllUsers?page=1&limit=10&search=Alice+Smith'
    );

    const state = usersReducer(initialUsersState, result);
    expect(state.search).toBe('Alice Smith');
    expect(state.cachedPages['1-10-Alice Smith--']?.data).toEqual(mockUsersData);
  });

  it('fetches users with role and status filter parameters', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockUsersData,
      pagination: mockPagination,
    });

    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = fetchUsers({ page: 1, limit: 10, role: 'Admin', status: 'Active' });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/fetchUsers/fulfilled');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/users/getAllUsers?page=1&limit=10&role=Admin&status=Active'
    );

    const state = usersReducer(initialUsersState, result);
    expect(state.filters.role).toBe('Admin');
    expect(state.filters.status).toBe('Active');
    expect(state.cachedPages['1-10--Admin-Active']?.data).toEqual(mockUsersData);
  });

  it('uses cached data without calling API when cache is fresh', async () => {
    const freshCacheState: UsersState = {
      ...initialUsersState,
      cachedPages: {
        '1-10---': {
          data: mockUsersData,
          pagination: mockPagination,
          timestamp: Date.now(),
        },
      },
    };

    const dispatch = jest.fn();
    const getState = () => ({ users: freshCacheState });

    const thunk = fetchUsers({ page: 1, limit: 10 });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/fetchUsers/fulfilled');
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('handles fetchUsers rejection on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = fetchUsers({ page: 1, limit: 10 });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/fetchUsers/rejected');

    const state = usersReducer(initialUsersState, result);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('dispatches createUserThunk successfully', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ success: true });
    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = createUserThunk({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      role: 'User',
      isActive: true,
    });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/createUser/fulfilled');
    expect(apiClient.post).toHaveBeenCalledWith('/users/createUser', {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      role: 'User',
      isActive: true,
    });
  });

  it('dispatches updateUserThunk successfully', async () => {
    (apiClient.put as jest.Mock).mockResolvedValueOnce({ success: true });
    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = updateUserThunk({
      id: 'usr-1',
      firstName: 'Updated',
      isActive: false,
    });
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/updateUser/fulfilled');
    expect(apiClient.put).toHaveBeenCalledWith('/users/updateUser/usr-1', {
      firstName: 'Updated',
      isActive: false,
    });
  });

  it('dispatches deleteUserThunk successfully', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({ success: true });
    const dispatch = jest.fn();
    const getState = () => ({ users: initialUsersState });

    const thunk = deleteUserThunk('usr-1');
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('users/deleteUser/fulfilled');
    expect(apiClient.delete).toHaveBeenCalledWith('/users/deleteUser/usr-1');
  });
  it.each([new Error('Offline'), null])(
    'createUserThunk propagates request failures: %j',
    async (error) => {
      jest.mocked(apiClient.post).mockRejectedValue(error);
      const dispatch = jest.fn();
      const result = await createUserThunk({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        role: 'Developer',
      })(dispatch, () => ({ users: initialUsersState }), undefined);
      expect(result.payload).toBe(error instanceof Error ? 'Offline' : 'Failed to create user');
      let state = initialUsersState;
      for (const [action] of dispatch.mock.calls) state = usersReducer(state, action);
      expect(state.isActionLoading).toBe(false);
      expect(state.error).toBe(error instanceof Error ? 'Offline' : 'Failed to create user');
    }
  );

  it.each([new Error('Offline'), null])(
    'updateUserThunk propagates request failures: %j',
    async (error) => {
      jest.mocked(apiClient.put).mockRejectedValue(error);
      const dispatch = jest.fn();
      const result = await updateUserThunk({ id: 'user-1' })(
        dispatch,
        () => ({ users: initialUsersState }),
        undefined
      );
      expect(result.payload).toBe(error instanceof Error ? 'Offline' : 'Failed to update user');
      let state = initialUsersState;
      for (const [action] of dispatch.mock.calls) state = usersReducer(state, action);
      expect(state.isActionLoading).toBe(false);
      expect(state.error).toBe(error instanceof Error ? 'Offline' : 'Failed to update user');
    }
  );

  it.each([new Error('Offline'), null])(
    'deleteUserThunk propagates request failures: %j',
    async (error) => {
      jest.mocked(apiClient.delete).mockRejectedValue(error);
      const dispatch = jest.fn();
      const result = await deleteUserThunk('user-1')(
        dispatch,
        () => ({ users: initialUsersState }),
        undefined
      );
      expect(result.payload).toBe(error instanceof Error ? 'Offline' : 'Failed to delete user');
      let state = initialUsersState;
      for (const [action] of dispatch.mock.calls) state = usersReducer(state, action);
      expect(state.isActionLoading).toBe(false);
      expect(state.error).toBe(error instanceof Error ? 'Offline' : 'Failed to delete user');
    }
  );
});
