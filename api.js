class API {
    constructor() {
        // Use relative URLs for production (Vercel), localhost for development
        this.baseURL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication
    async register(userData) {
        const data = await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async login(credentials) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async getProfile() {
        return this.request('/profile');
    }

    // Products
    async getProducts() {
        return this.request('/products');
    }

    // Orders
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return this.request('/orders');
    }

    async updateOrder(orderId, updateData) {
        return this.request(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    // Logout
    logout() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.token;
    }
}

// Create global API instance
const api = new API();
