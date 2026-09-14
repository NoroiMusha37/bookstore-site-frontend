auth.requireAuth();
renderNavbar('books');

const urlParams = new URLSearchParams(window.location.search);
const entityId = urlParams.get('id');
const isUpdate = !!entityId;

document.getElementById('page-title').textContent = isUpdate ? 'Update Book' : 'Create Book';

let authorsData = [];
let publishersData = [];

async function initForm() {
    const user = await auth.getUser();
    if (!user || !user.is_staff) {
        window.location.href = '../../index.html';
        return;
    }

    const form = document.getElementById('entity-form');
    const errorContainer = document.getElementById('error-container');

    try {
        // Load authors and publishers for datalists
        [authorsData, publishersData] = await Promise.all([
            api.getAuthors(),
            api.getPublishers()
        ]);

        document.getElementById('authors-list').innerHTML = authorsData.map(a => `<option value="${a.name}">`).join('');
        document.getElementById('publishers-list').innerHTML = publishersData.map(p => `<option value="${p.name}">`).join('');

        if (isUpdate) {
            const data = await api.getBook(entityId);
            document.getElementById('field-title').value = data.title || '';
            document.getElementById('field-genre').value = data.genre || '';
            document.getElementById('field-author').value = data.author_name || '';
            document.getElementById('field-publisher').value = data.publisher_name || '';
            document.getElementById('field-price').value = data.price || '';
            document.getElementById('field-pop').value = data.popularity_score || '';
            document.getElementById('field-year').value = data.publication_year || '';
            document.getElementById('field-pages').value = data.pages || '';
            document.getElementById('field-stock').checked = !!data.in_stock;
            document.getElementById('field-description').value = data.description || '';
        }
        
        form.style.display = 'block';
    } catch (error) {
        showError(errorContainer, 'Failed to initialize form data.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;
        errorContainer.innerHTML = '';

        const formData = new FormData(form);
        const authorName = formData.get('author_name');
        const publisherName = formData.get('publisher_name');

        const authorMatch = authorsData.find(a => a.name === authorName);
        const publisherMatch = publishersData.find(p => p.name === publisherName);

        if (!authorMatch) {
            showError(errorContainer, 'Please select a valid author from the dropdown list.');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        if (!publisherMatch) {
            showError(errorContainer, 'Please select a valid publisher from the dropdown list.');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        const data = {
            title: formData.get('title'),
            author: authorMatch.id,
            publisher: publisherMatch.id,
            genre: formData.get('genre'),
            price: formData.get('price'),
            popularity_score: formData.get('popularity_score'),
            publication_year: formData.get('publication_year'),
            pages: formData.get('pages'),
            in_stock: document.getElementById('field-stock').checked,
            description: formData.get('description'),
        };

        try {
            if (isUpdate) {
                await api.updateBook(entityId, data);
            } else {
                await api.createBook(data);
            }
            window.location.href = '../../index.html';
        } catch (error) {
            // Handle validation errors from backend
            let errorMsg = error.message || 'Failed to save book.';
            if (typeof error === 'object') {
                const keys = Object.keys(error);
                if (keys.length > 0 && Array.isArray(error[keys[0]])) {
                    errorMsg = `${keys[0]}: ${error[keys[0]][0]}`;
                }
            }
            showError(errorContainer, errorMsg);
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

initForm();
