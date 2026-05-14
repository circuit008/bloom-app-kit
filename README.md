# 🛡️ POD Guard - Pre-Launch Compliance Suite

A comprehensive validation platform for Print-on-Demand sellers to check designs for IP risks, accessibility compliance, print quality, and supply chain transparency.

## 🌟 Features

| Feature | Description | Revenue Stream |
|---------|-------------|----------------|
| **IP Copyright Check** | Scans design keywords against trademark database | Affiliate (legal services) |
| **Accessibility Compliance** | WCAG contrast ratio & colorblind simulation | Ads (legal/edu) |
| **Print Quality Validator** | Resolution, DPI, color profile checks | Affiliate (printers) |
| **Supply Chain Transparency** | Eco-certified printer recommendations | Affiliate commissions |

## 💰 Revenue Model

1. **Affiliate Commissions** (10-20% per printer referral)
2. **Display Ads** (Google AdSense on results pages)
3. **Lead Generation** (Sell qualified leads to printers)
4. **Premium Reports** ($9.99 one-time PDF export)

## 🏗️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Shadcn UI
- **Backend:** Supabase (Auth, Database, Storage)
- **Image Processing:** HTML5 Canvas API (Client-Side)
- **Deployment:** Localhost + GitHub + Vercel

## 🚀 Local Setup


Clone the repository:

```bash
git clone https://github.com/circuit008/bloom-app-kit.git
cd bloom-app-kit
```

Install dependencies:

```bash
npm install
```

## 🔑 Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

You can get these values from:

Supabase Dashboard → Settings → API

## 🗄️ Supabase Setup

1. Create a new Supabase project (Check the Supabase_setting folder for the database setup)
2. Run the required SQL schema/migrations
3. Enable Authentication providers if needed (Google OAuth, Email, etc.)
4. Add localhost URL in:

Authentication → URL Configuration

Example:

```txt
http://localhost:5173/**
```

## ▶️ Run the Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```
