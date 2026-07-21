# Karawang Cafe & Coffeeshop Directory

Aplikasi web untuk mengumpulkan dan membagikan informasi tentang cafe dan coffeeshop di Karawang.

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Supabase Auth
- **Hosting:** Vercel

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd cafe_and_coffeshop_karawang
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/karawang_cafe?schema=public
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### 4. Setup database

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Admin Panel

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin dashboard.

## Features

### User Features
- Browse cafes in Karawang
- Filter by category (WFH, nongkrong, keluarga)
- View cafe details and menu
- Submit reviews and ratings
- Bookmark favorite cafes
- View map of all cafes

### Admin Features
- Manage cafes (CRUD)
- Moderate reviews
- View anomaly alerts
- Blacklist suspicious users
- Upload cafe photos

## API Endpoints

### Cafes
- `GET /api/cafes` - List all cafes with filters
- `GET /api/cafes/[id]` - Get cafe details
- `POST /api/cafes` - Create new cafe (admin only)
- `GET /api/cafes/categories` - Get all categories
- `GET /api/cafes/tags` - Get all tags

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List reviews for cafe

### Authentication
- `GET /api/auth/me` - Get current user

### Upload
- `POST /api/upload` - Upload cafe photos

### Anomalies
- `POST /api/anomalies` - Check review anomaly
- `GET /api/anomalies` - List suspicious reviews

## Development

### Build for production

```bash
npm run build
npm start
```

### Run tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Project Structure

```
cafe_and_coffeshop_karawang/
+-- app/
Ã¯Â¿Â½   +-- api/              # API routes
Ã¯Â¿Â½   Ã¯Â¿Â½   +-- auth/
Ã¯Â¿Â½   Ã¯Â¿Â½   +--cafes/
Ã¯Â¿Â½   Ã¯Â¿Â½   +-- reviews/
Ã¯Â¿Â½   Ã¯Â¿Â½   +-- bookmarks/
Ã¯Â¿Â½   Ã¯Â¿Â½   +-- upload/
Ã¯Â¿Â½   Ã¯Â¿Â½   +-- anomalies/
Ã¯Â¿Â½   +-- admin/            # Admin panel
Ã¯Â¿Â½   +-- layout.tsx
Ã¯Â¿Â½   +-- page.tsx
Ã¯Â¿Â½   +-- globals.css
+-- lib/
Ã¯Â¿Â½   +-- supabase.ts
Ã¯Â¿Â½   +-- prisma.ts
+-- prisma/
Ã¯Â¿Â½   +-- schema.prisma
+-- .env.example
+-- package.json
+-- tsconfig.json
+-- tailwind.config.js
```

## Future Improvements

- Google Maps integration
- Image upload with Supabase Storage
- Real-time updates with Supabase Realtime
- Advanced search with full-text search
- Mobile app version

## License

MIT

### OAuth Login

Login dan register memakai Supabase OAuth Google atau Discord melalui `/auth/callback`.

1. Aktifkan provider Google dan Discord di Supabase Dashboard > Authentication > Providers.
2. Google callback: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Discord callback: `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Local app callback: `http://localhost:3000/auth/callback`.
5. Tambahkan production callback URL sesuai domain deployment.
