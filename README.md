# <div align="center">Amazon Clone</div>

### <div align="center">A fully functional E-commerce website</div><br>

This is a clone of the well-known e-commerce website Amazon. Customers can browse products and make purchases. It offers a sign in/sign up feature that keeps track of the user's cart and purchases. It was built with React on the frontend, Node and Express on the backend, and MySQL for data storage.

## Features 📃
<ul>
  <li>User Sign up / Sign in</li>
  <li>Logout from your account</li>
  <li>Browse and search products</li>
  <li>Filter products by category</li>
  <li>Check profile and order history</li>
  <li>Cart:</li>
  <ul>
    <li>Add multiple products</li>
    <li>Update product quantities</li>
    <li>Remove products</li>
  </ul>
  <li>Checkout with shipping address</li>
  <li>Order confirmation and tracking</li>
</ul>

## Technology Used 💻
<ul>
  <li><strong>IDE:</strong> Visual Studio Code</li>
  <li><strong>Frontend:</strong> React.js, Material UI, Bootstrap</li>
  <li><strong>Backend:</strong> Express.js</li>
  <li><strong>Database:</strong> MySQL (Sequelize ORM)</li>
  <li><strong>Runtime Environment:</strong> Node.js</li>
  <li><strong>HTTP Client:</strong> Axios</li>
  <li><strong>Authentication:</strong> JWT (JSON Web Tokens)</li>
  <li><strong>Version Control:</strong> Git</li>
  <li><strong>Deployment:</strong> Vercel</li>
</ul>

---

## 🚀 Deployment Guide

**📖 For detailed step-by-step deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

Quick overview:
- **Frontend & Backend:** Deployed separately on Vercel (free tier)
- **Database:** TiDB Cloud (free MySQL-compatible database)

---

## Local Development 👨‍💻

### Prerequisites
- Node.js (v18 or higher)
- MySQL database (local or cloud)

### Environment Variables

Create a `.env` file in the `backend` directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=amazon_clone
DB_USER=root
DB_PASSWORD=your_password
SECRET_KEY=your_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### To start the backend server
```shell
cd backend
npm install
npm run seed    # Seed the database with sample products
npm run dev     # Start with nodemon (auto-reload)
# or
npm start       # Start normally
```
The server is now running at http://localhost:8000/

### To start the frontend
```shell
cd frontend
npm install
npm start
```
The frontend is now running at http://localhost:3000/

---

## API Endpoints 📡

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/categories` | Get all categories | No |
| GET | `/api/product/:id` | Get single product | No |
| POST | `/api/register` | Register user | No |
| POST | `/api/login` | Login user | No |
| GET | `/api/logout` | Logout user | Yes |
| GET | `/api/getAuthUser` | Get current user | Yes |
| GET | `/api/cart` | Get user's cart | Yes |
| POST | `/api/addtocart/:id` | Add to cart | Yes |
| PUT | `/api/cart/:id` | Update cart item | Yes |
| DELETE | `/api/delete/:id` | Remove from cart | Yes |
| POST | `/api/order` | Place order | Yes |
| GET | `/api/orders` | Get user's orders | Yes |
| GET | `/api/order/:orderId` | Get single order | Yes |

---

## Project Structure 📁

```
Amazon/
├── backend/                # Express.js API server
│   ├── constant/          # Product data
│   ├── database/          # Database connection
│   ├── middleware/        # Authentication middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   ├── package.json
│   └── vercel.json        # Backend Vercel config
├── frontend/              # React application
│   ├── public/            # Static files & images
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js         # Main app component
│   ├── package.json
│   └── vercel.json        # Frontend Vercel config
├── .gitignore
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── README.md
```

---

## License 📝

This project is for educational purposes only.
