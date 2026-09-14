auth.requireGuest();
renderNavbar('login');

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;
    
    const formData = new FormData(form);
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = '';

    try {
        await auth.login(formData.get('username'), formData.get('password'));
        
        // Redirect to next or home
        const urlParams = new URLSearchParams(window.location.search);
        const next = urlParams.get('next');
        if (next) {
            window.location.href = decodeURIComponent(next);
        } else {
            window.location.href = '../../index.html';
        }
    } catch (error) {
        showError(errorContainer, error.message || 'Invalid username or password.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
});
