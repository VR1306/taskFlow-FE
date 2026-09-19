import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/dashboard';
import { DashboardStats } from '@/types';

export interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (isRefresh: boolean | undefined = false, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats();
      if (!response?.success || !response?.data) {
        return rejectWithValue(response?.message || 'Failed to fetch dashboard statistics.');
      }
      return { stats: response.data, isRefresh };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard statistics.';
      return rejectWithValue(message);
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state, action) => {
        const isRefresh = action.meta.arg === true;
        if (isRefresh) {
          state.isRefreshing = true;
        } else if (!state.stats) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.stats = action.payload.stats;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = (action.payload as string) || 'Failed to load dashboard data.';
      });
  },
});

export const { clearDashboardError, resetDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
