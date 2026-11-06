renderNavbar('authors');

async function loadAuthorDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('content');
    
    if (!id) {
        showError(container, "No author ID provided in URL.");
        return;
    }

    showLoading(container);
    try {
        const author = await api.getAuthor(id);
        
        let booksHtml = '<p style="color: var(--text-muted);">No books found for this author.</p>';
        if (author.books && author.books.length > 0) {
            booksHtml = `
                <div class="grid">
                    ${author.books.map(book => `
                        <div class="card">
                            <div class="card-body">
                                <a href="./book-detail.html?id=${book.id}" style="text-decoration: none;">
                                    <h4 class="card-title" style="color: #fff; transition: color 0.3s;" onmouseover="this.style.color='var(--primary-hover)'" onmouseout="this.style.color='#fff'">${book.title}</h4>
                                </a>
                                <div class="mb-4" style="margin-top: 0.5rem;">
                                    <span class="badge" style="background: rgba(59,130,246,0.15); color: #93c5fd; border-color: rgba(59,130,246,0.3);">${book.genre}</span>
                                    <span class="badge" style="background: rgba(245,158,11,0.15); color: #fcd34d; border-color: rgba(245,158,11,0.3);">★ ${book.popularity_score}</span>
                                </div>
                            </div>
                            <div class="card-footer flex-between">
                                <span class="price" style="font-size: 1.25rem;">$${book.price}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="card" style="margin-bottom: 2rem;">
                <div class="detail-header">
                    <h1>${author.name}</h1>
                </div>
                <div class="detail-section">
                    <h3>Biography</h3>
                    <p class="mt-4" style="color: var(--text-muted); white-space: pre-wrap; word-break: break-word;">${author.bio || 'No biography available.'}</p>
                </div>
            </div>
            
            <h2 class="mb-4">Books by ${author.name}</h2>
            ${booksHtml}
        `;
        renderAdminDetailControls(document.getElementById('admin-controls'), 'author', id);
    } catch (error) {
        showError(container, error.message);
    }
}
loadAuthorDetail();
