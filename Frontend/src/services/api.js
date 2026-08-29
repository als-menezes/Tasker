const API_URL = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.error || 'Something went wrong');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function registerUser(userData) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function loginUser(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getTasks(token) {
  return request('/tasks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createTask(token, taskData) {
  return request('/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });
}

export async function updateTaskStatus(token, id, status) {
  return request(`/tasks/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export async function deleteTask(token, id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}