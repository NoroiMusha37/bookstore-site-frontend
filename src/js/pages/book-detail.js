renderNavbar('books');

async function loadBookDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('content');
    
    if (!id) {
        showError(container, "No book ID provided in URL.");
        return;
    }

    showLoading(container);
    try {
        const book = await api.getBook(id);
        
        container.innerHTML = `
            <div class="card">
                <div class="detail-header">
                    <h1>${book.title}</h1>
                    <p class="card-subtitle mt-4" style="font-size: 1rem;">
                        By <a href="./author-detail.html?id=${book.author}">${book.author_name || 'Author details'}</a> 
                        | Published by <a href="./publisher-detail.html?id=${book.publisher}">${book.publisher_name || 'Publisher details'}</a>
                    </p>
                </div>
                <div class="detail-section">
                    <div class="mb-4">
                        <span class="badge">${book.genre}</span>
                        <span class="badge" style="background: rgba(245,158,11,0.15); color: #fcd34d; border-color: rgba(245,158,11,0.3);">Popularity: ${book.popularity_score}</span>
                        <span class="badge" style="background: rgba(59,130,246,0.15); color: #93c5fd; border-color: rgba(59,130,246,0.3);">Pages: ${book.pages}</span>
                        <span class="badge" style="background: rgba(16,185,129,0.15); color: #6ee7b7; border-color: rgba(16,185,129,0.3);">Stock: ${book.in_stock}</span>
                        <span class="badge" style="background: rgba(148,163,184,0.15); color: #cbd5e1; border-color: rgba(148,163,184,0.3);">Year: ${book.publication_year}</span>
                    </div>
                    <h3>Description</h3>
                    <p class="mt-4" style="color: var(--text-muted);">${book.description || 'No description available.'}</p>
                </div>
                <div class="flex-between" style="align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                    <div>
                        <span style="font-size: 0.875rem; color: var(--text-muted);">Price</span><br>
                        <span class="price" style="font-size: 2rem;">$${book.price}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showError(container, error.message);
    }
}
loadBookDetail();
