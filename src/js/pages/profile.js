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
            
            <div id="order-history" style="margin-top: 3rem;">
                <h2 style="margin-bottom: 1.5rem;">Order History</h2>
                <div id="orders-container" style="display: flex; flex-direction: column; gap: 1rem;">
                    <span style="color: var(--text-muted);">Loading orders...</span>
                </div>
            </div>
        `;

        document.getElementById('edit-profile-btn').addEventListener('click', renderEditMode);
        loadOrders();
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

async function loadOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return; // Might not be on display mode
    try {
        const orders = await api.getOrders();
        if (orders.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted)">No orders found.</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="card" style="padding: 1rem;">
                <div class="flex-between" style="cursor: pointer;" onclick="toggleOrderDetails('${order.id}')">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div>
                            <strong style="color: var(--primary);">Order #${order.id.split('-')[0]}</strong>
                            <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem;">${new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace; display: inline-flex; align-items: center; gap: 0.25rem;" title="Click to copy" onclick="event.stopPropagation(); navigator.clipboard.writeText('${order.id}'); alert('Order ID copied to clipboard!');">
                            <span style="opacity: 0.7;">ID: ${order.id}</span>
                            <span style="cursor: pointer; opacity: 0.5; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">📋</span>
                        </div>
                    </div>
                    <strong style="font-size: 1.1rem;">$${order.total_price}</strong>
                </div>
                <div id="order-details-${order.id}" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <div style="text-align: center; color: var(--text-muted);">Loading details...</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(container, "Failed to load orders: " + (error.message || "Unknown error"));
    }
}

window.toggleOrderDetails = async function(orderId) {
    const detailsContainer = document.getElementById(`order-details-${orderId}`);
    if (detailsContainer.style.display === 'block') {
        detailsContainer.style.display = 'none';
        return;
    }
    
    detailsContainer.style.display = 'block';
    
    if (detailsContainer.innerHTML.includes('Loading details...')) {
        try {
            const order = await api.getOrderDetails(orderId);
            detailsContainer.innerHTML = order.items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div>
                        <a href="./book-detail.html?id=${item.book}" style="color: #fff; text-decoration: none;">${item.book_title}</a>
                        <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem;">x${item.quantity}</span>
                    </div>
                    <span>$${item.item_total}</span>
                </div>
            `).join('');
            if (order.items.length === 0) {
                detailsContainer.innerHTML = '<span style="color: var(--text-muted);">No items found for this order.</span>';
            }
        } catch (error) {
            detailsContainer.innerHTML = '<span style="color: #fca5a5;">Failed to load order details.</span>';
        }
    }
}

loadProfile();
