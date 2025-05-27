
Liquid CX Lead Dashboard

A modern dashboard for tracking and analyzing customer support team performance, built with React, Supabase, and Tailwind CSS.

---

## Features

- **Team Overview**: Visualize team lead and agent performance with charts, tables, and heatmaps.
- **Real-time Updates**: Live data sync using Supabase channels for instant dashboard refresh.
- **Role-based Access**: Admin, Team Lead (Editor), and Agent (Viewer) roles with protected routes.
- **User Management**: Admins can add, edit, and manage users and their roles.
- **Data Import/Export**: Import/export team stats via Excel files.
- **Customizable Date Range**: Filter stats and charts by date.
- **Profile Management**: Users can update their profile and password.
- **Responsive UI**: Built with Tailwind CSS and Radix UI components.

---

## Project Structure

```
.
├── src/
│   ├── components/           # Reusable UI and dashboard components
│   ├── context/              # React context providers (Auth, Date)
│   ├── hooks/                # Custom React hooks
│   ├── integrations/         # Supabase client and types
│   ├── lib/                  # Utility functions
│   ├── pages/                # Route-based pages (TeamOverview, Admin, Auth, etc.)
│   ├── types/                # TypeScript types
│   └── main.tsx              # App entry point
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind CSS configuration
├── vite.config.ts            # Vite build configuration
└── index.html                # HTML entry point
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- [Bun](https://bun.sh/) or npm/yarn
- Supabase project (see below)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AndileTF/leadstats-tracker.git
   cd leadstats-tracker
   ```

2. **Install dependencies:**
   ```sh
   bun install
   # or
   npm install
   ```

3. **Configure Supabase:**
   - Copy your Supabase URL and public anon key into client.ts.
   - Ensure your Supabase database has the required tables and RLS policies (see below).

4. **Start the development server:**
   ```sh
   bun run dev
   # or
   npm run dev
   ```

5. **Open [http://localhost:8080](http://localhost:8080) in your browser.**

---

## Supabase Setup

- **Tables**: `profiles`, `team_leads`, `agents`, `daily_stats`, `After Call Survey Tickets`, etc.
- **RLS Policies**: Enable Row Level Security and create policies for each table as needed.
- **Functions**: Some admin features require RPC functions (e.g., `get_tables_list`, `get_auth_logs`, `get_profile_role`).

See types.ts for expected table schemas.

---

## Scripts

- `bun run dev` / `npm run dev` — Start development server
- `bun run build` / `npm run build` — Build for production
- `bun run lint` / `npm run lint` — Lint code

---

## Customization

- **Theme**: Edit tailwind.config.ts and index.css for colors and styles.
- **Branding**: Update logo and images in lovable-uploads.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## License

MIT

---

## File References

- App.tsx — Main app and route definitions
- TeamOverview.tsx — Team overview dashboard
- UserManagement.tsx — Admin user management
- AuthContext.tsx — Authentication logic
- client.ts — Supabase client setup

---

For more details, see the source code and comments throughout the project.