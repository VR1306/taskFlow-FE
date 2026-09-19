import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RoleRecord,
  RoleFilters,
  PermissionModule,
  CreateRolePayload,
  UpdateRolePayload,
  RolesApiResponse,
  PermissionsCatalogueApiResponse,
  SingleRoleApiResponse,
} from '@/types';
import { rolesService } from '@/services';

export interface RolePaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CachedRolePageData {
  data: RoleRecord[];
  pagination: RolePaginationInfo;
  timestamp: number;
}

export interface RolesState {
  cachedPages: Record<string, CachedRolePageData>;
  permissionsCatalogue: PermissionModule[];
  currentPage: number;
  limit: number;
  search: string;
  filters: RoleFilters;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isPermissionsLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  ttlMs: number;
}

const initialState: RolesState = {
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
  ttlMs: 120000, // 2 minutes TTL
};

export const fetchPermissionsCatalogue = createAsyncThunk<
  PermissionModule[],
  void,
  { state: { roles: RolesState } }
>('roles/fetchPermissionsCatalogue', async (_, { getState, rejectWithValue }) => {
  const existing = getState().roles.permissionsCatalogue;
  if (existing.length > 0) {
    return existing;
  }

  try {
    const response: PermissionsCatalogueApiResponse = await rolesService.getPermissionsCatalogue();
    return response.data || [];
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to retrieve permissions catalogue.';
    return rejectWithValue(message);
  }
});

export const fetchRoles = createAsyncThunk<
  {
    data: RoleRecord[];
    pagination: RolePaginationInfo;
    cacheKey: string;
    fromCache: boolean;
  },
  {
    page?: number;
    limit?: number;
    search?: string;
    roleType?: string;
    status?: string;
    forceRefresh?: boolean;
  } | void,
  { state: { roles: RolesState } }
>('roles/fetchRoles', async (params, { getState, rejectWithValue }) => {
  const state = getState().roles;
  const page = params?.page ?? state.currentPage;
  const limit = params?.limit ?? state.limit;
  const search = params?.search !== undefined ? params.search.trim() : state.search;
  const roleType = params?.roleType ?? state.filters.roleType ?? '';
  const status = params?.status ?? state.filters.status ?? '';
  const cacheKey = `${page}-${limit}-${search}-${roleType}-${status}`;
  const cached = state.cachedPages[cacheKey];

  const isCacheValid = cached && Date.now() - cached.timestamp < state.ttlMs;

  if (!params?.forceRefresh && isCacheValid) {
    return {
      data: cached.data,
      pagination: cached.pagination,
      cacheKey,
      fromCache: true,
    };
  }

  try {
    const response: RolesApiResponse = await rolesService.getRoles({
      page,
      limit,
      search,
      roleType,
      status,
    });

    const pagination: RolePaginationInfo = {
      totalItems: response.pagination?.totalItems ?? response.data.length,
      totalPages: response.pagination?.totalPages ?? (Math.ceil(response.data.length / limit) || 1),
      currentPage: response.pagination?.currentPage ?? page,
      limit: response.pagination?.limit ?? limit,
      hasNextPage: Boolean(response.pagination?.hasNextPage),
      hasPrevPage: Boolean(response.pagination?.hasPrevPage),
    };

    return {
      data: response.data,
      pagination,
      cacheKey,
      fromCache: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch roles from server.';
    return rejectWithValue(message);
  }
});

export const createRoleThunk = createAsyncThunk<
  RoleRecord,
  CreateRolePayload,
  { rejectValue: string }
>('roles/createRole', async (payload, { rejectWithValue }) => {
  try {
    const response: SingleRoleApiResponse = await rolesService.createRole(payload);
    return response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create role.';
    return rejectWithValue(message);
  }
});

export const updateRoleThunk = createAsyncThunk<
  RoleRecord,
  { id: string; data: UpdateRolePayload },
  { rejectValue: string }
>('roles/updateRole', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response: SingleRoleApiResponse = await rolesService.updateRole(id, data);
    return response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update role.';
    return rejectWithValue(message);
  }
});

