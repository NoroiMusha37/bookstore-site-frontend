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
                    <p class="mt-4" style="color: var(--text-muted); white-space: pre-wrap; word-break: break-word;">${book.description || 'No description available.'}</p>
                </div>
                <div class="flex-between" style="align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                    <div>
                        <span style="font-size: 0.875rem; color: var(--text-muted);">Price</span><br>
                        <span class="price" style="font-size: 2rem;">$${book.price}</span>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div id="admin-controls"></div>
                        ${auth.isAuthenticated() ? `
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <input type="number" id="detail-qty-${book.id}" value="1" min="1" style="width: 60px; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: white;" ${!book.in_stock ? 'disabled' : ''}>
                            <button id="detail-add-to-cart-btn" class="btn btn-primary" data-id="${book.id}" ${!book.in_stock ? 'disabled style="background: var(--text-muted);"' : ''}>
                                ${book.in_stock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        renderAdminDetailControls(document.getElementById('admin-controls'), 'book', id);

        if (auth.isAuthenticated()) {
            const addBtn = document.getElementById('detail-add-to-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', async (e) => {
                    const bookId = e.target.dataset.id;
                    const qtyInput = document.getElementById(`detail-qty-${bookId}`);
                    const quantity = parseInt(qtyInput.value) || 1;
                    const originalText = e.target.textContent;
                    
                    e.target.disabled = true;
                    e.target.textContent = 'Adding...';
                    
                    try {
                        await api.addCartItem({ book: bookId, quantity: quantity });
                        e.target.textContent = 'Added ✓';
                        e.target.style.background = '#34d399';
                        setTimeout(() => {
                            e.target.textContent = originalText;
                            e.target.style.background = '';
                            e.target.disabled = false;
                        }, 2000);
                    } catch (err) {
                        alert(err.message || "Failed to add to cart. It may already be there.");
                        e.target.textContent = originalText;
                        e.target.disabled = false;
                    }
                });
            }
        }
    } catch (error) {
        showError(container, error.message);
    }
}
loadBookDetail();
