renderNavbar('authors');

async function loadAuthors() {
    const container = document.getElementById('content');
    showLoading(container);
    try {
        const authors = await api.getAuthors();
        if (authors.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted)">No authors found.</p>';
            return;
        }

        container.innerHTML = authors.map(author => `
            <div class="card">
                <div class="card-body">
                    <a href="./author-detail.html?id=${author.id}" style="text-decoration: none;">
                        <h3 class="card-title" style="color: #fff; transition: color 0.3s;" onmouseover="this.style.color='var(--primary-hover)'" onmouseout="this.style.color='#fff'">${author.name}</h3>
                    </a>
                    <p class="card-subtitle mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-top: 0.5rem; word-break: break-word;">
                        ${author.bio || 'No bio available.'}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(container, error.message);
    }
}
loadAuthors();
renderAdminListControls(document.getElementById('admin-controls'), 'author');
