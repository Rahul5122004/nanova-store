# NANOVA – Premium Dual-Brand E-Commerce & Business Automation Platform

A complete, production-ready, fully functional full-stack dual-brand e-commerce and centralized enterprise business automation platform built for **NANOVA**.

---

## 🌟 Executive Summary & Brand Identity

**NANOVA** operates two distinct commercial brands managed under a single unified administration:

| Brand | Category | Tagline | Official Phone | WhatsApp | Instagram |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NANOVA TEES** | Streetwear & Fashion | *WEAR YOUR VIBE.* | `6382092001` | [wa.me/916382092001](https://wa.me/916382092001) | [@surprise_nova_11.11](https://www.instagram.com/surprise_nova_11.11/) |
| **SURPRISE NANOVA** | Luxury & Customized Gifts | *MAKE EVERY MOMENT SPECIAL.* | `89035 41632` | [wa.me/918903541632](https://wa.me/918903541632) | [@surprise_nova_11.11](https://www.instagram.com/surprise_nova_11.11/) |

### Core Branding Rule
- Both brands share the signature **geometric "N"-shaped logo symbol**.
- **Nanova Tees** maintains an edgy, luxury streetwear aesthetic (monochrome black/white with cyan cyberpunk accents).
- **Surprise Nanova** features a warm, celebratory luxury gifting aesthetic (midnight black with metallic gold accents).
- Both storefronts are distinct, isolated shopping experiences with dedicated shopping carts, while the business owner controls operations from a single centralized admin dashboard (`/admin`).

---

## 🚀 Key Platform Features

### 1. Main Landing Portal
- **3D Split Hero**: Interactive real-time 3D experience showcasing a rotating streetwear garment and an animated glowing gift box.
- **Brand Portals**: Instant one-click gateways into either *Nanova Tees* or *Surprise Nanova*.
- **Unified Navigation**: Responsive navbar with dual-brand quick switching, real-time cart drawer, order tracking search, and contact links.

### 2. Nanova Tees Storefront
- **3D Interactive T-Shirt Studio**: Built with Three.js and React Three Fiber. Allows customers to interact with realistic 3D garment geometry, rotate 360°, inspect front and back custom textures, zoom, and test different sizes.
- **Size-Isolated Inventory**: Stock is strictly tracked per variant (**Product + Size + Colour**). Selecting size `L` checks and displays only size `L` availability (e.g. S, M, L, XL, XXL).
- **Streetwear Categories**: Oversized T-Shirts, Regular Fit T-Shirts, Printed T-Shirts, Custom T-Shirts, New Arrivals, Best Sellers.

### 3. Surprise Nanova Storefront
- **3D Animated Gift Box**: Interactive 3D gift box with an opening lid, velvet interior, satin ribbons, and particle sparkle effects.
- **Bespoke Personalization**: Customization fields allow customers to enter personalized recipient names, occasion dates, and personal messages for hampers and exploding boxes.
- **Gifting Categories**: Birthday Gifts, Anniversary Gifts, Couple Gifts, Personalized Gifts, Gift Hampers, Surprise Boxes, Customized Gifts, Special Occasion Gifts.

### 4. Seamless Shopping Cart & Checkout
- **Registration-Free Checkout**: Customers can browse, configure variants, and order directly without mandatory account registration.
- **Order Tracking**: Real-time order lookup portal (`/track-order`) using unique Order ID (e.g. `NAN-2026-0001`) and mobile number.
- **Configurable UPI QR Code Payment**:
  - Displays dynamic UPI QR code with configurable bank account information.
  - Customer enters UPI Reference / UTR ID and can optionally upload a payment screenshot.
  - Manual verification queue: Admin reviews screenshot and reference before approving.
  - Cash on Delivery (COD) toggle support.
- **PDF Tax Invoices**: Automated PDF generation via PDFKit with Indian Rupee formatting (`₹`), logos, tax breakdown, and seller credentials.

### 5. Centralized Admin Dashboard (`/admin`)
21 Dedicated Management Views:
1. **Overview Dashboard**: Real-time KPI counters, revenue, profit metrics, and recent orders.
2. **Product Catalog**: Add, edit, upload front/back artwork, manage pricing and sizes.
3. **Inventory Management**: Real-time stock matrix per Product + Size + Colour.
4. **Stock History & Audit**: Immutable logs of purchases, sales, adjustments, and returns.
5. **Suppliers**: Vendor database with contact information and balance tracking.
6. **Purchases / Inwarding**: Record vendor stock purchases with unit cost and additional expenses.
7. **Order Management**: Full lifecycle management (`NEW`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
8. **Payment Verification**: Manual queue for reviewing UPI UTR IDs and screenshot proofs.
9. **QR Payment Settings**: Upload new UPI QR codes, set account holder names and instructions.
10. **Expense Tracker**: Record operational overhead (marketing, rent, packaging, shipping, utilities).
11. **Profit & Loss Engine**:
    - `Gross Profit = Sales Revenue - Cost of Goods Sold (COGS for sold products only)`
    - `Net Profit = Gross Profit - Operating Expenses`
    - Available Unsold Inventory recorded as an asset, NOT expensed prematurely!
12. **Analytics & Sales Reports**: Graphical charts powered by Recharts.
13. **Excel Export Engine**: Multi-tab `.xlsx` downloads for Sales, Inventory, and P&L.
14. **Customer CRM**: Customer purchase history and lifetime spend tracking.
15. **Notifications**: Real-time Socket.IO alerts with browser audio chimes for new orders and low stock.
16. **Business Settings & Contacts**: Edit official phone numbers, WhatsApp, and Instagram links.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, React Three Drei, Lucide React, Recharts, Socket.IO Client, Canvas Confetti |
| **Backend** | Node.js (ES Modules), Express.js, Socket.IO, JWT, bcryptjs, Multer, ExcelJS, PDFKit, Nodemailer |
| **Database** | MySQL 8.0 (`nanova_ecommerce.sql`) + Built-in SQLite 3 (`server/data/nanova.sqlite`) auto-adapter |

---

## 📂 Project Structure

```
Surprise Nova/
├── nanova_ecommerce.sql        # Full MySQL 8.0 Relational DDL (20 Tables)
├── package.json                # Root orchestration scripts
├── README.md                   # Complete platform documentation
├── client/                     # Frontend Single Page Application
│   ├── public/                 # Static assets, SVG logos, QR images
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/             # TshirtCanvas.jsx, GiftBoxCanvas.jsx, Hero3DScene.jsx
│   │   │   ├── admin/          # AdminLayout.jsx (21 sidebar items)
│   │   │   ├── common/         # Navbar.jsx, Footer.jsx, CartDrawer.jsx, Logo.jsx
│   │   │   └── storefront/     # ProductCard.jsx, InstagramGallery.jsx, ContactSection.jsx
│   │   ├── context/            # AuthContext.jsx, CartContext.jsx, SocketContext.jsx
│   │   ├── pages/              # Home, TeesStore, GiftsStore, ProductDetail, Checkout, TrackOrder, etc.
│   │   │   └── admin/          # 15+ comprehensive admin management pages
│   │   ├── App.jsx             # React router configuration
│   │   └── index.css           # Tailwind design tokens & animations
│   ├── vite.config.js          # API proxy to backend port 5000
│   └── package.json
└── server/                     # Backend API & Automation Engine
    ├── data/                   # SQLite auto-storage (nanova.sqlite)
    ├── uploads/                # User uploads (products, QR, screenshots, invoices)
    ├── src/
    │   ├── config/             # Environment & database config
    │   ├── db/                 # Dual database engine adapter (MySQL + SQLite fallback)
    │   ├── middleware/         # JWT Auth & Multer upload middleware
    │   ├── routes/             # 12 Modular REST route handlers
    │   ├── services/           # PDFKit Invoices, ExcelJS Reports, Socket.IO Notifications
    │   └── index.js            # Express server bootstrap & WebSocket server
    ├── test_e2e.js             # Automated 10-module verification test suite
    └── package.json
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or later (LTS recommended)
- **npm**: `v9.0.0` or later

### 2. Installation
From the root repository directory:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 3. Database Initialization & Seeding
The database comes pre-seeded with sample inventory, suppliers, dual brands, and superadmin credentials. To re-seed at any time:
```bash
npm run seed
```

### 4. Running Automated Verification Suite
Run the 10-module automated test suite:
```bash
npm run test:e2e
```
*Tests verified:*
1. Database schema & table relational integrity (20 tables)
2. Dual-brand identity & contact numbers (`6382092001` & `89035 41632`)
3. Superadmin authentication & bcrypt token security
4. Product catalog & size/colour variant isolation (S, M, L, XL, XXL)
5. Order placement, variant-level stock deduction & audit logging
6. Branded PDF tax invoice generation with Indian Rupee formatting (`₹`)
7. Configurable QR payment system & manual verification queue
8. Excel reports generation (.xlsx) for Sales, Inventory, and P&L
9. Strict P&L accounting formulas (`Gross Profit = Sales - COGS`, `Net Profit = Gross - Expenses`)
10. Order cancellation & safe single-stock restoration

### 5. Running the Application Locally

#### Terminal 1: Start Backend API
```bash
npm run server
# Running on http://localhost:5000
```

#### Terminal 2: Start Frontend Application
```bash
npm run client
# Running on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 🔐 Administrator Access

- **Admin URL**: `http://localhost:5173/admin`
- **Default Username**: `admin`
- **Default Password**: `NanovaAdmin@2026`

*(Admin credentials can be changed immediately after login via Admin -> Profile).*

---

## 💾 Production Database Setup (MySQL)

By default, the platform boots instantly using its SQLite engine. To connect to an external production MySQL 8.0 server:
1. Import `nanova_ecommerce.sql` into your MySQL instance:
   ```bash
   mysql -u root -p < nanova_ecommerce.sql
   ```
2. Update `server/.env`:
   ```env
   DB_CLIENT=mysql
   DB_HOST=your-mysql-host
   DB_PORT=3306
   DB_USER=your-mysql-user
   DB_PASSWORD=your-mysql-password
   DB_NAME=nanova_ecommerce
   ```
3. Restart backend with `npm run server`.

---

## 📄 License & Attribution
Designed and built for **NANOVA** (Nanova Tees & Surprise Nanova). All rights reserved.
