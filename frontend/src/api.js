const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return { error: 'Unauthorized' };
    }

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'API Error' };
    }
    
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    return { error: 'Network error. Is the backend running?' };
  }
};
