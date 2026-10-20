# 🎮 Game Arena

A modern browser gaming platform with 10 exciting games, leaderboards, profiles, and dark mode. Built with Next.js, Supabase, and Tailwind CSS.

![Game Arena](https://img.shields.io/badge/Games-10-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## 🎯 Features

- **10 Browser Games**: Tic Tac Toe, Snake, Memory Match, Whack-a-Mole, Typing Speed, Math Quiz, Color Match, Reaction Time, Puzzle Slider, Minesweeper
- **Username/Password Auth**: Simple account creation — no email required (Supabase email confirmation must be disabled)
- **Leaderboards**: Global and per-game rankings
- **User Profiles**: Avatar upload, display name, bio, game stats
- **Dark Mode**: Full dark/light theme toggle
- **Settings**: Profile editing, password change, account deletion
- **Responsive**: Works on desktop and mobile
- **Score Tracking**: All scores saved and ranked

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Hosting**: Vercel
- **Icons**: Lucide React

## 🚀 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/game-arena.git
cd game-arena
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon/Public Key

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up the Database

1. Go to your Supabase dashboard > **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run** to create all tables, policies, and functions

### 5. Configure Supabase Auth

1. Go to **Authentication > Providers**
2. Make sure **Email** provider is enabled
3. Go to **Authentication > Settings**
4. **Disable** "Confirm email" (the app maps usernames to synthetic `@gamearena.local` addresses)
5. Set minimum password length to 6

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables under **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; needed for account deletion)
4. Click **Deploy**

## 🎮 Games

| Game | Difficulty | Category | Description |
|------|-----------|----------|-------------|
| ⭕ Tic Tac Toe | Easy | Strategy | Beat the AI in 5 rounds |
| 🐍 Snake | Medium | Arcade | Classic snake game |
| 🃏 Memory Match | Easy | Puzzle | Find matching card pairs |
| 🔨 Whack-a-Mole | Easy | Action | Whack moles before time runs out |
| ⌨️ Typing Speed | Medium | Skill | Test your typing WPM |
| 🧮 Math Quiz | Medium | Brain | Solve math problems fast |
| 🎨 Color Match | Hard | Brain | Match text color, not the word |
| ⚡ Reaction Time | Easy | Reflex | Test your reaction speed |
| 🧩 Puzzle Slider | Hard | Puzzle | Slide tiles in correct order |
| 💣 Minesweeper | Hard | Strategy | Classic mine-clearing game |

## 📁 Project Structure

```
game-arena/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (game grid)
│   │   ├── globals.css         # Global styles
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Sign up page
│   │   ├── profile/page.tsx    # User profile
│   │   ├── settings/page.tsx   # Settings page
│   │   ├── leaderboard/page.tsx# Leaderboard
│   │   ├── games/[id]/page.tsx # Dynamic game page
│   │   └── api/account/delete/route.ts # Secure account deletion
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── GameWrapper.tsx     # Game container with scores
│   │   └── games/             # 10 game components
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Dark mode state
│   └── lib/
│       ├── games.ts           # Game metadata
│       ├── scores.ts          # Score utilities
│       └── supabase/          # Supabase clients
├── supabase/
│   └── schema.sql             # Database schema
├── package.json
├── tailwind.config.ts
└── README.md
```

## 📝 License

MIT License - feel free to use this project for learning and fun!
