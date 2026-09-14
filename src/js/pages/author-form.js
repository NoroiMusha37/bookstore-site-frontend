auth.requireAuth();
renderNavbar('authors');

const urlParams = new URLSearchParams(window.location.search);
const entityId = urlParams.get('id');
const isUpdate = !!entityId;

document.getElementById('page-title').textContent = isUpdate ? 'Update Author' : 'Create Author';

async function initForm() {
    const user = await auth.getUser();
    if (!user || !user.is_staff) {
        window.location.href = '../../index.html';
        return;
    }

    const form = document.getElementById('entity-form');
    
    if (isUpdate) {
        try {
            const data = await api.getAuthor(entityId);
            document.getElementById('field-name').value = data.name || '';
            document.getElementById('field-bio').value = data.bio || '';
        } catch (error) {
            showError(document.getElementById('error-container'), 'Failed to load author data.');
            return;
        }
    }
    
    form.style.display = 'block';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const errorContainer = document.getElementById('error-container');
        errorContainer.innerHTML = '';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            if (isUpdate) {
                await api.updateAuthor(entityId, data);
            } else {
                await api.createAuthor(data);
            }
            window.location.href = 'authors.html';
        } catch (error) {
            showError(errorContainer, error.message || 'Failed to save author.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

initForm();
