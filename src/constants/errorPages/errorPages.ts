export const ERROR_PAGES_CONSTANTS = {
  // 404 Not Found Page
  notFound: {
    badge: 'Error 404',
    title: 'Page Not Found',
    description:
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    dashboardButtonText: 'Back to Dashboard',
    backButtonText: 'Go Back',
    usersButtonText: 'View Team Members',
  },

  // 500 / Runtime Error Page
  serverError: {
    badge: 'Application Error',
    title: 'Something Went Wrong',
    description:
      'An unexpected system error occurred while rendering this page. Our team has been notified.',
    retryButtonText: 'Try Again',
    dashboardButtonText: 'Return to Dashboard',
  },

  // Global Error Page
  globalError: {
    badge: 'Critical Error',
    title: 'Application Crash Encountered',
    description:
      'The root application encountered an unrecoverable error. Please reload the workspace.',
    reloadButtonText: 'Reload Application',
  },

  // Offline / Network Connectivity
  offline: {
    badge: 'No Internet Connection',
    title: 'You Are Currently Offline',
    description:
      'TaskFlow requires an active internet connection to sync workspace data and permissions.',
    checkingText: 'Checking network status...',
    retryButtonText: 'Check Connection',
    dashboardButtonText: 'Back to App',
    bannerText: 'You are offline. Reconnecting automatically when internet is available...',
    restoredText: 'Internet connection restored!',
  },

  // Empty State Defaults
  emptyState: {
    noDataTitle: 'No Records Found',
    noDataDescription: 'There are no items to display right now.',
    noSearchTitle: 'No Results Found',
    noSearchDescription: (query: string) =>
      `We couldn't find any results matching "${query}". Try adjusting your keywords or filters.`,
    networkErrorTitle: 'Network Connectivity Error',
    networkErrorDescription:
      'Unable to reach the server. Please check your internet connection and try again.',
  },
} as const;

export default ERROR_PAGES_CONSTANTS;
