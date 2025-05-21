from flask import Flask, jsonify, abort, request, session
from werkzeug.security import generate_password_hash, check_password_hash
import os
from functools import wraps # For login_required decorator

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev_fallback_secret_key_123!@#')

# --- In-memory Data Stores ---
products = [
    {"id": 1, "name": "Fresh Apples", "description": "Crisp and juicy apples.", "price": 2.99, "image_url": "static/images/placeholder.png", "stock": 100},
    {"id": 2, "name": "Organic Carrots", "description": "Sweet and crunchy.", "price": 1.99, "image_url": "static/images/placeholder.png", "stock": 150},
    {"id": 3, "name": "Ripe Tomatoes", "description": "Perfect for salads.", "price": 3.49, "image_url": "static/images/placeholder.png", "stock": 80},
    {"id": 4, "name": "Green Lettuce", "description": "Fresh green lettuce.", "price": 1.50, "image_url": "static/images/placeholder.png", "stock": 120}
]
users_db = {} # Stores { 'username': 'hashed_password' }
carts_db = {} # Stores { 'username': [{'product_id': X, 'quantity': Y}, ...] }

# --- Helper Functions ---
def get_product_by_id(product_id):
    return next((p for p in products if p["id"] == product_id), None)

# Decorator for requiring login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"status": "error", "message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- Product API Endpoints (existing) ---
@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = get_product_by_id(product_id)
    if product is None:
        abort(404, description="Product not found")
    return jsonify(product)

# --- User Authentication API Endpoints (existing) ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        abort(400, description="Missing username or password")
    username = data['username']
    if username in users_db:
        return jsonify({"status": "error", "message": "Username already exists"}), 409
    users_db[username] = generate_password_hash(data['password'])
    return jsonify({"status": "success", "message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        abort(400, description="Missing username or password")
    username = data['username']
    password = data['password']
    user_hash = users_db.get(username)
    if user_hash and check_password_hash(user_hash, password):
        session['user_id'] = username
        # Initialize cart if not present
        if username not in carts_db:
            carts_db[username] = []
        return jsonify({"status": "success", "user": {"username": username}})
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"status": "success", "message": "Logged out successfully"})

@app.route('/api/user/status', methods=['GET'])
def user_status():
    user_id = session.get('user_id')
    if user_id:
        return jsonify({"status": "loggedin", "user": {"username": user_id}})
    return jsonify({"status": "loggedout"})

# --- Shopping Cart API Endpoints ---
@app.route('/api/cart', methods=['GET'])
@login_required
def view_cart():
    user_id = session['user_id']
    user_cart_refs = carts_db.get(user_id, [])
    detailed_cart = []
    for item_ref in user_cart_refs:
        product = get_product_by_id(item_ref['product_id'])
        if product:
            detailed_cart.append({
                "product_id": product['id'],
                "name": product['name'],
                "price": product['price'],
                "image_url": product['image_url'],
                "quantity": item_ref['quantity']
            })
    return jsonify(detailed_cart)

@app.route('/api/cart/add', methods=['POST'])
@login_required
def add_to_cart_api():
    user_id = session['user_id']
    data = request.get_json()

    if not data or 'product_id' not in data or 'quantity' not in data:
        abort(400, description="Missing product_id or quantity")

    try:
        product_id = int(data['product_id'])
        quantity = int(data['quantity'])
    except ValueError:
        abort(400, description="Invalid product_id or quantity format.")

    if quantity <= 0:
        abort(400, description="Quantity must be positive.")

    product = get_product_by_id(product_id)
    if not product:
        abort(404, description="Product not found.")

    # Basic stock check (optional, can be made more robust)
    # if product['stock'] < quantity:
    #     return jsonify({"status": "error", "message": f"Not enough stock for {product['name']}. Available: {product['stock']}"}), 400

    user_cart = carts_db.setdefault(user_id, [])
    
    existing_item = next((item for item in user_cart if item['product_id'] == product_id), None)
    if existing_item:
        existing_item['quantity'] += quantity
    else:
        user_cart.append({'product_id': product_id, 'quantity': quantity})
    
    # product['stock'] -= quantity # Deduct stock if implementing stock control

    return jsonify({"status": "success", "message": f"{product['name']} added to cart.", "cart": user_cart})


@app.route('/api/cart/update', methods=['POST'])
@login_required
def update_cart_item():
    user_id = session['user_id']
    data = request.get_json()

    if not data or 'product_id' not in data or 'quantity' not in data:
        abort(400, description="Missing product_id or quantity")
    
    try:
        product_id = int(data['product_id'])
        quantity = int(data['quantity'])
    except ValueError:
        abort(400, description="Invalid product_id or quantity format.")

    if quantity < 0: # Allow 0 to remove
        abort(400, description="Quantity cannot be negative.")

    user_cart = carts_db.get(user_id, [])
    item_to_update = next((item for item in user_cart if item['product_id'] == product_id), None)

    if not item_to_update:
        abort(404, description="Item not found in cart.")

    if quantity == 0:
        user_cart.remove(item_to_update)
        message = "Item removed from cart."
    else:
        item_to_update['quantity'] = quantity
        message = "Cart updated."
        
    return jsonify({"status": "success", "message": message, "cart": user_cart})


@app.route('/api/cart/remove', methods=['POST'])
@login_required
def remove_from_cart_api():
    user_id = session['user_id']
    data = request.get_json()

    if not data or 'product_id' not in data:
        abort(400, description="Missing product_id")

    try:
        product_id = int(data['product_id'])
    except ValueError:
        abort(400, description="Invalid product_id format.")

    user_cart = carts_db.get(user_id, [])
    item_to_remove = next((item for item in user_cart if item['product_id'] == product_id), None)

    if not item_to_remove:
        abort(404, description="Item not found in cart.")

    user_cart.remove(item_to_remove)
    return jsonify({"status": "success", "message": "Item removed from cart.", "cart": user_cart})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
