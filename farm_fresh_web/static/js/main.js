// This global variable might become less important if cart count is always fetched.
// let cartItemCount = 0; // Can be removed if updateCartBadge always fetches.
let cartItemCount = 0; // Keeping for now, but its direct usage for badge is replaced.

// New function to update cart badge from backend data
async function updateCartBadge() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    try {
        const response = await fetch('/api/cart'); // Assumes this returns the cart items
        if (!response.ok) {
            // If user is not logged in (401) or other error, cart is effectively empty for display
            cartCountElement.textContent = '0';
            return;
        }
        const cartData = await response.json();
        let totalItems = 0;
        if (cartData && cartData.length > 0) {
            totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
        }
        cartCountElement.textContent = totalItems;
    } catch (error) {
        console.error('Error updating cart badge:', error);
        cartCountElement.textContent = '0'; // Default to 0 on error
    }
}

// Modified addToCart function
async function addToCart(productId, productName) { // Added productId
    // console.log(`Attempting to add ID: ${productId}, Name: ${productName}`); // For debugging
    if (typeof productId === 'undefined') {
        alert('Product ID is undefined. Cannot add to cart.');
        return;
    }
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 }) // Adding 1 item
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            alert(`"${productName}" added to cart!`);
            await updateCartBadge(); // Update navigation badge
        } else {
            alert(data.message || 'Failed to add item. Are you logged in?');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred while adding to cart.');
    }
}

// Modify loadProducts to pass product.id and product.name
async function loadProducts() {
    const productListDiv = document.getElementById('product-list');
    if (!productListDiv) return;
    productListDiv.innerHTML = '<p>Loading products...</p>';
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const products = await response.json();
        productListDiv.innerHTML = '';
        if (products.length === 0) {
            productListDiv.innerHTML = '<p>No products found.</p>'; return;
        }
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // Ensure product.name is properly escaped for use in string literal if it can contain quotes
            const safeProductName = product.name.replace(/'/g, "\'");
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" style="width:100%;max-width:200px;height:auto;margin-bottom:10px;">
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id}, '${safeProductName}')">Add to Cart</button>
            `;
            productListDiv.appendChild(productCard);
        });
    } catch (error) {
        console.error('Failed to load products:', error);
        productListDiv.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Modify loadFeaturedProducts similarly
async function loadFeaturedProducts() {
    const featuredProductListDiv = document.getElementById('featured-products-list');
    if (!featuredProductListDiv) return;
    featuredProductListDiv.innerHTML = '<p>Loading featured products...</p>';
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const products = await response.json();
        featuredProductListDiv.innerHTML = '';
        if (products.length === 0) {
            featuredProductListDiv.innerHTML = '<p>No products to feature.</p>'; return;
        }
        const featuredProducts = products.slice(0, 3);
        featuredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const safeProductName = product.name.replace(/'/g, "\'");
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" style="width:100%;max-width:200px;height:auto;margin-bottom:10px;">
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id}, '${safeProductName}')">Add to Cart</button>
            `;
            featuredProductListDiv.appendChild(productCard);
        });
    } catch (error) {
        console.error('Failed to load featured products:', error);
        featuredProductListDiv.innerHTML = '<p>Error loading featured products.</p>';
    }
}

// --- User Authentication and Status Functions ---

function updateUserStatusDisplay(userData) {
    const userStatusDiv = document.getElementById('user-status-display');
    if (!userStatusDiv) return;

    if (userData && userData.status === 'loggedin') {
        userStatusDiv.innerHTML = `Welcome, ${userData.user.username}! <a href="#" id="logout-link">Logout</a>`;
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', async (event) => {
                event.preventDefault();
                await handleLogout();
            });
        }
    } else { // Logged out or error
        userStatusDiv.innerHTML = `Welcome, Guest! <a href="/index.html#login-form-section">Login</a> | <a href="/index.html#register-form-section">Register</a>`;
    }
}

async function checkUserStatus() {
    try {
        const response = await fetch('/api/user/status');
        const data = await response.json();
        updateUserStatusDisplay(data);
    } catch (error) {
        console.error('Error checking user status:', error);
        updateUserStatusDisplay(null); // Assume logged out on error
    }
}

