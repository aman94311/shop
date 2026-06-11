# 🏗️ ABHI SANITARY AND HARDWARE
## B2B/B2C Catalog & WhatsApp Quotation Website

A full-stack MERN application for **Abhi Sanitary and Hardware** — browse product pricing, build a material list, and send a formatted inquiry directly to WhatsApp.

---

## 📁 Project Structure

```
shop/
├── backend/      → Node.js + Express + MongoDB API
└── frontend/     → React + Vite + Tailwind CSS
```

---

## ⚙️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
# Copy env file and fill in your MongoDB URI
copy .env.example .env
# (MONGO_URI and WHATSAPP_NUMBER are already set)

npm install
npm run dev
# Runs at: http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
# .env is already configured with your WhatsApp number
npm install
npm run dev
# Runs at: http://localhost:5173
```

---

## 🔑 Environment Variables

### backend/.env
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | Your MongoDB connection string |
| `WHATSAPP_NUMBER` | Shop WhatsApp: `919142591239` |
| `FRONTEND_URL` | Frontend origin for CORS |

### frontend/.env
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL |
| `VITE_WHATSAPP_NUMBER` | `919142591239` |
| `VITE_SHOP_NAME` | `ABHI SANITARY AND HARDWARE` |

---

## 📦 Features

- 🎨 **Asian Paints** catalog — 12 items
- 🚰 **Sanitary Pipes & Fittings** — 18 items  
- 🔨 **General Hardware** — 14 items
- **Filter pills** — instantly show/hide categories
- **+ Add to List** — appends product to quotation textarea + auto-scrolls
- **Floating badge** — shows count of items added to list
- **WhatsApp form** — Hindi-formatted message sent via `wa.me` deep link
- **Backend logging** — every inquiry saved to MongoDB (future admin panel ready)
- 📱 Fully **mobile responsive**

---

## 🛒 Editing the Catalog

All products are in one file:
```
frontend/src/data/catalog.js
```

Each item has: `id`, `category`, `name`, `price`, `unit`, `description`, `tag`

---

## 📲 WhatsApp Message Format

```
*--- नया कोटेशन अनुरोध ---*

*नाम:* Customer Name
*फ़ोन:* 9876543210
*पता:* Site Address

*सामान की लिस्ट:*
- CPVC Pipe ½" 6m: 
- Asian Paints Tractor 20L: 

_via Abhi Sanitary & Hardware Catalog_
```

---

## 🚀 Production Deployment

- **Frontend**: Deploy `frontend/` to Vercel / Netlify
- **Backend**: Deploy `backend/` to Railway / Render / DigitalOcean
- Update `VITE_API_URL` and `FRONTEND_URL` in respective `.env` files
