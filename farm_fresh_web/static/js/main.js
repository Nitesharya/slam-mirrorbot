let cartItemCount = 0; // Keep this if you are managing cart count client-side for now

// Function to update the cart item count display in the navigation
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartItemCount;
    }
}

// Function to add an item to the cart (client-side conceptual)
function addToCart(productName, productPrice) {
    cartItemCount++;
    console.log(`Added "${productName}" to cart. Price: $${productPrice}. Total items: ${cartItemCount}`);
    updateCartCount();
    alert(`"${productName}" (Price: $${productPrice}) has been added to your cart!`);
    // Later, this will interact with a backend API to manage the cart
}

// Function to fetch products from the API and display them
async function loadProducts() {
    const productListDiv = document.getElementById('product-list');
    if (!productListDiv) {
        console.error('Product list container not found on this page.');
        return; // Not on the products page or container missing
    }

    productListDiv.innerHTML = '<p>Loading products...</p>'; // Placeholder while loading

    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        productListDiv.innerHTML = ''; // Clear loading message or old products

        if (products.length === 0) {
            productListDiv.innerHTML = '<p>No products found.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const productImage = document.createElement('img');
            productImage.src = product.image_url; // Assumes image_url is correct
            productImage.alt = product.name;
            productImage.style.width = '100%';
            productImage.style.maxWidth = '200px';
            productImage.style.height = 'auto';
            productImage.style.marginBottom = '10px';

            const productName = document.createElement('h3');
            productName.textContent = product.name;

            const productPrice = document.createElement('p');
            productPrice.textContent = `Price: $${product.price.toFixed(2)}`;

            const addButton = document.createElement('button');
            addButton.textContent = 'Add to Cart';
            addButton.onclick = () => addToCart(product.name, product.price);

            productCard.appendChild(productImage);
            productCard.appendChild(productName);
            productCard.appendChild(productPrice);
            productCard.appendChild(addButton);

            productListDiv.appendChild(productCard);
        });

    } catch (error) {
        console.error('Failed to load products:', error);
        productListDiv.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Function to fetch and display featured products (e.g., first 3)
async function loadFeaturedProducts() {
    const featuredProductListDiv = document.getElementById('featured-products-list');
    if (!featuredProductListDiv) {
        console.error('Featured product list container not found on this page.');
        return; 
    }

    featuredProductListDiv.innerHTML = '<p>Loading featured products...</p>';

    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        featuredProductListDiv.innerHTML = ''; // Clear loading message

        if (products.length === 0) {
            featuredProductListDiv.innerHTML = '<p>No products to feature.</p>';
            return;
        }

        // Display only the first 3 products as featured, or fewer if not enough products
        const featuredProducts = products.slice(0, 3);

        featuredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const productImage = document.createElement('img');
            productImage.src = product.image_url;
            productImage.alt = product.name;
            productImage.style.width = '100%';
            productImage.style.maxWidth = '200px'; // Consistent styling
            productImage.style.height = 'auto';
            productImage.style.marginBottom = '10px';

            const productName = document.createElement('h3');
            productName.textContent = product.name;

            const productPrice = document.createElement('p');
            productPrice.textContent = `Price: $${product.price.toFixed(2)}`;

            // Optionally, add a "View Details" or "Add to Cart" button
            // For now, just display info
            // const addButton = document.createElement('button');
            // addButton.textContent = 'Add to Cart';
            // addButton.onclick = () => addToCart(product.name, product.price);


            productCard.appendChild(productImage);
            productCard.appendChild(productName);
            productCard.appendChild(productPrice);
            // productCard.appendChild(addButton); // Uncomment if you add the button

            featuredProductListDiv.appendChild(productCard);
        });

    } catch (error) {
        console.error('Failed to load featured products:', error);
        featuredProductListDiv.innerHTML = '<p>Error loading featured products.</p>';
    }
}

// Initialize cart count and load products on relevant pages
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); // Update cart count on all pages

    // If we are on the products page (identified by the presence of 'product-list' div)
    if (document.getElementById('product-list')) {
        loadProducts();
    }
    
    if (document.getElementById('featured-products-list')) {
        loadFeaturedProducts(); 
    }
});
