// JWT Dashboard Auth - Token management for /dashboard.html
let authToken = sessionStorage.getItem('adminToken') || new URLSearchParams(window.location.search).get('token');

if (authToken) {
  sessionStorage.setItem('adminToken', authToken);
}

// Export for dashboard.html
window.dashboardAuth = {
  getToken() { return authToken; },
  isAuthenticated() { return !!authToken; },
  clear() { 
    sessionStorage.removeItem('adminToken');
    authToken = null;
    window.location.href = '/admin-link.html';
  }
};

// Auto-logout on 401
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('401')) {
    window.dashboardAuth.clear();
  }
});
