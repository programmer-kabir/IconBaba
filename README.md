# 🚀 IconBaba — +5,000 Free Customizable Vector Icons

**IconBaba** is a full-stack, production-ready clone of [Iconiverse](https://iconiverse.app/), featuring an independent, modular architecture with a **Next.js 15 (TypeScript + Tailwind CSS)** frontend and a custom **PHP 8 + MySQL (PDO)** backend designed for local Windows/XAMPP environments.

---

## 🌟 Key Features

- **5,148 Icons & 10,296 Variants**: Complete MIT-licensed vector icon library categorized into 42 categories matching the reference website.
- **Outlined & Filled Styles**: Instant client-side switching between clean outlined stroke icons and solid filled variants.
- **Sticky Customization Toolbar**:
  - Live search across 5,000+ icons with instant debounced filtering.
  - Dynamic size selector (`16px`, `20px`, `24px`, `32px`, `48px`, `64px`, plus slider up to `96px`).
  - Color palette presets + custom hex color picker.
  - Stroke width stepper & slider (`1px` to `4px`).
  - Line Cap (`round`, `butt`, `square`) & Line Join (`round`, `bevel`, `miter`) selectors.
- **Interactive Icon Grid**:
  - Responsive layout (2 columns on mobile, up to 8 columns on desktop).
  - Sleek dark mode aesthetic with purple radial-gradient hover glow.
  - Infinite scroll / pagination loading.
- **Icon Detail Drawer**:
  - Large interactive canvas preview with pattern modes (**Checkerboard Pattern**, **Dark**, **Light**).
  - **Download SVG**: Exports clean, customized vector SVG file.
  - **Download PNG**: Renders customized SVG to an HTML5 canvas at target resolution and exports PNG file.
  - **Copy SVG**: Formats and copies raw SVG string to clipboard.
  - **Copy React JSX**: Converts SVG to a ready-to-use TypeScript React component.
  - **Share**: Web Share API with clipboard URL fallback.
  - **UI Examples Preview**: Shows the selected icon embedded in real-world UI components (Badge, Link, Button, Secondary Icon button).
- **Custom Authentication System (PHP + MySQL)**:
  - Custom token-based session authentication with `password_hash()` and `password_verify()`.
  - No third-party lock-in (zero Firebase/Supabase/NextAuth/Clerk).
  - Sign In and Register modal with real-time validation and persistent sessions.
  - User profile with statistics.
- **User Features**:
  - **Favorites**: Toggle favorite icons with database persistence.
  - **Collections**: Create custom icon sets, add/remove icons, delete collections.
  - **Download History**: Automatically tracks user downloads with format and size details.

---

## 📁 Project Structure

```
iconbaba/
├── frontend/                     # Next.js 15 + TypeScript + Tailwind CSS
│   ├── app/
│   │   ├── layout.tsx            # Root layout with Auth & Customization providers
│   │   ├── page.tsx              # Main Icon Explorer page
│   │   ├── favorites/            # Saved favorites view
│   │   ├── collections/          # Collections manager view
│   │   ├── history/              # Download history view
│   │   └── globals.css           # Global dark theme tokens & checkerboards
│   ├── components/
│   │   ├── header/SiteHeader.tsx # Logo, navigation, user menu, mobile toggle
│   │   ├── sidebar/CategorySidebar.tsx # 42 categories + Filled/Outlined tabs
│   │   ├── toolbar/ControlsToolbar.tsx # Search, size, color, stroke controls
│   │   ├── grid/IconGrid.tsx     # Responsive grid with radial hover glow
│   │   ├── drawer/IconDetailDrawer.tsx # Slide-over preview, download/copy & UI examples
│   │   ├── auth/AuthModal.tsx    # Sign In / Create Account modal
│   │   └── collections/AddToCollectionModal.tsx
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication state & session tokens
│   │   └── IconCustomizationContext.tsx # Live icon styling state
│   ├── lib/
│   │   ├── api.ts                # Typed REST client with automatic Bearer tokens
│   │   └── svg-utils.ts          # SVG parsing, JSX generator, PNG canvas exporter
│   ├── types/icon.ts             # Complete TypeScript interfaces
│   └── package.json
│
├── backend/                      # PHP 8.2 + MySQL REST API (XAMPP compatible)
│   ├── config/
│   │   ├── database.php          # PDO connection (utf8mb4, emulated prepares off)
│   │   └── cors.php              # Strict CORS headers for localhost:3000
│   ├── helpers/
│   │   ├── response.php          # Standardized JSON response helper
│   │   ├── auth.php              # Session token verification & requireAuth
│   │   └── validator.php         # Input sanitization and validators
│   └── api/
│       ├── auth/                 # register.php, login.php, logout.php, me.php, update.php
│       ├── categories/           # list.php
│       ├── icons/                # list.php, single.php
│       ├── favorites/            # list.php, add.php, remove.php, check.php
│       ├── collections/          # list.php, create.php, single.php, add_item.php, remove_item.php, delete.php
│       └── downloads/            # log.php, history.php
│
├── database/
│   ├── schema.sql                # Complete MySQL schema (tables, keys, indexes)
│   ├── seed.sql                  # 42 categories + 5,148 icons + 10,296 variants
│   └── generate_seed.js          # Generator script from @tabler/icons
│
└── README.md
```

---

## 🛠️ Local Development & Setup

### 1. Requirements
- **Windows** OS with **XAMPP** installed at `C:\xampp`
- **PHP 8.0+** (included in XAMPP: `C:\xampp\php\php.exe`)
- **MySQL 5.7+ / MariaDB 10.4+** (included in XAMPP: `C:\xampp\mysql\bin\mysql.exe`)
- **Node.js 18+** & **npm**

### 2. XAMPP Configuration
1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. The project directory `c:\Users\DAYALGURU\Desktop\KABIR\iconbaba` is linked into XAMPP `htdocs` via a directory junction:
   ```cmd
   C:\xampp\htdocs\iconbaba -> c:\Users\DAYALGURU\Desktop\KABIR\iconbaba
   ```
3. Backend APIs are immediately accessible at:
   ```
   http://localhost/iconbaba/backend/api/
   ```

### 3. Database Import
The database `iconbaba` has already been created and seeded. If you need to re-import:
```powershell
Get-Content database/schema.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root iconbaba
Get-Content database/seed.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root iconbaba
```

### 4. Running the Frontend
1. Open a terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔑 Demo Account Credentials

A pre-configured demo user is seeded for testing:
- **Email**: `demo@iconbaba.com`
- **Username**: `demo`
- **Password**: `password123`
- Pre-populated with sample favorites and a custom icon collection.

---

## 🔒 Security Measures

- **PDO Prepared Statements**: 100% parameter-bound queries preventing SQL injection.
- **Secure Password Hashing**: Native `password_hash()` and `password_verify()` with `PASSWORD_BCRYPT`.
- **Session Tokens**: Cryptographically secure 64-character hex tokens with expiration and user-agent tracking.
- **CORS Protection**: Restricted to `http://localhost:3000` with credential support.
- **Input Validation & Sanitization**: Comprehensive validation on all user inputs.
