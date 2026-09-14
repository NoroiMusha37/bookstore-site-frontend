auth.requireAuth();
renderNavbar('publishers');

const urlParams = new URLSearchParams(window.location.search);
const entityId = urlParams.get('id');
const isUpdate = !!entityId;

document.getElementById('page-title').textContent = isUpdate ? 'Update Publisher' : 'Create Publisher';

async function initForm() {
    const user = await auth.getUser();
    if (!user || !user.is_staff) {
        window.location.href = '../../index.html';
        return;
    }

    const form = document.getElementById('entity-form');
    
    if (isUpdate) {
        try {
            const data = await api.getPublisher(entityId);
            document.getElementById('field-name').value = data.name || '';
            document.getElementById('field-description').value = data.description || '';
        } catch (error) {
            showError(document.getElementById('error-container'), 'Failed to load publisher data.');
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
                await api.updatePublisher(entityId, data);
            } else {
                await api.createPublisher(data);
            }
            window.location.href = 'publishers.html';
        } catch (error) {
            showError(errorContainer, error.message || 'Failed to save publisher.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

initForm();
