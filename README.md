<div align="center">

# Akhi Lifestyle

**Customer storefront for an online accessories and lifestyle shop in Bangladesh.**

[![Live](https://img.shields.io/badge/live-akhilifestyle.com-e11d48?style=for-the-badge)](https://akhilifestyle.com)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2020.9-339933?logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/Live_chat-WebSocket-010101?logo=socketdotio&logoColor=white)
![PM2](https://img.shields.io/badge/Process-PM2-2B037A?logo=pm2&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)
![Built with Claude](https://img.shields.io/badge/Built_with-Claude-D97757?logo=anthropic&logoColor=white)

</div>

---

## Overview

This repository is the **customer-facing website**. Browsing, cart, checkout, order tracking, returns and live support chat all live here. Catalog, orders and payments are served by a separate FastAPI backend (`shop_backend`), and the shop is operated from a separate admin panel.

```
Customer website (this repo)  ──►  Backend API (FastAPI + PostgreSQL)  ◄──  Admin panel
akhilifestyle.com                  (Private API)            (Private Admin Panel)
```

## Features

### Shopping
- Home page with banner slider, best sellers, new arrivals and offers
- Shop and category pages with filters, sorting and pagination
- Product page with image gallery, colour selection, reviews, delivery info and related products
- Search with live suggestions, by product name or **Product code** (English and Bengali digits)
- Cart that works without login, plus a wishlist
- Checkout with address book, coupons and multiple payment methods: Cash on Delivery, bKash, Nagad, SSLCommerz

### After the order
- Live order tracking, plus guest tracking with an order or invoice number
- Invoice view, print and PDF download
- **Custom Invoice no.**: the shop can set its own number. If it does not, the site's automatic order number is shown
- Cancellation requests, returns with bKash refund details, and one-tap reorder
- Every return step (request, approval, pickup, refund) is visible live to the customer

### Account
- Passwordless OTP login
- Profile with photo, saved addresses, wishlist, reviews, payment history and notifications

### Support
- Floating chat icon: a compact chat window on desktop, the full support page on mobile
- Real-time chat with the shop over WebSocket, with image sharing from camera or gallery
- Messenger, WhatsApp and phone shortcuts

### Product code
- Every product can carry a short code (for example `405`)
- Shown on product cards, product page (with a copy button), cart, wishlist, order details and invoices
- Lets customers quote a product exactly when they message the shop
- Hidden when no code is set

### SEO and platform
- Per-page title, description, canonical URL and Open Graph tags
- Product and breadcrumb structured data (JSON-LD)
- Auto-generated `sitemap.xml` and `robots.txt`, private pages set to `noindex`
- Mobile bottom navigation and PWA manifest

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 |
| State | React Context (Auth, Cart, Wishlist, Toast) |
| Real-time | WebSocket, with polling fallback |
| Backend | FastAPI, PostgreSQL (separate repository) |
| Hosting | Linux server, Nginx, PM2 |
| CI/CD | GitHub Actions over SSH |

## Getting started

Requires **Node.js 20.9 or newer**.

```bash
git clone https://github.com/hasanalbannadev/akhilifestyle.git
cd akhilifestyle
npm install
cp .env.example .env.local     # then edit the values
npm run dev                    # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |

## Environment variables

Copy `.env.example` to `.env.local`. Variables starting with `NEXT_PUBLIC_` are exposed to the browser, so never put secrets in them.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL. Must end with `/api/v1`, without a trailing slash |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site (SEO, sitemap, link previews) |
| `NEXT_PUBLIC_SITE_NAME` | Shop name |
| `NEXT_PUBLIC_TAGLINE` | Shop tagline |
| `NEXT_PUBLIC_PHONE` | Contact phone number |
| `NEXT_PUBLIC_EMAIL` | Contact email |
| `NEXT_PUBLIC_ADDRESS` | Shop address |
| `NEXT_PUBLIC_FACEBOOK_URL` | Facebook page link |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Instagram link |
| `NEXT_PUBLIC_YOUTUBE_URL` | YouTube link |
| `NEXT_PUBLIC_MESSENGER_URL` | Messenger link, shown in the chat window and support page |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number, shown in the chat window and support page |

A social or chat link left empty hides its button.

## Backend requirements

The site needs the backend to be configured as follows:

- Set `FRONTEND_URL=https://akhilifestyle.com` in the backend `.env`. It controls CORS and is where SSLCommerz sends customers back after payment. `http://localhost:3000` is already allowed for local development.
- After payment, customers return to `/order/{order_no}?paid=1` or `?paid=0`.
- For real-time chat, the API's Nginx config must forward WebSocket upgrades (`Upgrade` and `Connection` headers). If it does not, chat falls back to polling and nothing breaks.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which connects to the server over SSH, pulls the latest code, installs dependencies, builds, and restarts the `akhi-customer` process in PM2. You can also run it manually from the **Actions** tab with **Run workflow**.

Add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `SERVER_HOST` | Server IP address |
| `SERVER_USER` | SSH user |
| `SERVER_PASSWORD` | SSH password |

> Never commit `.env.local`. It is already listed in `.gitignore`. Keep the production `.env.local` on the server only.

To host elsewhere, import the repository into Vercel and set the same environment variables, or run `npm run build && npm start` behind Nginx on any VPS.

## Project structure

```
src/
├─ app/              Routes, layouts, robots, sitemap, manifest
│  ├─ account/       Profile, orders, addresses, wishlist, returns, support
│  └─ product/       Product pages
├─ components/       ui · layout · home · product · cart · checkout · orders · account
├─ context/          Auth, Cart, Wishlist, Toast providers
├─ lib/
│  ├─ api/           One client per backend endpoint group
│  ├─ constants.ts   Labels, menus, filter ranges
│  ├─ site.ts        Shop details, read from environment variables
│  ├─ invoicePdf.ts  Invoice PDF generation
│  └─ realtime.ts    Live updates and chat connection
└─ types/            Shared TypeScript types
```

### Where to change things

| To change | Edit |
|---|---|
| Home page sections | `src/app/page.tsx` |
| Footer links and menus | `src/lib/constants.ts` |
| Promo banner text | `src/components/home/PromoBanner.tsx` |
| Colours and fonts (`brand-600` is the main pink) | `src/app/globals.css` |
| Shop name, phone, address | `.env.local` |
| Chat icon and compact window | `src/components/layout/ChatWidget.tsx` |

## Built with

Created and directed by Hasan Albanna (Flutter developer). The code was written with Claude (Anthropic).

## Notes

- Live chat, custom Invoice no. and Product code need the matching versions of the backend and admin panel. Updating only this repository will not enable them.
- Only customers with a delivered order can leave a review (enforced by the backend).
- Product codes are not included in SMS messages.

## License

All rights reserved. This is a private commercial project and may not be copied or reused without permission.
