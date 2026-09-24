import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Project,
  ProjectMember,
  ProjectsFilter,
  ProjectsResponse,
  ProjectResponse,
  ProjectMemberCandidatesResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
} from '@/types';
import { projectsService } from '@/services';

export interface ProjectPaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CachedProjectPageData {
  data: Project[];
  pagination: ProjectPaginationInfo;
  timestamp: number;
}

export interface ProjectsState {
  cachedPages: Record<string, CachedProjectPageData>;
  memberCandidates: ProjectMember[];
  currentPage: number;
  limit: number;
  search: string;
  filters: ProjectsFilter;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isMemberCandidatesLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  ttlMs: number;
  // Archived projects live in their own section on the page, with their own pagination —
  // deliberately not sharing currentPage/limit/totalItems above (those always describe
  // the active-projects section) and not sharing cachedPages' TTL cache (fetched fresh
  // on every load/refresh, same as fetchProjects without the cache).
  archivedItems: Project[];
  archivedTotalItems: number;
  archivedTotalPages: number;
  archivedCurrentPage: number;
  archivedLimit: number;
  isArchivedLoading: boolean;
  archivedError: string | null;
}

const initialState: ProjectsState = {
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
  ttlMs: 120000, // 2 minutes TTL
  archivedItems: [],
  archivedTotalItems: 0,
  archivedTotalPages: 1,
  archivedCurrentPage: 1,
  archivedLimit: 12,
  isArchivedLoading: false,
  archivedError: null,
};

export const fetchMemberCandidates = createAsyncThunk<
  ProjectMember[],
  void,
  { state: { projects: ProjectsState } }
>('projects/fetchMemberCandidates', async (_, { getState, rejectWithValue }) => {
  const existing = getState().projects.memberCandidates;
  if (existing.length > 0) {
    return existing;
  }
  try {
    const response: ProjectMemberCandidatesResponse = await projectsService.getMemberCandidates();
    return response.data || [];
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve eligible members.';
    return rejectWithValue(message);
  }
});

export const fetchProjects = createAsyncThunk<
  {
    data: Project[];
    pagination: ProjectPaginationInfo;
    cacheKey: string;
    fromCache: boolean;
  },
  {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    forceRefresh?: boolean;
  } | void,
  { state: { projects: ProjectsState } }
>('projects/fetchProjects', async (params, { getState, rejectWithValue }) => {
  const state = getState().projects;
  const page = params?.page ?? state.currentPage;
  const limit = params?.limit ?? state.limit;
  const search = params?.search !== undefined ? params.search.trim() : state.search;
  const status = params?.status ?? state.filters.status ?? '';
  const cacheKey = `${page}-${limit}-${search}-${status}`;
  const cached = state.cachedPages[cacheKey];

  const isCacheValid = cached && Date.now() - cached.timestamp < state.ttlMs;

  if (!params?.forceRefresh && isCacheValid) {
    return { data: cached.data, pagination: cached.pagination, cacheKey, fromCache: true };
  }

  try {
    const response: ProjectsResponse = await projectsService.getProjects({
      page,
      limit,
      search,
      status,
    });

    const pagination: ProjectPaginationInfo = {
      totalItems: response.pagination?.totalItems ?? response.data.length,
      totalPages: response.pagination?.totalPages ?? (Math.ceil(response.data.length / limit) || 1),
      currentPage: response.pagination?.currentPage ?? page,
      limit: response.pagination?.limit ?? limit,
      hasNextPage: Boolean(response.pagination?.hasNextPage),
      hasPrevPage: Boolean(response.pagination?.hasPrevPage),
    };

    return { data: response.data, pagination, cacheKey, fromCache: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects from server.';
    return rejectWithValue(message);
  }
});

/**
 * Fetches the archived-projects section shown separately on the projects page. Always
 * fetched fresh (no TTL cache like fetchProjects above) since it's opened far less often
 * than the main active list.
 */
export const fetchArchivedProjects = createAsyncThunk<
  { data: Project[]; pagination: ProjectPaginationInfo },
  { page?: number; limit?: number; search?: string; forceRefresh?: boolean } | void,
  { state: { projects: ProjectsState } }
>('projects/fetchArchivedProjects', async (params, { getState, rejectWithValue }) => {
  const state = getState().projects;
  const page = params?.page ?? state.archivedCurrentPage;
  const limit = params?.limit ?? state.archivedLimit;
  const search = params?.search !== undefined ? params.search.trim() : state.search;

  try {
    const response: ProjectsResponse = await projectsService.getProjects({
      page,
      limit,
      search,
      status: 'archived',
    });

    const pagination: ProjectPaginationInfo = {
      totalItems: response.pagination?.totalItems ?? response.data.length,
      totalPages: response.pagination?.totalPages ?? (Math.ceil(response.data.length / limit) || 1),
      currentPage: response.pagination?.currentPage ?? page,
      limit: response.pagination?.limit ?? limit,
      hasNextPage: Boolean(response.pagination?.hasNextPage),
      hasPrevPage: Boolean(response.pagination?.hasPrevPage),
    };

    return { data: response.data, pagination };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch archived projects.';
    return rejectWithValue(message);
  }
});

export const createProjectThunk = createAsyncThunk<
  Project,
  CreateProjectPayload,
  { rejectValue: string }
>('projects/createProject', async (payload, { rejectWithValue }) => {
  try {
    const response: ProjectResponse = await projectsService.createProject(payload);
    return response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create project.';
    return rejectWithValue(message);
  }
});

export const updateProjectThunk = createAsyncThunk<
  Project,
  { id: string; data: UpdateProjectPayload },
  { rejectValue: string }
>('projects/updateProject', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response: ProjectResponse = await projectsService.updateProject(id, data);
    return response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update project.';
    return rejectWithValue(message);
  }
});

