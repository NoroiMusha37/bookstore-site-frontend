renderNavbar('publishers');

async function loadPublishers() {
    const container = document.getElementById('content');
    showLoading(container);
    try {
        const publishers = await api.getPublishers();
        if (publishers.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted)">No publishers found.</p>';
            return;
        }

        container.innerHTML = publishers.map(publisher => `
            <div class="card">
                <div class="card-body">
                    <a href="./publisher-detail.html?id=${publisher.id}" style="text-decoration: none;">
                        <h3 class="card-title" style="color: #fff; transition: color 0.3s;" onmouseover="this.style.color='var(--primary-hover)'" onmouseout="this.style.color='#fff'">${publisher.name}</h3>
                    </a>
                    <p class="card-subtitle mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-top: 0.5rem;">
                        ${publisher.description || 'No description available.'}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(container, error.message);
    }
}
loadPublishers();
