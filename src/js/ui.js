async function renderNavbar(activePage) {
    const path = window.location.pathname;
    const isPagesDir = path.includes('/src/pages/');
    const root = isPagesDir ? '../../' : './';

    let authLinks = `
    <a href="${root}src/pages/login.html" class="nav-link ${activePage === 'login' ? 'active' : ''}">Login</a>
    <a href="${root}src/pages/register.html" class="nav-link ${activePage === 'register' ? 'active' : ''}">Register</a>
  `;

    if (auth.isAuthenticated()) {
        const user = await auth.getUser();
        authLinks = `
        <a href="${root}src/pages/cart.html" class="nav-link ${activePage === 'cart' ? 'active' : ''}">🛒 Cart</a>
        <a href="${root}src/pages/profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">${user ? user.username : 'Profile'}</a>
        <a href="#" id="logout-btn" class="nav-link">Logout</a>
      `;
    }

    const navbarHtml = `
    <nav class="navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 2rem;">
          <a href="${root}index.html" class="navbar-brand" style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">📚 Bookstore</a>
          <div class="nav-links" style="display: flex; gap: 1rem;">
            <a href="${root}index.html" class="nav-link ${activePage === 'books' ? 'active' : ''}">Books</a>
            <a href="${root}src/pages/authors.html" class="nav-link ${activePage === 'authors' ? 'active' : ''}">Authors</a>
            <a href="${root}src/pages/publishers.html" class="nav-link ${activePage === 'publishers' ? 'active' : ''}">Publishers</a>
            <a href="${root}src/pages/about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
          </div>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
          ${authLinks}
      </div>
    </nav>
  `;
    document.body.insertAdjacentHTML('afterbegin', navbarHtml);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    }
}

function showError(container, message) {
    container.innerHTML = `<div class="error-message" style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); color: #fca5a5; padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem;">
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

async function renderAdminListControls(container, entityType) {
    if (!auth.isAuthenticated()) return;
    const user = await auth.getUser();
    if (user && user.is_staff) {
        const isPagesDir = window.location.pathname.includes('/src/pages/');
        const root = isPagesDir ? '../../' : './';

        container.innerHTML = `<a href="${root}src/pages/${entityType}-form.html" class="btn btn-primary">+ Create New</a>`;
    }
}

async function renderAdminDetailControls(container, entityType, entityId) {
    if (!auth.isAuthenticated()) return;
    const user = await auth.getUser();
    if (user && user.is_staff) {
        const isPagesDir = window.location.pathname.includes('/src/pages/');
        const root = isPagesDir ? '../../' : './';

        container.innerHTML = `
            <a href="${root}src/pages/${entityType}-form.html?id=${entityId}" class="btn btn-warning" style="margin-right: 0.5rem;">Update</a>
            <button id="admin-delete-btn" class="btn btn-danger">Delete</button>
        `;

        document.getElementById('admin-delete-btn').addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete this ${entityType}?`)) {
                try {
                    const deleteFn = api[`delete${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`];
                    await deleteFn(entityId);
                    window.location.href = `${root}${entityType === 'book' ? 'index.html' : 'src/pages/' + entityType + 's.html'}`;
                } catch (error) {
                    alert(error.error || error.message || 'Failed to delete');
                }
            }
        });
    }
}
