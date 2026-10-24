renderNavbar('books');

async function loadBooks() {
    const container = document.getElementById('content');
    showLoading(container);
    try {
        const books = await api.getBooks();
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
loadBooks();
