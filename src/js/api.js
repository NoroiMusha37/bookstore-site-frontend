async function fetchAPI(endpoint, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userCache');
      const isPagesDir = window.location.pathname.includes('/src/pages/');
      window.location.href = `${isPagesDir ? '../../' : './'}src/pages/login.html`;
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData; // return raw error for field validation
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'Unauthorized') throw error;
    if (error.error) throw new Error(error.error); // handle generic errors
    throw error; // keep object structure for specific field errors
  }
}

const api = {
  getBooks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchAPI(`/books/${qs ? '?' + qs : ''}`);
  },
  getBook: (id) => fetchAPI(`/books/${id}/`),
  createBook: (data) => fetchAPI(`/books/`, { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => fetchAPI(`/books/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBook: (id) => fetchAPI(`/books/${id}/`, { method: 'DELETE' }),

  getAuthors: () => fetchAPI('/authors/'),
  getAuthor: (id) => fetchAPI(`/authors/${id}/`),
  createAuthor: (data) => fetchAPI(`/authors/`, { method: 'POST', body: JSON.stringify(data) }),
  updateAuthor: (id, data) => fetchAPI(`/authors/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAuthor: (id) => fetchAPI(`/authors/${id}/`, { method: 'DELETE' }),

  getPublishers: () => fetchAPI('/publishers/'),
  getPublisher: (id) => fetchAPI(`/publishers/${id}/`),
  createPublisher: (data) => fetchAPI(`/publishers/`, { method: 'POST', body: JSON.stringify(data) }),
  updatePublisher: (id, data) => fetchAPI(`/publishers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePublisher: (id) => fetchAPI(`/publishers/${id}/`, { method: 'DELETE' }),

  getMe: () => fetchAPI('/me/'),
  updateMe: (data) => fetchAPI('/me/', { method: 'PATCH', body: JSON.stringify(data) }),

  // Cart
  getCart: () => fetchAPI('/me/cart/'),
  clearCart: () => fetchAPI('/me/cart/', { method: 'DELETE' }),
  addCartItem: (data) => fetchAPI(`/me/cart/items/`, { method: 'POST', body: JSON.stringify(data) }),
  updateCartItem: (bookId, data) => fetchAPI(`/me/cart/items/${bookId}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeCartItem: (bookId) => fetchAPI(`/me/cart/items/${bookId}/`, { method: 'DELETE' }),

  // Orders
  getOrders: () => fetchAPI('/me/orders/'),
  getOrderDetails: (id) => fetchAPI(`/me/orders/${id}/`),
  checkout: () => fetchAPI('/me/orders/', { method: 'POST' }),
};
