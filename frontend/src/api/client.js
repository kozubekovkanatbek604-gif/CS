async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include',
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Ошибка запроса');
  }

  return data;
}

export const api = {
  getBooks: () => request('/api/books'),
  createBook: (book) => request('/api/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id, book) => request(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/api/books/${id}`, { method: 'DELETE' }),

  getYoutube: () => request('/api/youtube'),
  createYoutube: (lesson) => request('/api/youtube', { method: 'POST', body: JSON.stringify(lesson) }),
  updateYoutube: (id, lesson) => request(`/api/youtube/${id}`, { method: 'PUT', body: JSON.stringify(lesson) }),
  deleteYoutube: (id) => request(`/api/youtube/${id}`, { method: 'DELETE' }),

  login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' })
};
