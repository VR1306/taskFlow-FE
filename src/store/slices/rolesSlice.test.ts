import rolesReducer, {
  setRolesCurrentPage,
  setRolesLimit,
  setRolesSearch,
  setRolesFilters,
  clearRolesFilters,
  setRolesFilterField,
  invalidateRolesCache,
  clearRolesError,
  fetchPermissionsCatalogue,
  fetchRoles,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  RolesState,
} from './rolesSlice';
import { rolesService } from '@/services';

jest.mock('@/services');

describe('rolesSlice Redux Reducer & Async Thunks', () => {
  const initialRolesState: RolesState = {
    cachedPages: {},
    permissionsCatalogue: [],
    currentPage: 1,
    limit: 10,
    search: '',
    filters: {},
    totalItems: 0,
    totalPages: 1,
    isLoading: false,
    isPermissionsLoading: false,
    isActionLoading: false,
    error: null,
    ttlMs: 120000,
  };

  const mockRoleRecord = {
    _id: 'rol-1',
    roleId: 'RL0001',
    roleName: 'System Administrator',
    roleDescription: 'Full access',
    rolePermissions: ['*'],
    roleType: 'Admin' as const,
    status: 'Active' as const,
    isSystem: true,
    userCount: 2,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

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
    expect(rolesReducer(undefined, { type: 'unknown' })).toEqual(initialRolesState);
  });

  it('handles setRolesCurrentPage', () => {
    const state = rolesReducer(initialRolesState, setRolesCurrentPage(3));
    expect(state.currentPage).toBe(3);
  });

  it('handles setRolesLimit and resets currentPage to 1', () => {
    const populatedState: RolesState = {
      ...initialRolesState,
      currentPage: 4,
    };
    const state = rolesReducer(populatedState, setRolesLimit(25));
    expect(state.limit).toBe(25);
    expect(state.currentPage).toBe(1);
  });

  it('handles setRolesSearch and resets currentPage to 1', () => {
    const populatedState: RolesState = {
      ...initialRolesState,
      currentPage: 3,
    };
    const state = rolesReducer(populatedState, setRolesSearch('Admin'));
    expect(state.search).toBe('Admin');
    expect(state.currentPage).toBe(1);
  });

  it('handles setRolesFilters and resets currentPage to 1', () => {
    const populatedState: RolesState = {
      ...initialRolesState,
      currentPage: 2,
    };
    const state = rolesReducer(
      populatedState,
      setRolesFilters({ roleType: 'Admin', status: 'Active' })
    );
    expect(state.filters).toEqual({ roleType: 'Admin', status: 'Active' });
    expect(state.currentPage).toBe(1);
  });

  it('handles clearRolesFilters and resets currentPage to 1', () => {
    const populatedState: RolesState = {
      ...initialRolesState,
      currentPage: 5,
      filters: { roleType: 'User' },
    };
    const state = rolesReducer(populatedState, clearRolesFilters());
    expect(state.filters).toEqual({});
    expect(state.currentPage).toBe(1);
  });

  it('handles setRolesFilterField', () => {
    const state = rolesReducer(
      initialRolesState,
      setRolesFilterField({ field: 'roleType', value: 'Manager' })
    );
    expect(state.filters.roleType).toBe('Manager');
    expect(state.currentPage).toBe(1);
  });

  it('handles invalidateRolesCache and clearRolesError', () => {
    const populatedState: RolesState = {
      ...initialRolesState,
      cachedPages: {
        '1-10---': {
          data: [mockRoleRecord],
          pagination: mockPagination,
          timestamp: Date.now(),
        },
      },
      error: 'Some error',
    };
    let state = rolesReducer(populatedState, invalidateRolesCache());
    expect(state.cachedPages).toEqual({});

    state = rolesReducer(state, clearRolesError());
    expect(state.error).toBeNull();
  });

  describe('fetchPermissionsCatalogue thunk', () => {
    it('returns existing catalogue if already populated', async () => {
      const dispatch = jest.fn();
      const getState = () => ({
        roles: {
          ...initialRolesState,
          permissionsCatalogue: [
            {
              moduleKey: 'users',
              moduleName: 'User Management',
              description: 'Manage users',
              permissions: [],
            },
          ],
        },
      });

      const thunk = fetchPermissionsCatalogue();
      const result = await thunk(dispatch, getState, undefined);

      expect(rolesService.getPermissionsCatalogue).not.toHaveBeenCalled();
      expect(result.payload).toEqual([
        {
          moduleKey: 'users',
          moduleName: 'User Management',
          description: 'Manage users',
          permissions: [],
        },
      ]);
    });

    it('fetches catalogue from service when empty', async () => {
      const mockCatalogue = [
        {
          moduleKey: 'users',
          moduleName: 'User Management',
          description: 'Manage users',
          permissions: [
            {
              id: 'users.view',
              name: 'View Users',
              description: 'Can view users',
              action: 'read' as const,
            },
          ],
        },
      ];
      (rolesService.getPermissionsCatalogue as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockCatalogue,
      });

      const dispatch = jest.fn();
      const getState = () => ({ roles: initialRolesState });

      const thunk = fetchPermissionsCatalogue();
      const result = await thunk(dispatch, getState, undefined);

      expect(rolesService.getPermissionsCatalogue).toHaveBeenCalled();
      expect(result.payload).toEqual(mockCatalogue);
    });

    it('handles service errors gracefully', async () => {
      (rolesService.getPermissionsCatalogue as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const dispatch = jest.fn();
      const getState = () => ({ roles: initialRolesState });

      const thunk = fetchPermissionsCatalogue();
      const result = await thunk(dispatch, getState, undefined);

      expect(result.type).toBe('roles/fetchPermissionsCatalogue/rejected');
      expect(result.payload).toBe('Network error');
    });

    it('updates state across pending, fulfilled, and rejected cases', () => {
      let state = rolesReducer(
        initialRolesState,
        fetchPermissionsCatalogue.pending('req-1', undefined)
      );
      expect(state.isPermissionsLoading).toBe(true);

      const mockCatalogue = [
        {
          moduleKey: 'users',
          moduleName: 'User Management',
          description: 'Manage users',
          permissions: [],
        },
      ];
      state = rolesReducer(
        state,
        fetchPermissionsCatalogue.fulfilled(mockCatalogue, 'req-1', undefined)
      );
      expect(state.isPermissionsLoading).toBe(false);
      expect(state.permissionsCatalogue).toEqual(mockCatalogue);

      state = rolesReducer(
        state,
        fetchPermissionsCatalogue.rejected(new Error('Failed'), 'req-2', undefined)
      );
      expect(state.isPermissionsLoading).toBe(false);
    });
  });

  describe('fetchRoles thunk', () => {
    it('returns cached data if cache is still valid within TTL', async () => {
      const cachedTime = Date.now();
      const dispatch = jest.fn();
      const getState = () => ({
        roles: {
          ...initialRolesState,
          cachedPages: {
            '1-10---': {
              data: [mockRoleRecord],
              pagination: mockPagination,
              timestamp: cachedTime,
            },
          },
        },
      });

      const thunk = fetchRoles({ page: 1 });
      const result = await thunk(dispatch, getState, undefined);

      expect(rolesService.getRoles).not.toHaveBeenCalled();
      expect((result.payload as { fromCache: boolean }).fromCache).toBe(true);
    });

    it('calls service when cache is expired or forceRefresh is true', async () => {
      (rolesService.getRoles as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockRoleRecord],
        pagination: mockPagination,
      });

      const dispatch = jest.fn();
      const getState = () => ({ roles: initialRolesState });

      const thunk = fetchRoles({ page: 1, forceRefresh: true });
      const result = await thunk(dispatch, getState, undefined);

      expect(rolesService.getRoles).toHaveBeenCalled();
      expect((result.payload as { fromCache: boolean }).fromCache).toBe(false);
      expect((result.payload as { data: (typeof mockRoleRecord)[] }).data).toEqual([
        mockRoleRecord,
      ]);
    });

    it('handles fetchRoles extraReducers correctly', () => {
      let state = rolesReducer(
        initialRolesState,
        fetchRoles.pending('req-1', { page: 1, search: 'Test' })
      );
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      state = rolesReducer(
        state,
        fetchRoles.fulfilled(
          {
            data: [mockRoleRecord],
            pagination: mockPagination,
            cacheKey: '1-10-Test--',
            fromCache: false,
          },
          'req-1',
          { page: 1, search: 'Test', roleType: 'Admin', status: 'Active' }
        )
      );
      expect(state.isLoading).toBe(false);
      expect(state.search).toBe('Test');
      expect(state.filters.roleType).toBe('Admin');
      expect(state.filters.status).toBe('Active');
      expect(state.cachedPages['1-10-Test--']).toBeDefined();

      state = rolesReducer(
        state,
        fetchRoles.rejected(null, 'req-2', undefined, 'Failed to fetch roles')
      );
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch roles');
    });
  });

  describe('CRUD thunks', () => {
    it('handles createRoleThunk lifecycle', async () => {
      const payload = {
        roleName: 'Support',
        roleDescription: 'Support agent',
        roleType: 'User' as const,
        rolePermissions: ['tasks.view'],
        status: 'Active' as const,
      };
      (rolesService.createRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { _id: 'sup-1', ...payload },
      });

      const dispatch = jest.fn();
      const getState = () => ({ roles: initialRolesState });

      const thunk = createRoleThunk(payload);
      const result = await thunk(dispatch, getState, undefined);
      expect(result.type).toBe('roles/createRole/fulfilled');

      let state = rolesReducer(initialRolesState, createRoleThunk.pending('req-1', payload));
      expect(state.isActionLoading).toBe(true);

      state = rolesReducer(
        {
          ...state,
          cachedPages: { '1-10---': { data: [], pagination: mockPagination, timestamp: 1 } },
        },
        createRoleThunk.fulfilled(mockRoleRecord, 'req-1', payload)
      );
      expect(state.isActionLoading).toBe(false);
      expect(state.cachedPages).toEqual({}); // cache invalidated

      state = rolesReducer(
        state,
        createRoleThunk.rejected(null, 'req-2', payload, 'Role name already exists')
      );
      expect(state.isActionLoading).toBe(false);
      expect(state.error).toBe('Role name already exists');
    });

    it('handles updateRoleThunk lifecycle', async () => {
      const payload = { id: 'rol-1', data: { roleName: 'Updated Admin' } };
      (rolesService.updateRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { ...mockRoleRecord, roleName: 'Updated Admin' },
      });

      const dispatch = jest.fn();
      const getState = () => ({ roles: initialRolesState });

      const thunk = updateRoleThunk(payload);
      const result = await thunk(dispatch, getState, undefined);
      expect(result.type).toBe('roles/updateRole/fulfilled');

      let state = rolesReducer(initialRolesState, updateRoleThunk.pending('req-1', payload));
      expect(state.isActionLoading).toBe(true);

      state = rolesReducer(state, updateRoleThunk.fulfilled(mockRoleRecord, 'req-1', payload));
      expect(state.isActionLoading).toBe(false);
      expect(state.cachedPages).toEqual({});

      state = rolesReducer(
        state,
        updateRoleThunk.rejected(null, 'req-2', payload, 'Update failed')
      );
      expect(state.isActionLoading).toBe(false);
      expect(state.error).toBe('Update failed');
    });

    it('handles deleteRoleThunk lifecycle', async () => {
      (rolesService.deleteRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Role deleted',
      });

      const dispatch = jest.fn();
      const getState = () => ({ roles: initialRolesState });

      const thunk = deleteRoleThunk('rol-1');
      const result = await thunk(dispatch, getState, undefined);
      expect(result.type).toBe('roles/deleteRole/fulfilled');

      let state = rolesReducer(initialRolesState, deleteRoleThunk.pending('req-1', 'rol-1'));
      expect(state.isActionLoading).toBe(true);

      state = rolesReducer(state, deleteRoleThunk.fulfilled('rol-1', 'req-1', 'rol-1'));
      expect(state.isActionLoading).toBe(false);
      expect(state.cachedPages).toEqual({});

      state = rolesReducer(
        state,
        deleteRoleThunk.rejected(null, 'req-2', 'rol-1', 'Cannot delete system role')
      );
      expect(state.isActionLoading).toBe(false);
      expect(state.error).toBe('Cannot delete system role');
    });
  });
});
