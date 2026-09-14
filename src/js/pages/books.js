renderNavbar('books');

async function initFilters() {
    try {
        // Fetch publishers for checkboxes
        const publishers = await api.getPublishers();
        const pubContainer = document.getElementById('publisher-filters');
        
        if (publishers.length === 0) {
            pubContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No publishers found</span>';
        } else {
            pubContainer.innerHTML = publishers.map(pub => `
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                    <input type="checkbox" name="publisher" value="${pub.name}">
                    ${pub.name}
                </label>
            `).join('');
        }

        // Fetch all books initially to extract unique genres
        const books = await api.getBooks();
        const genreContainer = document.getElementById('genre-filters');
        
        const uniqueGenres = [...new Set(books.map(b => b.genre).filter(Boolean))].sort();
        if (uniqueGenres.length === 0) {
            genreContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No genres found</span>';
        } else {
            genreContainer.innerHTML = uniqueGenres.map(genre => `
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                    <input type="checkbox" name="genre" value="${genre}">
                    ${genre}
                </label>
            `).join('');
        }

    } catch (error) {
        console.error("Failed to load filter options", error);
    }

    // Attach form submit listener
    const form = document.getElementById('filter-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const params = {};
        
        const search = formData.get('search');
        if (search) params.search = search;
        
        const ordering = formData.get('ordering');
        if (ordering) params.ordering = ordering;
        
        const selectedPublishers = formData.getAll('publisher');
        if (selectedPublishers.length > 0) {
            params.publisher = selectedPublishers.join(',');
        }
        
        const selectedGenres = formData.getAll('genre');
        if (selectedGenres.length > 0) {
            params.genre = selectedGenres.join(',');
        }
        
        loadBooks(params);
    });
}

async function loadBooks(params = {}) {
    const container = document.getElementById('content');
    showLoading(container);
    try {
        const books = await api.getBooks(params);
        if (books.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted)">No books found.</p>';
            return;
        }

        container.innerHTML = books.map(book => `
            <div class="card">
                <div class="card-body">
                    <a href="./src/pages/book-detail.html?id=${book.id}" style="text-decoration: none;">
                        <h3 class="card-title" style="color: #fff; transition: color 0.3s;" onmouseover="this.style.color='var(--primary-hover)'" onmouseout="this.style.color='#fff'">${book.title}</h3>
                    </a>
                    <p class="card-subtitle mb-2">By ${book.author_name || 'Unknown Author'}</p>
                    <div class="mb-4">
                        <span class="badge" style="background: rgba(59,130,246,0.15); color: #93c5fd; border-color: rgba(59,130,246,0.3);">${book.genre}</span>
                        <span class="badge" style="background: rgba(245,158,11,0.15); color: #fcd34d; border-color: rgba(245,158,11,0.3);">★ ${book.popularity_score}</span>
                    </div>
                </div>
                <div class="card-footer flex-between">
                    <span class="price">$${book.price}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(container, error.message);
    }
}

// Initialize
initFilters();
loadBooks();
renderAdminListControls(document.getElementById('admin-controls'), 'book');