async function handleRegistration(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('register-username');
    const passwordInput = document.getElementById('register-password');
    
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Please enter both username and password for registration.');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            alert(data.message);
            usernameInput.value = ''; // Clear form
            passwordInput.value = '';
            // Optionally redirect or update UI further
        } else {
            alert(data.message || 'Registration failed.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Please enter both username and password to login.');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            updateUserStatusDisplay(data); // data should include user info
            usernameInput.value = ''; // Clear form
            passwordInput.value = '';
            // Potentially redirect or hide login form
            // Example: document.getElementById('login-form-section').style.display = 'none'; 
        } else {
            alert(data.message || 'Login failed.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            // Fetch new status to update display correctly (or pass mock loggedout data)
            await checkUserStatus(); 
        } else {
            alert(data.message || 'Logout failed.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
}

// --- Modify loadCart function ---
async function loadCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalAmountSpan = document.getElementById('cart-total-amount');

    if (!cartItemsDiv || !cartTotalAmountSpan) {
        return; 
    }

    cartItemsDiv.innerHTML = '<p>Loading your cart...</p>';
    cartTotalAmountSpan.textContent = '0.00';

    try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
            if (response.status === 401) {
                cartItemsDiv.innerHTML = '<p>Please log in to view your cart.</p>';
            } else {
                cartItemsDiv.innerHTML = '<p>Could not load your cart. Please try again.</p>';
            }
            // No throw here, just return or set specific message
            return; 
        }
        
        const cartData = await response.json();
        cartItemsDiv.innerHTML = ''; 

        if (!cartData || cartData.length === 0) {
            cartItemsDiv.innerHTML = '<p>Your cart is currently empty.</p>';
            cartTotalAmountSpan.textContent = '0.00';
            return;
        }

        let overallTotal = 0;
        cartData.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';

            const itemTotal = item.price * item.quantity;
            overallTotal += itemTotal;
            
            // Escape product name for use in string literals if it contains quotes
            const safeItemName = item.name.replace(/'/g, "\'");

            itemDiv.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}" style="width: 80px; height: auto; margin-right: 15px;">
                <div class="cart-item-details" style="flex-grow: 1;">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    Quantity: <input type="number" value="${item.quantity}" min="1" id="qty-${item.product_id}" style="width: 60px; padding: 5px; margin-right: 5px;">
                    <button onclick="updateCartItem(${item.product_id}, '${safeItemName}')" style="padding: 5px 10px; margin-right: 5px;">Update</button>
                    <button onclick="removeCartItem(${item.product_id}, '${safeItemName}')" style="padding: 5px 10px;">Remove</button>
                </div>
                <p style="font-weight: bold; min-width: 60px; text-align: right;">$${itemTotal.toFixed(2)}</p>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });

        cartTotalAmountSpan.textContent = overallTotal.toFixed(2);

    } catch (error) {
        console.error('Failed to load cart:', error);
        if (cartItemsDiv.innerHTML.includes('Loading')) {
             cartItemsDiv.innerHTML = '<p>Error loading your cart. Please refresh or log in.</p>';
        }
    }
}

// --- New functions for updating and removing cart items ---
async function updateCartItem(productId, productName) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    if (!quantityInput) {
        console.error(`Quantity input for product ID ${productId} not found.`);
        return;
    }
    const newQuantity = parseInt(quantityInput.value);

    if (isNaN(newQuantity) || newQuantity < 0) { // Allow 0 to remove, backend handles this logic
        alert('Please enter a valid quantity (0 or more).');
        return;
    }
    
    // If quantity is 0, it's effectively a remove operation via update.
    // Or, you could directly call removeCartItem if newQuantity === 0 and your remove endpoint handles it.
    // For now, we assume /api/cart/update handles quantity 0 as removal as per backend logic.

    try {
        const response = await fetch('/api/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: newQuantity })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            alert(`Quantity for "${productName}" updated.`);
            await loadCart(); // Refresh cart display
            await updateCartBadge(); // Update navigation badge
        } else {
            alert(data.message || 'Failed to update item quantity.');
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        alert('An error occurred while updating the cart.');
    }
}

async function removeCartItem(productId, productName) {
    if (!confirm(`Are you sure you want to remove "${productName}" from your cart?`)) {
        return;
    }
    try {
        const response = await fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            alert(`"${productName}" removed from cart.`);
            await loadCart(); // Refresh cart display
            await updateCartBadge(); // Update navigation badge
        } else {
            alert(data.message || 'Failed to remove item from cart.');
        }
    } catch (error) {
        console.error('Error removing cart item:', error);
        alert('An error occurred while removing the item from the cart.');
    }
}

// --- DOMContentLoaded Listener ---
// Update DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => { // Made async for await inside
    // checkUserStatus already calls updateUserStatusDisplay.
    // updateUserStatusDisplay handles the logout link attachment.
    await checkUserStatus(); // Checks user status and updates display
    await updateCartBadge(); // Update cart badge based on actual cart data or login status

    // Load products if on products page
    if (document.getElementById('product-list')) {
        loadProducts();
    }
    
    // Load featured products if on index page
    if (document.getElementById('featured-products-list')) {
        loadFeaturedProducts(); 
    }

    // Attach form handlers
    const registerForm = document.getElementById('register-form-actual');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    const loginForm = document.getElementById('login-form-actual');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Load cart details if on cart page
    if (document.getElementById('cart-items')) {
        loadCart();
    }
});
