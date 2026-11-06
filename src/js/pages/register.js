auth.requireGuest();
renderNavbar('register');

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = '';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.password_check) {
        showError(errorContainer, 'Passwords do not match');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = 'Registering...';
    btn.disabled = true;

    try {
        await auth.register(data);
        // Automatically login after successful registration
        await auth.login(data.username, data.password);
        window.location.href = '../../index.html';
    } catch (error) {
        if (error.username) showError(errorContainer, `Username: ${error.username[0]}`);
        else if (error.email) showError(errorContainer, `Email: ${error.email[0]}`);
        else if (error.password) showError(errorContainer, `Password: ${error.password[0]}`);
        else showError(errorContainer, error.message || 'Registration failed due to invalid data.');
        
        btn.textContent = originalText;
        btn.disabled = false;
    }
});
