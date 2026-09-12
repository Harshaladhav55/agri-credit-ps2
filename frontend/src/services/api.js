import { API_BASE as API_BASE_URL } from '../config';

export const apiService = {
  // Register new user
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('pathcraft_token', data.token);
      }
      return data;
    } catch (err) {
      console.warn('[API Register Warning] Falling back to client state:', err.message);
      return null;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('pathcraft_token', data.token);
      }
      return data;
    } catch (err) {
      console.warn('[API Login Warning] Falling back to client state:', err.message);
      return null;
    }
  },

  // Get active user roadmap
  getRoadmap: async () => {
    try {
      const token = localStorage.getItem('pathcraft_token');
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/roadmap`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Toggle course completion
  toggleCourse: async (courseId) => {
    try {
      const token = localStorage.getItem('pathcraft_token');
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/roadmap/toggle-course`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Generate custom roadmap
  generateRoadmap: async (goalPrompt) => {
    try {
      const token = localStorage.getItem('pathcraft_token');
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goalPrompt })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Get chat history
  getChatMessages: async () => {
    try {
      const token = localStorage.getItem('pathcraft_token');
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Send chat message
  sendChatMessage: async (text) => {
    try {
      const token = localStorage.getItem('pathcraft_token');
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }
};
