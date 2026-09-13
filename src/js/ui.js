function renderNavbar(activePage) {
  const path = window.location.pathname;
  const isPagesDir = path.includes('/src/pages/');
  const root = isPagesDir ? '../../' : './';
  
  const navbarHtml = `
    <nav class="navbar">
      <a href="${root}index.html" class="navbar-brand">📚 Bookstore</a>
      <div class="nav-links">
        <a href="${root}index.html" class="nav-link ${activePage === 'books' ? 'active' : ''}">Books</a>
        <a href="${root}src/pages/authors.html" class="nav-link ${activePage === 'authors' ? 'active' : ''}">Authors</a>
        <a href="${root}src/pages/publishers.html" class="nav-link ${activePage === 'publishers' ? 'active' : ''}">Publishers</a>
        <a href="${root}src/pages/about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
      </div>
    </nav>
  `;
  document.body.insertAdjacentHTML('afterbegin', navbarHtml);
}

function showError(container, message) {
  container.innerHTML = `<div class="error-message">
    <strong>Error:</strong> ${message}
  </div>`;
}

function showLoading(container) {
  container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">
    <div style="width:40px; height:40px; border:3px solid rgba(139, 92, 246, 0.3); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
    Loading...
  </div>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>`;
}
