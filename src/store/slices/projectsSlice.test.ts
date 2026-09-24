import projectsReducer, {
  setProjectCurrentPage,
  setProjectLimit,
  setProjectSearch,
  setProjectStatusFilter,
  clearProjectFilters,
  invalidateProjectsCache,
  clearProjectsError,
  fetchProjects,
  fetchMemberCandidates,
  createProjectThunk,
  updateProjectThunk,
  deleteProjectThunk,
  ProjectsState,
} from './projectsSlice';
import { projectsService } from '@/services';

jest.mock('@/services');

describe('projectsSlice Redux Reducer & Async Thunks', () => {
  const initialProjectsState: ProjectsState = {
    cachedPages: {},
    memberCandidates: [],
    currentPage: 1,
    limit: 12,
    search: '',
    filters: {},
    totalItems: 0,
    totalPages: 1,
    isLoading: false,
    isMemberCandidatesLoading: false,
    isActionLoading: false,
    error: null,
    ttlMs: 120000,
  };

  const mockProject = {
    _id: 'proj-1',
    projectId: 'PRJ0001',
    key: 'ENG',
    name: 'Engineering',
    status: 'active' as const,
  };

  const mockPagination = {
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(projectsReducer(undefined, { type: 'unknown' })).toEqual(initialProjectsState);
  });

  describe('synchronous reducers', () => {
    it('handles setProjectCurrentPage', () => {
      const state = projectsReducer(initialProjectsState, setProjectCurrentPage(3));
      expect(state.currentPage).toBe(3);
    });

    it('handles setProjectLimit and resets to page 1', () => {
      const state = projectsReducer(
        { ...initialProjectsState, currentPage: 5 },
        setProjectLimit(24)
      );
      expect(state.limit).toBe(24);
      expect(state.currentPage).toBe(1);
    });

    it('handles setProjectSearch and resets to page 1', () => {
      const state = projectsReducer(
        { ...initialProjectsState, currentPage: 2 },
        setProjectSearch('Eng')
      );
      expect(state.search).toBe('Eng');
      expect(state.currentPage).toBe(1);
    });

    it('handles setProjectStatusFilter', () => {
      const state = projectsReducer(initialProjectsState, setProjectStatusFilter('archived'));
      expect(state.filters.status).toBe('archived');
      expect(state.currentPage).toBe(1);
    });

    it('handles clearProjectFilters', () => {
      const populated = { ...initialProjectsState, filters: { status: 'archived' as const } };
      const state = projectsReducer(populated, clearProjectFilters());
      expect(state.filters).toEqual({});
    });

    it('handles invalidateProjectsCache', () => {
      const populated = {
        ...initialProjectsState,
        cachedPages: { '1-12--': { data: [], pagination: mockPagination, timestamp: Date.now() } },
      };
      const state = projectsReducer(populated, invalidateProjectsCache());
      expect(state.cachedPages).toEqual({});
    });

    it('handles clearProjectsError', () => {
      const populated = { ...initialProjectsState, error: 'boom' };
      const state = projectsReducer(populated, clearProjectsError());
      expect(state.error).toBeNull();
    });
  });

  describe('fetchProjects thunk', () => {
    it('fetches and caches a page of projects', async () => {
      (projectsService.getProjects as jest.Mock).mockResolvedValue({
        success: true,
        pagination: mockPagination,
        data: [mockProject],
      });

      const dispatch = jest.fn();
      const getState = () => ({ projects: initialProjectsState });
      const thunk = fetchProjects({ page: 1, limit: 12 });
      const result = await thunk(dispatch, getState, undefined);

      expect(result.payload).toEqual(
        expect.objectContaining({ data: [mockProject], fromCache: false })
      );
    });

    it('trims an explicitly provided search term and fills in missing pagination fields', async () => {
      (projectsService.getProjects as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockProject, mockProject],
        // pagination intentionally omitted to exercise the fallback computations
      });

      const dispatch = jest.fn();
      const getState = () => ({ projects: initialProjectsState });
      const thunk = fetchProjects({ page: 2, limit: 2, search: '  eng  ' });
      const result = await thunk(dispatch, getState, undefined);

      expect(projectsService.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 2, search: 'eng' })
      );
      expect(result.payload).toEqual(
        expect.objectContaining({
          pagination: {
            totalItems: 2,
            totalPages: 1,
            currentPage: 2,
            limit: 2,
            hasNextPage: false,
            hasPrevPage: false,
          },
        })
      );
    });

    it('defaults totalPages to 1 when there is no pagination and no data', async () => {
      (projectsService.getProjects as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const dispatch = jest.fn();
      const getState = () => ({ projects: initialProjectsState });
      const thunk = fetchProjects({ page: 1, limit: 12 });
      const result = await thunk(dispatch, getState, undefined);

      expect(result.payload).toEqual(
        expect.objectContaining({
          pagination: expect.objectContaining({ totalItems: 0, totalPages: 1 }),
        })
      );
    });

    it('serves from cache within TTL without calling the service', async () => {
      const cacheKey = '1-12--';
      const cachedState: ProjectsState = {
        ...initialProjectsState,
        cachedPages: {
          [cacheKey]: { data: [mockProject], pagination: mockPagination, timestamp: Date.now() },
        },
      };

      const dispatch = jest.fn();
      const getState = () => ({ projects: cachedState });
      const thunk = fetchProjects({ page: 1, limit: 12 });
      const result = await thunk(dispatch, getState, undefined);

      expect(projectsService.getProjects).not.toHaveBeenCalled();
      expect((result.payload as { fromCache: boolean }).fromCache).toBe(true);
    });

    it('handles fetchProjects rejection', async () => {
      (projectsService.getProjects as jest.Mock).mockRejectedValue(new Error('Network down'));

      const state = projectsReducer(
        initialProjectsState,
        fetchProjects.rejected(new Error('Network down'), 'req-1', undefined, 'Network down')
      );
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network down');
    });

    it('handles fetchProjects.pending by setting isLoading based on cache validity', () => {
      const state = projectsReducer(
        initialProjectsState,
        fetchProjects.pending('req-1', { page: 1, limit: 12, search: '  eng  ', status: 'active' })
      );
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles fetchProjects.pending using defaults when no arg is provided', () => {
      const state = projectsReducer(
        { ...initialProjectsState, error: 'stale error' },
        fetchProjects.pending('req-1', undefined)
      );
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles fetchProjects.pending by skipping loading when a valid cache entry exists and forceRefresh is not set', () => {
      const cacheKey = '1-12--';
      const cachedState: ProjectsState = {
        ...initialProjectsState,
        cachedPages: {
          [cacheKey]: { data: [mockProject], pagination: mockPagination, timestamp: Date.now() },
        },
      };
      const state = projectsReducer(
        cachedState,
        fetchProjects.pending('req-1', { page: 1, limit: 12 })
      );
      expect(state.isLoading).toBe(false);
    });

    it('handles fetchProjects.fulfilled by updating search/status filters and caching a fresh page', () => {
      const payload = {
        data: [mockProject],
        pagination: mockPagination,
        cacheKey: '1-12-eng-active',
        fromCache: false,
      };
      const state = projectsReducer(
        { ...initialProjectsState, isLoading: true },
        fetchProjects.fulfilled(payload, 'req-1', {
          page: 1,
          limit: 12,
          search: '  eng  ',
          status: 'active',
        })
      );
      expect(state.isLoading).toBe(false);
      expect(state.totalItems).toBe(mockPagination.totalItems);
      expect(state.totalPages).toBe(mockPagination.totalPages);
      expect(state.currentPage).toBe(mockPagination.currentPage);
      expect(state.limit).toBe(mockPagination.limit);
      expect(state.search).toBe('eng');
      expect(state.filters.status).toBe('active');
      expect(state.cachedPages['1-12-eng-active']).toEqual(
        expect.objectContaining({ data: [mockProject], pagination: mockPagination })
      );
    });

    it('handles fetchProjects.fulfilled from cache without mutating search/status or re-caching', () => {
      const payload = {
        data: [mockProject],
        pagination: mockPagination,
        cacheKey: '1-12--',
        fromCache: true,
      };
      const state = projectsReducer(
        { ...initialProjectsState, isLoading: true, search: 'kept', filters: {} },
        fetchProjects.fulfilled(payload, 'req-1', undefined)
      );
      expect(state.isLoading).toBe(false);
      expect(state.search).toBe('kept');
      expect(state.filters.status).toBeUndefined();
      expect(state.cachedPages).toEqual({});
    });

    it('clears the status filter when fetchProjects.fulfilled receives an empty status', () => {
      const payload = {
        data: [mockProject],
        pagination: mockPagination,
        cacheKey: '1-12--',
        fromCache: false,
      };
      const state = projectsReducer(
        { ...initialProjectsState, filters: { status: 'archived' as const } },
        fetchProjects.fulfilled(payload, 'req-1', { status: '' })
      );
      expect(state.filters.status).toBeUndefined();
    });
  });

  describe('fetchMemberCandidates thunk', () => {
    it('fetches candidates when none are cached', async () => {
      (projectsService.getMemberCandidates as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ _id: 'u1', firstName: 'Alice' }],
      });

      const dispatch = jest.fn();
      const getState = () => ({ projects: initialProjectsState });
      const thunk = fetchMemberCandidates();
      const result = await thunk(dispatch, getState, undefined);

      expect(result.payload).toEqual([{ _id: 'u1', firstName: 'Alice' }]);
    });

    it('defaults to an empty array when the service returns no data', async () => {
      (projectsService.getMemberCandidates as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });

      const dispatch = jest.fn();
      const getState = () => ({ projects: initialProjectsState });
      const thunk = fetchMemberCandidates();
      const result = await thunk(dispatch, getState, undefined);

      expect(result.payload).toEqual([]);
    });

    it('returns cached candidates without calling the service', async () => {
      const populated = {
        ...initialProjectsState,
        memberCandidates: [{ _id: 'u1', firstName: 'Alice' }],
      };
      const dispatch = jest.fn();
      const getState = () => ({ projects: populated });
      const thunk = fetchMemberCandidates();
      await thunk(dispatch, getState, undefined);

      expect(projectsService.getMemberCandidates).not.toHaveBeenCalled();
    });

    it('handles fetchMemberCandidates.fulfilled reducer', () => {
      const candidates = [{ _id: 'u1', firstName: 'Alice' }];
      const state = projectsReducer(
        { ...initialProjectsState, isMemberCandidatesLoading: true },
        fetchMemberCandidates.fulfilled(candidates, 'req-1', undefined)
      );
      expect(state.isMemberCandidatesLoading).toBe(false);
      expect(state.memberCandidates).toEqual(candidates);
    });
  });

  describe('createProjectThunk', () => {
    it('calls the service and resolves with the created project', async () => {
      (projectsService.createProject as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProject,
      });

      const dispatch = jest.fn();
      const getState = () => ({ projects: initialProjectsState });
      const thunk = createProjectThunk({ name: 'Engineering' });
      const result = await thunk(dispatch, getState, undefined);

      expect(projectsService.createProject).toHaveBeenCalledWith({ name: 'Engineering' });
      expect(result.payload).toEqual(mockProject);
    });

    it('creates a project and invalidates the cache', () => {
      const populated = {
        ...initialProjectsState,
        cachedPages: { x: { data: [], pagination: mockPagination, timestamp: Date.now() } },
      };
      const state = projectsReducer(
        populated,
        createProjectThunk.fulfilled(mockProject, 'req-1', {
          name: 'Engineering',
        })
      );
      expect(state.cachedPages).toEqual({});
      expect(state.isActionLoading).toBe(false);
    });

    it('handles rejection', () => {
      const state = projectsReducer(
        initialProjectsState,
        createProjectThunk.rejected(new Error('fail'), 'req-1', { name: 'X' }, 'Duplicate name')
      );
      expect(state.error).toBe('Duplicate name');
    });
  });

  describe('updateProjectThunk', () => {
    it('invalidates the cache on success', () => {
      const populated = {
        ...initialProjectsState,
        cachedPages: { x: { data: [], pagination: mockPagination, timestamp: Date.now() } },
      };
      const state = projectsReducer(
        populated,
        updateProjectThunk.fulfilled(mockProject, 'req-1', { id: 'proj-1', data: {} })
      );
      expect(state.cachedPages).toEqual({});
    });
  });

  describe('deleteProjectThunk', () => {
    it('invalidates the cache on success', () => {
      const populated = {
        ...initialProjectsState,
        cachedPages: { x: { data: [], pagination: mockPagination, timestamp: Date.now() } },
      };
      const state = projectsReducer(
        populated,
        deleteProjectThunk.fulfilled('proj-1', 'req-1', 'proj-1')
      );
      expect(state.cachedPages).toEqual({});
    });

    it('handles rejection', () => {
      const state = projectsReducer(
        initialProjectsState,
        deleteProjectThunk.rejected(new Error('fail'), 'req-1', 'proj-1', 'Cannot delete project')
      );
      expect(state.error).toBe('Cannot delete project');
    });
  });
  const operations = [
    {
      run: () => fetchProjects(),
      service: projectsService.getProjects,
      fallback: 'Failed to fetch projects from server.',
    },
    {
      run: () => fetchMemberCandidates(),
      service: projectsService.getMemberCandidates,
      fallback: 'Failed to retrieve eligible members.',
    },
    {
      run: () => createProjectThunk({ name: 'New' }),
      service: projectsService.createProject,
      fallback: 'Failed to create project.',
    },
    {
      run: () => updateProjectThunk({ id: 'proj-1', data: { name: 'Updated' } }),
      service: projectsService.updateProject,
      fallback: 'Failed to update project.',
    },
    {
      run: () => deleteProjectThunk('proj-1'),
      service: projectsService.deleteProject,
      fallback: 'Failed to delete project.',
    },
  ];

  describe.each(operations)('$fallback', ({ run, service, fallback }) => {
    it.each([new Error('Offline'), null])('handles failed requests: %j', async (error) => {
      (service as jest.Mock).mockRejectedValue(error);
      const dispatch = jest.fn();
      const result = await run()(dispatch, () => ({ projects: initialProjectsState }), undefined);
      expect(result.payload).toBe(error instanceof Error ? 'Offline' : fallback);
      let state = initialProjectsState;
      for (const [action] of dispatch.mock.calls) state = projectsReducer(state, action);
      expect(state.isActionLoading).toBe(false);
      expect(state.isMemberCandidatesLoading).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  it('updates and deletes projects through the service', async () => {
    jest
      .mocked(projectsService.updateProject)
      .mockResolvedValue({ success: true, data: mockProject });
    jest
      .mocked(projectsService.deleteProject)
      .mockResolvedValue({ success: true, message: 'Deleted' });
    const updated = await updateProjectThunk({ id: 'proj-1', data: { name: 'Updated' } })(
      jest.fn(),
      jest.fn(),
      undefined
    );
    const deleted = await deleteProjectThunk('proj-1')(jest.fn(), jest.fn(), undefined);
    expect(updated.payload).toEqual(mockProject);
    expect(deleted.payload).toBe('proj-1');
    expect(projectsService.updateProject).toHaveBeenCalledWith('proj-1', { name: 'Updated' });
  });

  it.each([
    fetchProjects.rejected(null, 'request', undefined),
    createProjectThunk.rejected(null, 'request', { name: 'New' }),
    updateProjectThunk.rejected(null, 'request', { id: 'proj-1', data: {} }),
    deleteProjectThunk.rejected(null, 'request', 'proj-1'),
  ])('provides a fallback for $type', (action) => {
    expect(projectsReducer(initialProjectsState, action).error).toMatch(/^Failed to /);
  });

  it('resets action loading after deletion', () => {
    const state = projectsReducer(
      { ...initialProjectsState, isActionLoading: true },
      deleteProjectThunk.fulfilled('proj-1', 'request', 'proj-1')
    );
    expect(state.isActionLoading).toBe(false);
    expect(state.cachedPages).toEqual({});
  });
});
