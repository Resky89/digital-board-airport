const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8443';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
};

export const getTokens = () => {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
    refreshToken = localStorage.getItem('refresh_token');
  }
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Base fetch with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { accessToken: token } = getTokens();
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // If 401, try to refresh token
  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      if (data.data?.access_token) {
        setTokens(data.data.access_token, data.data.refresh_token);
        (headers as Record<string, string>)['Authorization'] = `Bearer ${data.data.access_token}`;
        response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      }
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
};



// Public API
export const publicApi = {
  getFlights: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/api/flights${queryString}`, {
      headers: { 'Accept': 'application/json' },
    });
    return response.json();
  },

  getFlight: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/flights/${id}`, {
      headers: { 'Accept': 'application/json' },
    });
    return response.json();
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetchWithAuth('/api/admin/auth/logout', {
      method: 'POST',
    });
    clearTokens();
    return response.json();
  },

  refresh: async () => {
    const { refreshToken: token } = getTokens();
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: token }),
    });
    return response.json();
  },
};

// Admin API - Flights
export const adminFlightsApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/flights${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/flights/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/flights', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/flights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/flights/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Countries
export const adminCountriesApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/countries${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/countries/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/countries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/countries/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Airlines
export const adminAirlinesApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/airlines${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/airlines/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/airlines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/airlines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/airlines/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Cities
export const adminCitiesApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/cities${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/cities/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/cities/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Airports
export const adminAirportsApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/airports${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/airports/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/airports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/airports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/airports/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Terminals
export const adminTerminalsApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/terminals${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/terminals/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/terminals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/terminals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/terminals/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Gates
export const adminGatesApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/gates${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/gates/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/gates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/gates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/gates/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Flight Statuses
export const adminFlightStatusesApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/flight-statuses${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/flight-statuses/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/flight-statuses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/flight-statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/flight-statuses/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API - Users
export const adminUsersApi = {
  list: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetchWithAuth(`/api/admin/users${queryString}`);
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/users/${id}`);
    return response.json();
  },

  create: async (data: object) => {
    const response = await fetchWithAuth('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: object) => {
    const response = await fetchWithAuth(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
