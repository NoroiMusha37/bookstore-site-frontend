const auth = {
    setTokens(access, refresh) {
        localStorage.setItem('accessToken', access);
        if (refresh) localStorage.setItem('refreshToken', refresh);
    },
    
    getAccessToken() {
        return localStorage.getItem('accessToken');
    },
    
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },
    
    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userCache');
    },

    isAuthenticated() {
        return !!this.getAccessToken();
    },

    async getUser() {
        if (!this.isAuthenticated()) return null;
        
        // Cache user info to avoid hitting /me/ on every page load
        const cached = localStorage.getItem('userCache');
        if (cached) return JSON.parse(cached);

        try {
            const user = await api.getMe();
            localStorage.setItem('userCache', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error("Failed to fetch user, logging out", error);
            this.logout();
            return null;
        }
    },

    async login(username, password) {
        // use fetch directly to avoid circular dependency loop with api.js
        const url = `${CONFIG.API_BASE_URL}/accounts/login/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || err.error || "Login failed");
        }
        
        const data = await response.json();
        this.setTokens(data.access, data.refresh);
        
        // fetch user immediately
        await this.getUser();
    },

    async register(userData) {
        const url = `${CONFIG.API_BASE_URL}/accounts/register/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw err; // throw raw object to handle field errors
        }
        
        return await response.json();
    },

    logout() {
        this.clearTokens();
        // Redirect to login page
        const isPagesDir = window.location.pathname.includes('/src/pages/');
        const root = isPagesDir ? '../../' : './';
        window.location.href = `${root}src/pages/login.html`;
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            const isPagesDir = window.location.pathname.includes('/src/pages/');
            const root = isPagesDir ? '../../' : './';
            const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `${root}src/pages/login.html?next=${currentUrl}`;
        }
    },

    requireGuest() {
        if (this.isAuthenticated()) {
            const isPagesDir = window.location.pathname.includes('/src/pages/');
            const root = isPagesDir ? '../../' : './';
            window.location.href = `${root}index.html`;
        }
    }
};
