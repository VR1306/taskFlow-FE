import uiReducer, {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  UiState,
} from './uiSlice';

describe('uiSlice Redux Reducer', () => {
  const initialUiState: UiState = {
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
  };

  it('handles initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialUiState);
  });

  it('handles toggleSidebar', () => {
    let state = uiReducer(initialUiState, toggleSidebar());
    expect(state.sidebarCollapsed).toBe(true);

    state = uiReducer(state, toggleSidebar());
    expect(state.sidebarCollapsed).toBe(false);
  });

  it('handles setSidebarCollapsed', () => {
    const state = uiReducer(initialUiState, setSidebarCollapsed(true));
    expect(state.sidebarCollapsed).toBe(true);
  });

  it('handles toggleMobileSidebar', () => {
    let state = uiReducer(initialUiState, toggleMobileSidebar());
    expect(state.mobileSidebarOpen).toBe(true);

    state = uiReducer(state, toggleMobileSidebar());
    expect(state.mobileSidebarOpen).toBe(false);
  });

  it('handles setMobileSidebarOpen', () => {
    const state = uiReducer(initialUiState, setMobileSidebarOpen(true));
    expect(state.mobileSidebarOpen).toBe(true);
  });
});
