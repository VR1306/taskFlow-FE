import { ERROR_PAGES_CONSTANTS } from './errorPages';

describe('ERROR_PAGES_CONSTANTS', () => {
  it('exposes copy for the notFound, serverError, globalError and offline states', () => {
    expect(ERROR_PAGES_CONSTANTS.notFound.title).toBe('Page Not Found');
    expect(ERROR_PAGES_CONSTANTS.serverError.title).toBe('Something Went Wrong');
    expect(ERROR_PAGES_CONSTANTS.globalError.title).toBe('Application Crash Encountered');
    expect(ERROR_PAGES_CONSTANTS.offline.title).toBe('You Are Currently Offline');
  });

  it('exposes static empty-state copy', () => {
    expect(ERROR_PAGES_CONSTANTS.emptyState.noDataTitle).toBe('No Records Found');
    expect(ERROR_PAGES_CONSTANTS.emptyState.networkErrorTitle).toBe('Network Connectivity Error');
  });

  it('builds a search-specific empty-state description that includes the query', () => {
    const description = ERROR_PAGES_CONSTANTS.emptyState.noSearchDescription('project alpha');
    expect(description).toBe(
      'We couldn\'t find any results matching "project alpha". Try adjusting your keywords or filters.'
    );
  });
});
