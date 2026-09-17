import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/services/api';

export interface UserRecord {
  _id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersApiResponse {
  success: boolean;
  pagination?: PaginationInfo;
  data: UserRecord[];
}

export interface CachedPageData {
  data: UserRecord[];
  pagination: PaginationInfo;
  timestamp: number;
}

export interface UsersState {
  cachedPages: Record<string, CachedPageData>;
  currentPage: number;
  limit: number;
  search: string;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  ttlMs: number;
}

const initialState: UsersState = {
  cachedPages: {},
  currentPage: 1,
  limit: 10,
  search: '',
  totalItems: 0,
  totalPages: 1,
  isLoading: false,
  isActionLoading: false,
  error: null,
  ttlMs: 120000, // 2 minutes cache TTL to avoid unnecessary API calls
};

export const fetchUsers = createAsyncThunk<
  { data: UserRecord[]; pagination: PaginationInfo; cacheKey: string; fromCache: boolean },
  { page?: number; limit?: number; search?: string; forceRefresh?: boolean } | void,
  { state: { users: UsersState } }
>('users/fetchUsers', async (params, { getState, rejectWithValue }) => {
  const state = getState().users;
  const page = params?.page ?? state.currentPage;
  const limit = params?.limit ?? state.limit;
  const search = params?.search !== undefined ? params.search.trim() : state.search;
  const cacheKey = `${page}-${limit}-${search}`;
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
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const response = await apiClient.get<UsersApiResponse>(
      `/users/getAllUsers?page=${page}&limit=${limit}${searchParam}`
    );

    const fallbackPagination: PaginationInfo = {
      totalItems: response.data?.length ?? 0,
      totalPages: Math.ceil((response.data?.length ?? 0) / limit) || 1,
      currentPage: page,
      limit,
      hasNextPage: false,
      hasPrevPage: page > 1,
    };

    return {
      data: response.data || [],
      pagination: response.pagination || fallbackPagination,
      cacheKey,
      fromCache: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users list';
    return rejectWithValue(message);
  }
});

export const createUserThunk = createAsyncThunk<
  void,
  { firstName: string; lastName: string; email: string; role: string },
  { state: { users: UsersState } }
>('users/createUser', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post('/users/createUser', payload);
    dispatch(usersSlice.actions.invalidateUsersCache());
    dispatch(fetchUsers({ page: 1, forceRefresh: true }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    return rejectWithValue(message);
  }
});

export const updateUserThunk = createAsyncThunk<
  void,
  { id: string; firstName?: string; lastName?: string; role?: string; email?: string },
  { state: { users: UsersState } }
>('users/updateUser', async ({ id, ...payload }, { getState, dispatch, rejectWithValue }) => {
  try {
    await apiClient.put(`/users/updateUser/${id}`, payload);
    const currentPage = getState().users.currentPage;
    dispatch(usersSlice.actions.invalidateUsersCache());
    dispatch(fetchUsers({ page: currentPage, forceRefresh: true }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return rejectWithValue(message);
  }
});

export const deleteUserThunk = createAsyncThunk<void, string, { state: { users: UsersState } }>(
  'users/deleteUser',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/deleteUser/${id}`);
      const currentPage = getState().users.currentPage;
      dispatch(usersSlice.actions.invalidateUsersCache());
      dispatch(fetchUsers({ page: currentPage, forceRefresh: true }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      return rejectWithValue(message);
    }
  }
);

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = Math.max(1, action.payload);
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.currentPage = 1; // reset to page 1 on limit change
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1; // reset to page 1 on search change
    },
    invalidateUsersCache: (state) => {
      state.cachedPages = {};
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        const page = action.meta.arg?.page ?? state.currentPage;
        const limit = action.meta.arg?.limit ?? state.limit;
        const search =
          action.meta.arg?.search !== undefined ? action.meta.arg.search.trim() : state.search;
        const cacheKey = `${page}-${limit}-${search}`;
        const cached = state.cachedPages[cacheKey];
        const isCacheValid = cached && Date.now() - cached.timestamp < state.ttlMs;

        if (!action.meta.arg?.forceRefresh && isCacheValid) {
          state.isLoading = false;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPage = action.payload.pagination.currentPage;
        state.limit = action.payload.pagination.limit;
        state.totalItems = action.payload.pagination.totalItems;
        state.totalPages = action.payload.pagination.totalPages;

        if (action.meta.arg?.search !== undefined) {
          state.search = action.meta.arg.search.trim();
        }

        if (!action.payload.fromCache) {
          state.cachedPages[action.payload.cacheKey] = {
            data: action.payload.data,
            pagination: action.payload.pagination,
            timestamp: Date.now(),
          };
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch users';
      })
      // Action thunks
      .addCase(createUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to create user';
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to update user';
      })
      .addCase(deleteUserThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to delete user';
      });
  },
});

export const { setCurrentPage, setLimit, setSearch, invalidateUsersCache, clearUsersError } =
  usersSlice.actions;

export default usersSlice.reducer;