export const deleteProjectThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await projectsService.deleteProject(id);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project.';
      return rejectWithValue(message);
    }
  }
);

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.currentPage = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<ProjectsFilter['status']>) => {
      state.filters.status = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    invalidateProjectsCache: (state) => {
      state.cachedPages = {};
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
    setArchivedCurrentPage: (state, action: PayloadAction<number>) => {
      state.archivedCurrentPage = action.payload;
    },
    setArchivedLimit: (state, action: PayloadAction<number>) => {
      state.archivedLimit = action.payload;
      state.archivedCurrentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberCandidates.pending, (state) => {
        state.isMemberCandidatesLoading = true;
      })
      .addCase(fetchMemberCandidates.fulfilled, (state, action) => {
        state.isMemberCandidatesLoading = false;
        state.memberCandidates = action.payload;
      })
      .addCase(fetchMemberCandidates.rejected, (state) => {
        state.isMemberCandidatesLoading = false;
      })

      .addCase(fetchProjects.pending, (state, action) => {
        const page = action.meta.arg?.page ?? state.currentPage;
        const limit = action.meta.arg?.limit ?? state.limit;
        const search =
          action.meta.arg?.search !== undefined ? action.meta.arg.search.trim() : state.search;
        const status = action.meta.arg?.status ?? state.filters.status ?? '';
        const cacheKey = `${page}-${limit}-${search}-${status}`;
        const cached = state.cachedPages[cacheKey];
        const isCacheValid = cached && Date.now() - cached.timestamp < state.ttlMs;

        state.isLoading = !(!action.meta.arg?.forceRefresh && isCacheValid);
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalItems = action.payload.pagination.totalItems;
        state.totalPages = action.payload.pagination.totalPages;
        state.currentPage = action.payload.pagination.currentPage;
        state.limit = action.payload.pagination.limit;

        if (action.meta.arg?.search !== undefined) {
          state.search = action.meta.arg.search.trim();
        }
        if (action.meta.arg?.status !== undefined) {
          state.filters.status = (action.meta.arg.status || undefined) as ProjectsFilter['status'];
        }

        if (!action.payload.fromCache) {
          state.cachedPages[action.payload.cacheKey] = {
            data: action.payload.data,
            pagination: action.payload.pagination,
            timestamp: Date.now(),
          };
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch projects';
      })

      .addCase(fetchArchivedProjects.pending, (state) => {
        state.isArchivedLoading = true;
        state.archivedError = null;
      })
      .addCase(fetchArchivedProjects.fulfilled, (state, action) => {
        state.isArchivedLoading = false;
        state.archivedItems = action.payload.data;
        state.archivedTotalItems = action.payload.pagination.totalItems;
        state.archivedTotalPages = action.payload.pagination.totalPages;
        state.archivedCurrentPage = action.payload.pagination.currentPage;
        state.archivedLimit = action.payload.pagination.limit;
      })
      .addCase(fetchArchivedProjects.rejected, (state, action) => {
        state.isArchivedLoading = false;
        state.archivedError = (action.payload as string) || 'Failed to fetch archived projects';
      })

      .addCase(createProjectThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createProjectThunk.fulfilled, (state) => {
        state.isActionLoading = false;
        state.cachedPages = {};
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to create project';
      })

      .addCase(updateProjectThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateProjectThunk.fulfilled, (state) => {
        state.isActionLoading = false;
        state.cachedPages = {};
      })
      .addCase(updateProjectThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to update project';
      })

      .addCase(deleteProjectThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteProjectThunk.fulfilled, (state) => {
        state.isActionLoading = false;
        state.cachedPages = {};
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to delete project';
      });
  },
});

export const {
  setCurrentPage: setProjectCurrentPage,
  setLimit: setProjectLimit,
  setSearch: setProjectSearch,
  setStatusFilter: setProjectStatusFilter,
  clearFilters: clearProjectFilters,
  invalidateProjectsCache,
  clearProjectsError,
  setArchivedCurrentPage: setArchivedProjectCurrentPage,
  setArchivedLimit: setArchivedProjectLimit,
} = projectsSlice.actions;

export default projectsSlice.reducer;
