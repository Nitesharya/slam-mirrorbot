# Farm Fresh Web Application

This is a simple e-commerce web application for selling agricultural products.

## How to Run Locally

Follow these steps to run the application on your local machine:

1.  **Prerequisites:**
    *   Python 3.x installed on your system.
    *   `pip` (Python package installer) installed.

2.  **Navigate to the Application Directory:**
    Open your terminal or command prompt and change to this directory (replace `path/to/your/repository` with the actual path):
    ```bash
    cd path/to/your/repository/farm_fresh_web
    ```

3.  **Create a Virtual Environment (Recommended):**
    It's good practice to use a virtual environment to manage project dependencies. From within the `farm_fresh_web` directory:
    ```bash
    python -m venv venv
    ```
    Activate the virtual environment:
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    *   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
    Your terminal prompt will usually change to indicate the virtual environment is active.

4.  **Install Dependencies:**
    Install the required Python packages using the `requirements.txt` file:
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the Flask Application:**
    Execute the `app.py` script:
    ```bash
    python app.py
    ```
    You should see output indicating that the Flask development server is running, typically on `http://127.0.0.1:5000/`. The output will also likely mention that this is a development server and not for production use.

6.  **Access the Application:**
    Open your web browser and go to:
    [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

    This will load the `index.html` page. You can navigate to other pages using the links on the site, or by directly visiting URLs like:
    *   Products: [http://127.0.0.1:5000/products.html](http://127.0.0.1:5000/products.html)
    *   Cart: [http://127.0.0.1:5000/cart.html](http://127.0.0.1:5000/cart.html)

7.  **To Stop the Application:**
    Go back to your terminal where the Flask server is running and press `Ctrl+C`.

8.  **Deactivate Virtual Environment (When Done):**
    Once you're finished working with the application, you can deactivate the virtual environment by simply typing:
    ```bash
    deactivate
    ```
    This command works on Windows, macOS, and Linux.

---
*This application is currently under development. Features like checkout and persistent storage are not yet implemented.*
