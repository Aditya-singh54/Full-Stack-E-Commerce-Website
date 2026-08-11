# ShopSphere E-Commerce Application

ShopSphere is a premium, full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application. It features persistent database shopping carts, JWT authentication checks, and a tracking timeline order placement checkout system, topped with a visual control panel for administrators.

---

## 🛠️ Technology Stack
- **Frontend Layer**: React 18, React Router v6, Axios, and Vanilla CSS variables (glassmorphic layouts).
- **Backend Layer**: Node.js, Express, Mongoose ODM, JSON Web Token (JWT) auth, and Bcrypt encryption.
- **Database Layer**: MongoDB (NoSQL collection schemas).

---

## 📂 Project Architecture

```text
shopsphere/
├── backend/                  # RESTful API Backend
│   ├── config/               # Database config (db.js)
│   ├── controllers/          # Request logic (auth, product, cart, order, admin)
│   ├── middleware/           # Protect gates, admin verification, error middleware
│   ├── models/               # Mongoose schemas (User, Product, Cart, Order)
│   ├── routes/               # API route maps
│   ├── createAdmin.js        # Upgrade or register admin CLI helper
│   ├── seeder.js             # Inventory database catalog seeder
│   └── server.js             # Server root entry
├── frontend/                 # Vite + React Frontend
│   ├── src/
│   │   ├── components/       # Layout overlays & Protected Route gates
│   │   ├── context/          # React Contexts (AuthContext, CartContext)
│   │   ├── pages/            # View pages (Login, Register, Product Catalog, Details, Cart, Checkout, Confirm, History, Admin)
│   │   ├── App.jsx           # Main routing entry
│   │   ├── index.css         # Glassmorphic global styles
│   │   └── main.jsx          # DOM anchor
```

---

## ⚙️ Setting Up Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on `mongodb://localhost:27017/shopsphere`)

### 2. Bypass SSL Checks (Optional)
If your corporate network or firewall blocks packages with certificate errors (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`), run this in your root folder:
```bash
npm config set strict-ssl false
```
*(This creates local `.npmrc` files preventing installation blocks).*

### 3. Install Dependencies
Run from the root workspace directory to install all packages:
```bash
# In shopsphere root
npm install

# In backend directory
cd backend && npm install

# In frontend directory
cd ../frontend && npm install
```

### 4. Configure Environment Variables
Create a file named `.env` in the `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopsphere
JWT_SECRET=supersecretkey123
NODE_ENV=development
```

---

## 📊 Database Seeding & Setup

Run these utility commands inside the `/backend` directory to populate data:

### 1. Seed Product Inventory
Populate 25 products with image links and categories:
```bash
node seeder.js
```
*To wipe all products, you can run: `node seeder.js -d`.*

### 2. Seed Administrator Account
Create or upgrade an administrative account safely:
```bash
node createAdmin.js admin@shopsphere.com admin123
```
- **Login Email**: `admin@shopsphere.com`
- **Login Password**: `admin123`

---

## 🚀 Running the Application

### Option A: Simultaneous Runs (Root Directory)
Start both servers together using the root npm wrapper script:
```bash
# From shopsphere root folder
npm run dev
```

### Option B: Separate Terminal Tabs
You can also launch them independently:

1. **Start Backend (Port 5000)**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Start Frontend (Port 5173)**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🧪 Testing Verification Guides

### Customer Ordering Path:
1. Log in or Register a new user at `http://localhost:5173/login`.
2. Browse products, configure quantity pickers, and add products to your Cart.
3. Open Cart, click **Proceed to Checkout**, and fill out the delivery address.
4. Click **Place Order**. Confirm that your cart resets to 0.
5. Open the **Orders** link to trace the active fulfillment timeline!

### Administrator Path:
1. Log in with `admin@shopsphere.com` and `admin123`.
2. Click **Admin Panel** in the navbar header.
3. View stats counters, add new products, edit stock, or update customer order statuses.
