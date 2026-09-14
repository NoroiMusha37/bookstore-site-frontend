auth.requireAuth();
renderNavbar('cart');

async function loadCart() {
    const container = document.getElementById('cart-items');
    const sidebar = document.getElementById('checkout-sidebar');
    const clearBtn = document.getElementById('clear-cart-btn');
    
    showLoading(container);
    try {
        const cart = await api.getCart();
        
        if (!cart || !cart.items || cart.items.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted)">Your cart is empty.</p>';
            sidebar.style.display = 'none';
            clearBtn.style.display = 'none';
            return;
        }

        sidebar.style.display = 'block';
        clearBtn.style.display = 'block';
        
        document.getElementById('cart-total').textContent = `$${cart.total_price}`;

        container.innerHTML = cart.items.map(item => `
            <div class="card" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 1rem;">
                <div>
                    <h3 class="card-title" style="margin-bottom: 0.5rem;"><a href="./book-detail.html?id=${item.book}" style="color: #fff; text-decoration: none;">${item.book_title}</a></h3>
                    <p class="card-subtitle mb-2">Price: $${item.book_price}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button class="btn btn-secondary update-qty-btn" data-id="${item.book}" data-qty="${item.quantity - 1}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span>${item.quantity}</span>
                        <button class="btn btn-secondary update-qty-btn" data-id="${item.book}" data-qty="${item.quantity + 1}">+</button>
                    </div>
                    <div style="font-weight: bold; width: 80px; text-align: right;">
                        $${item.item_total}
                    </div>
                    <button class="btn btn-danger remove-item-btn" data-id="${item.book}">Remove</button>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        document.querySelectorAll('.update-qty-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const bookId = e.target.dataset.id;
                const newQty = parseInt(e.target.dataset.qty);
                try {
                    await api.updateCartItem(bookId, { quantity: newQty });
                    loadCart();
                } catch (err) {
                    alert(err.message || "Failed to update quantity");
                }
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const bookId = e.target.dataset.id;
                try {
                    await api.removeCartItem(bookId);
                    loadCart();
                } catch (err) {
                    alert(err.message || "Failed to remove item");
                }
            });
        });

    } catch (error) {
        showError(container, error.message || "Failed to load cart");
    }
}

document.getElementById('clear-cart-btn').addEventListener('click', async () => {
    if(confirm("Are you sure you want to clear your cart?")) {
        try {
            await api.clearCart();
            loadCart();
        } catch(e) {
            alert(e.message || "Failed to clear cart");
        }
    }
});

document.getElementById('checkout-btn').addEventListener('click', async (e) => {
    const btn = e.target;
    btn.disabled = true;
    btn.textContent = "Processing...";
    try {
        await api.checkout();
        alert("Checkout successful! Order placed.");
        window.location.href = './profile.html';
    } catch (error) {
        let msg = error.message || "Checkout failed";
        if(typeof error === 'object' && error.error) {
            msg = error.error;
        }
        alert(msg);
        btn.disabled = false;
        btn.textContent = "Checkout Now";
        loadCart(); // reload to reflect any out of stock issues if possible
    }
});

loadCart();
