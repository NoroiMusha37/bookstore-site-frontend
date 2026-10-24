async function fetchAPI(endpoint, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw new Error('Could not connect to the API. Make sure the backend server is running and CORS is enabled.');
  }
}

const api = {
  getBooks: () => fetchAPI('/books/'),
  getBook: (id) => fetchAPI(`/books/${id}/`),
  getAuthors: () => fetchAPI('/authors/'),
  getAuthor: (id) => fetchAPI(`/authors/${id}/`),
  getPublishers: () => fetchAPI('/publishers/'),
  getPublisher: (id) => fetchAPI(`/publishers/${id}/`),
};