export const deleteRoleThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'roles/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await rolesService.deleteRole(id);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete role.';
      return rejectWithValue(message);
    }
  }
);

export const rolesSlice = createSlice({
  name: 'roles',
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
    setFilters: (state, action: PayloadAction<RoleFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setFilterField: (
      state,
      action: PayloadAction<{ field: keyof RoleFilters; value: string | undefined }>
    ) => {
      state.filters[action.payload.field] = action.payload.value;
      state.currentPage = 1;
    },
    invalidateRolesCache: (state) => {
      state.cachedPages = {};
    },
    clearRolesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPermissionsCatalogue
      .addCase(fetchPermissionsCatalogue.pending, (state) => {
        state.isPermissionsLoading = true;
      })
      .addCase(fetchPermissionsCatalogue.fulfilled, (state, action) => {
        state.isPermissionsLoading = false;
        state.permissionsCatalogue = action.payload;
      })
      .addCase(fetchPermissionsCatalogue.rejected, (state) => {
        state.isPermissionsLoading = false;
      })

      // fetchRoles
      .addCase(fetchRoles.pending, (state, action) => {
        const page = action.meta.arg?.page ?? state.currentPage;
        const limit = action.meta.arg?.limit ?? state.limit;
        const search =
          action.meta.arg?.search !== undefined ? action.meta.arg.search.trim() : state.search;
        const roleType = action.meta.arg?.roleType ?? state.filters.roleType ?? '';
        const status = action.meta.arg?.status ?? state.filters.status ?? '';
        const cacheKey = `${page}-${limit}-${search}-${roleType}-${status}`;
        const cached = state.cachedPages[cacheKey];
        const isCacheValid = cached && Date.now() - cached.timestamp < state.ttlMs;

        if (!action.meta.arg?.forceRefresh && isCacheValid) {
          state.isLoading = false;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalItems = action.payload.pagination.totalItems;
        state.totalPages = action.payload.pagination.totalPages;
        state.currentPage = action.payload.pagination.currentPage;
        state.limit = action.payload.pagination.limit;

        if (action.meta.arg?.search !== undefined) {
          state.search = action.meta.arg.search.trim();
        }
        if (action.meta.arg?.roleType !== undefined) {
          state.filters.roleType = action.meta.arg.roleType || undefined;
        }
        if (action.meta.arg?.status !== undefined) {
          state.filters.status = action.meta.arg.status || undefined;
        }

        if (!action.payload.fromCache) {
          state.cachedPages[action.payload.cacheKey] = {
            data: action.payload.data,
            pagination: action.payload.pagination,
            timestamp: Date.now(),
          };
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch roles';
      })

      // createRoleThunk
      .addCase(createRoleThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createRoleThunk.fulfilled, (state) => {
        state.isActionLoading = false;
        state.cachedPages = {}; // Invalidate cache on modification
      })
      .addCase(createRoleThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to create role';
      })

      // updateRoleThunk
      .addCase(updateRoleThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateRoleThunk.fulfilled, (state) => {
        state.isActionLoading = false;
        state.cachedPages = {}; // Invalidate cache on update
      })
      .addCase(updateRoleThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to update role';
      })

      // deleteRoleThunk
      .addCase(deleteRoleThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteRoleThunk.fulfilled, (state) => {
        state.isActionLoading = false;
        state.cachedPages = {}; // Invalidate cache on deletion
      })
      .addCase(deleteRoleThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to delete role';
      });
  },
});

export const {
  setCurrentPage: setRolesCurrentPage,
  setLimit: setRolesLimit,
  setSearch: setRolesSearch,
  setFilters: setRolesFilters,
  clearFilters: clearRolesFilters,
  setFilterField: setRolesFilterField,
  invalidateRolesCache,
  clearRolesError,
} = rolesSlice.actions;

export default rolesSlice.reducer;
