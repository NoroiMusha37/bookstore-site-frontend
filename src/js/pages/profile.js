auth.requireAuth();
renderNavbar('profile');

async function loadProfile() {
    const container = document.getElementById('content');
    const user = await auth.getUser();
    
    if (!user) {
        showError(container, 'Could not load profile. Please try logging in again.');
        return;
    }

    function renderDisplayMode() {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <label class="form-label" style="font-size: 0.9rem;">Username</label>
                    <div style="font-size: 1.25rem; font-weight: 500;">${user.username}</div>
                </div>
                
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <label class="form-label" style="font-size: 0.9rem;">First Name</label>
                        <div style="font-size: 1.1rem;">${user.first_name || '<span style="color:var(--text-muted); font-style:italic">Not provided</span>'}</div>
                    </div>
                    <div>
                        <label class="form-label" style="font-size: 0.9rem;">Last Name</label>
                        <div style="font-size: 1.1rem;">${user.last_name || '<span style="color:var(--text-muted); font-style:italic">Not provided</span>'}</div>
                    </div>
                </div>

                <div>
                    <label class="form-label" style="font-size: 0.9rem;">Email Address</label>
                    <div style="font-size: 1.1rem;">${user.email}</div>
                </div>

                <div>
                    <label class="form-label" style="font-size: 0.9rem;">Phone Number</label>
                    <div style="font-size: 1.1rem;">${user.phone || '<span style="color:var(--text-muted); font-style:italic">Not provided</span>'}</div>
                </div>
                
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <span class="badge" style="margin: 0; background: ${user.is_staff ? 'rgba(52, 211, 153, 0.2)' : 'rgba(148, 163, 184, 0.2)'}; color: ${user.is_staff ? '#34d399' : '#cbd5e1'}; border-color: ${user.is_staff ? 'rgba(52, 211, 153, 0.4)' : 'rgba(148, 163, 184, 0.4)'};">
                        ${user.is_staff ? 'Admin' : 'Customer'}
                    </span>
                    <button id="edit-profile-btn" class="btn btn-warning" style="padding: 0.5rem 1rem;">Edit Profile</button>
                </div>
            </div>
        `;

        document.getElementById('edit-profile-btn').addEventListener('click', renderEditMode);
    }

    function renderEditMode() {
        container.innerHTML = `
            <form id="profile-form">
                <div id="profile-error"></div>
                <div class="form-group">
                    <label class="form-label">Username (Cannot be changed)</label>
                    <input type="text" class="form-control" value="${user.username}" disabled>
                </div>
                <div class="grid form-group" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label class="form-label">First Name</label>
                        <input type="text" name="first_name" class="form-control" value="${user.first_name || ''}">
                    </div>
                    <div>
                        <label class="form-label">Last Name</label>
                        <input type="text" name="last_name" class="form-control" value="${user.last_name || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address *</label>
                    <input type="email" name="email" class="form-control" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="text" name="phone" class="form-control" value="${user.phone || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">New Password (leave blank to keep current)</label>
                    <input type="password" name="password" class="form-control" minlength="8">
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" id="save-profile-btn" class="btn btn-primary" style="flex: 1;">Save Changes</button>
                    <button type="button" id="cancel-edit-btn" class="btn btn-warning" style="flex: 1; background: transparent; border-color: var(--border-color); color: var(--text-muted);">Cancel</button>
                </div>
            </form>
        `;

        document.getElementById('cancel-edit-btn').addEventListener('click', renderDisplayMode);

        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('save-profile-btn');
            const errContainer = document.getElementById('profile-error');
            errContainer.innerHTML = '';
            
            btn.textContent = 'Saving...';
            btn.disabled = true;

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Remove empty password so it isn't updated to blank
            if (!data.password) {
                delete data.password;
            }

            try {
                await api.updateMe(data);
                // Invalidate local cache and reload
                localStorage.removeItem('userCache');
                window.location.reload();
            } catch (error) {
                let errorMsg = error.message || 'Failed to update profile.';
                if (typeof error === 'object') {
                    const keys = Object.keys(error);
                    if (keys.length > 0 && Array.isArray(error[keys[0]])) {
                        errorMsg = `${keys[0]}: ${error[keys[0]][0]}`;
                    }
                }
                showError(errContainer, errorMsg);
                btn.textContent = 'Save Changes';
                btn.disabled = false;
            }
        });
    }

    renderDisplayMode();
}

loadProfile();
