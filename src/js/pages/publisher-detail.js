renderNavbar('publishers');

async function loadPublisherDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('content');
    
    if (!id) {
        showError(container, "No publisher ID provided in URL.");
        return;
    }

    showLoading(container);
    try {
        const publisher = await api.getPublisher(id);
        
        let booksHtml = '<p style="color: var(--text-muted);">No books found from this publisher.</p>';
        if (publisher.books && publisher.books.length > 0) {
            booksHtml = `
                <div class="grid">
                    ${publisher.books.map(book => `
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
                    <h1>${publisher.name}</h1>
                </div>
                <div class="detail-section">
                    <h3>About the Publisher</h3>
                    <p class="mt-4" style="color: var(--text-muted);">${publisher.description || 'No description available.'}</p>
                </div>
            </div>
            
            <h2 class="mb-4">Books Published by ${publisher.name}</h2>
            ${booksHtml}
        `;
    } catch (error) {
        showError(container, error.message);
    }
}
loadPublisherDetail();
