# 🚀 Complete Deployment Guide - Amazon Clone on Vercel

This guide will walk you through deploying your Amazon Clone application (React frontend + Express.js backend) on **Vercel** with a **free MySQL database**.

## 📁 Project Structure

```
Amazon/
├── backend/          # Express.js API server
│   ├── constant/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── package.json
│   └── vercel.json
├── frontend/         # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── .gitignore
└── README.md
```

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Set Up Free MySQL Database (TiDB Cloud)](#2-set-up-free-mysql-database-tidb-cloud)
3. [Push Code to GitHub](#3-push-code-to-github)
4. [Deploy Backend on Vercel](#4-deploy-backend-on-vercel)
5. [Deploy Frontend on Vercel](#5-deploy-frontend-on-vercel)
6. [Seed Database with Products](#6-seed-database-with-products)
7. [Test Your Deployment](#7-test-your-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have:

- ✅ A **GitHub account** (free) - [Sign up here](https://github.com/signup)
- ✅ A **Vercel account** (free) - [Sign up here](https://vercel.com/signup) (use GitHub to sign up)
- ✅ A **TiDB Cloud account** (free) - [Sign up here](https://tidbcloud.com/) (for MySQL database)
- ✅ **Git** installed on your computer - [Download here](https://git-scm.com/downloads)
- ✅ **Node.js** installed (v18 or higher) - [Download here](https://nodejs.org/)

---

## 2. Set Up Free MySQL Database (TiDB Cloud)

TiDB Cloud offers a **FREE** MySQL-compatible database (5GB storage, perfect for small projects).

### Step 2.1: Create TiDB Cloud Account

1. Go to [https://tidbcloud.com/](https://tidbcloud.com/)
2. Click **"Start Free"** or **"Sign Up"**
3. Sign up with your Google account or email
4. Verify your email if required

### Step 2.2: Create a Free Cluster

1. After logging in, click **"Create Cluster"**
2. Select **"Serverless"** (this is the FREE tier)
3. Choose a **Cluster Name** (e.g., `amazon-clone-db`)
4. Select a **Region** closest to you (e.g., `US-East-1` or `Asia-Singapore`)
5. Click **"Create"** - wait 1-2 minutes for the cluster to be ready

### Step 2.3: Set Up Database Password

1. Once the cluster is ready, click on it
2. Go to **"Overview"** tab
3. Click **"Connect"** button (top right)
4. Click **"Generate Password"** or **"Reset Password"**
5. **⚠️ IMPORTANT: Copy and save this password somewhere safe!** You won't see it again.

### Step 2.4: Get Connection Details

1. In the **"Connect"** dialog, select **"General"** connection method
2. You'll see connection details like:
   ```
   Host: gateway01.us-east-1.prod.aws.tidbcloud.com
   Port: 4000
   User: xxxxxxxxx.root
   Database: test
   ```
3. **Save these details** - you'll need them later

### Step 2.5: Create Your Database

1. In TiDB Cloud, go to **"SQL Editor"** (left sidebar) or **"Chat2Query"**
2. Run this SQL command to create your database:
   ```sql
   CREATE DATABASE amazon_clone;
   ```
3. Click **"Run"**

---

## 3. Push Code to GitHub

### Step 3.1: Create a GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Enter a **Repository name** (e.g., `amazon-clone`)
3. Keep it **Public** (or Private if you prefer)
4. **DON'T** initialize with README (we already have code)
5. Click **"Create repository"**

### Step 3.2: Push Your Code

Open terminal in your project folder and run these commands:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Amazon Clone with separate frontend and backend"

# Add your GitHub repository as remote (replace with YOUR repo URL)
git remote add origin https://github.com/YOUR_USERNAME/amazon-clone.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## 4. Deploy Backend on Vercel

### Step 4.1: Import Project to Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Find your `amazon-clone` repository and click **"Import"**

### Step 4.2: Configure Backend Deployment

1. **Project Name**: `amazon-clone-backend` (or any name you like)
2. **Framework Preset**: Select **"Other"**
3. **Root Directory**: Click **"Edit"** and type `backend`
4. **Build & Output Settings**: Leave as default

### Step 4.3: Add Environment Variables

Click on **"Environment Variables"** and add these one by one:

| Name | Value |
|------|-------|
| `DB_HOST` | `gateway01.us-east-1.prod.aws.tidbcloud.com` (your TiDB host) |
| `DB_PORT` | `4000` |
| `DB_NAME` | `amazon_clone` |
| `DB_USER` | `your_username.root` (from TiDB) |
| `DB_PASSWORD` | `your_password` (from TiDB) |
| `SECRET_KEY` | `any_long_random_string_here_123456` |
| `NODE_ENV` | `production` |

### Step 4.4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Once done, you'll get a URL like: `https://amazon-clone-backend.vercel.app`
4. **Save this URL!** You'll need it for the frontend.

### Step 4.5: Test Backend

Open your browser and go to:
```
https://amazon-clone-backend.vercel.app/api/products
```

You should see an empty array `[]` (products will be added after seeding).

---

## 5. Deploy Frontend on Vercel

### Step 5.1: Create New Project for Frontend

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Find your same `amazon-clone` repository and click **"Import"**

### Step 5.2: Configure Frontend Deployment

1. **Project Name**: `amazon-clone-frontend` (or any name you like)
2. **Framework Preset**: Should auto-detect **"Create React App"**
3. **Root Directory**: Click **"Edit"** and type `frontend`
4. **Build Command**: `npm run build` (should be auto-filled)
5. **Output Directory**: `build` (should be auto-filled)

### Step 5.3: Add Environment Variables

Click on **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://amazon-clone-backend.vercel.app/api` |

**⚠️ Replace with YOUR actual backend URL from Step 4.4!**

### Step 5.4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Once done, you'll get a URL like: `https://amazon-clone-frontend.vercel.app`

---

## 6. Seed Database with Products

### Step 6.1: Update Backend CORS Setting

After getting your frontend URL, go back to your **backend project** on Vercel:

1. Go to Vercel Dashboard → Select your backend project
2. Go to **"Settings"** → **"Environment Variables"**
3. Add: `CLIENT_URL` = `https://amazon-clone-frontend.vercel.app`
4. Go to **"Deployments"** tab
5. Click the three dots on the latest deployment → **"Redeploy"**

### Step 6.2: Seed Products Locally

To add products to your database:

1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` folder with your TiDB credentials:
   ```env
   DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
   DB_PORT=4000
   DB_NAME=amazon_clone
   DB_USER=your_username.root
   DB_PASSWORD=your_tidb_password
   SECRET_KEY=any_random_string
   NODE_ENV=production
   ```

4. Run the seed command:
   ```bash
   npm run seed
   ```

You should see:
```
MySQL Database Connected Successfully
Starting database seeding...
Products inserted successfully!
Total products seeded: 22
```

---

## 7. Test Your Deployment

### Test Everything

1. Open your frontend URL: `https://amazon-clone-frontend.vercel.app`
2. Try these features:
   - ✅ View products on homepage
   - ✅ Search for products
   - ✅ Filter by category
   - ✅ Register a new account
   - ✅ Login with your account
   - ✅ Add products to cart
   - ✅ Checkout and place order
   - ✅ View order history

---

## 8. Troubleshooting

### Problem: "Database connection failed"

**Solution:**
- Check your TiDB credentials are correct
- Verify the database `amazon_clone` exists in TiDB
- Make sure `NODE_ENV=production` is set in environment variables

### Problem: "CORS error" in browser

**Solution:**
- Make sure `CLIENT_URL` environment variable is set in backend
- The URL should match your frontend exactly (no trailing slash)
- Redeploy the backend after adding the variable

### Problem: "API not found" or 404 errors

**Solution:**
- Check that `REACT_APP_API_URL` is correctly set in frontend
- Make sure the URL ends with `/api` (e.g., `https://backend.vercel.app/api`)
- Redeploy frontend after changing environment variables

### Problem: "Login not working" / Cookies not saving

**Solution:**
- This is handled automatically - cookies are configured for cross-origin
- Make sure both frontend and backend are deployed on HTTPS (Vercel does this)

### Problem: Products not showing

**Solution:**
- Run the seed command locally with cloud database credentials
- Check if `/api/products` endpoint returns data

---

## 📝 Quick Reference - Your URLs

After deployment, save these URLs:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-frontend.vercel.app` |
| **Backend** | `https://your-backend.vercel.app` |
| **API Base** | `https://your-backend.vercel.app/api` |
| **TiDB Cloud** | `https://tidbcloud.com/` |

---

## 🎉 Congratulations!

Your Amazon Clone is now live on the internet! Share your frontend URL with friends and family.

### Next Steps (Optional):
- Add a custom domain in Vercel settings
- Set up automatic deployments (already enabled by default)
- Monitor your usage in Vercel and TiDB dashboards

---

## 📞 Need Help?

- **Vercel Documentation**: https://vercel.com/docs
- **TiDB Cloud Documentation**: https://docs.pingcap.com/tidbcloud
- **Sequelize Documentation**: https://sequelize.org/docs/v6/

---

## Local Development

### Run Backend Locally
```bash
cd backend
npm install
npm run dev
```
Backend runs at http://localhost:8000

### Run Frontend Locally
```bash
cd frontend
npm install
npm start
```
Frontend runs at http://localhost:3000

---

*Created for Amazon Clone Project - Last Updated: January 2026*
