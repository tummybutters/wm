# WM Dashboard - Setup Guide

## Quick Setup (Recommended)

Run this single command to set everything up:

```bash
pnpm install && pnpm prisma:generate && pnpm prisma:migrate dev --name init && pnpm prisma:seed && pnpm dev
```

Or use the setup script:

```bash
chmod +x setup.sh
./setup.sh
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Generate Prisma Client

```bash
pnpm prisma:generate
```

This generates the TypeScript types for your database models.

### 3. Run Database Migrations

```bash
pnpm prisma:migrate dev --name init
```

This creates the SQLite database file at `prisma/dev.db` with the schema defined in `prisma/schema.prisma`.

### 4. Seed the Database

```bash
pnpm prisma:seed
```

This creates:
- 1 demo user with email `demo@example.com`
- ~25 entries across the last 14 days (journals, beliefs, notes)
- ~20 bets (mix of open and resolved)

### 5. Start Development Server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Verifying the Setup

After setup, you should see:

1. **Dashboard** (`/dashboard`):
   - Brier score metric (if resolved bets exist)
   - Open vs Resolved bet counts
   - Top words bar chart from last 7 days
   - Recent bets table

2. **Entries** (`/entries`):
   - List of all entries with pagination
   - Create, Edit, Delete buttons working

3. **Bets** (`/bets`):
   - List of all bets
   - Create, Edit, Resolve, Delete buttons working

## Troubleshooting

### Port Already in Use

If port 3000 is taken:

```bash
PORT=3001 pnpm dev
```

### Database Issues

Reset the database:

```bash
rm prisma/dev.db prisma/dev.db-journal
pnpm prisma:migrate dev --name init
pnpm prisma:seed
```

### TypeScript Errors

Regenerate Prisma client:

```bash
pnpm prisma:generate
```

### Missing Dependencies

Clear node_modules and reinstall:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Database Management

### View Database in Browser

```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) to browse and edit data.

### Backup Database

```bash
cp prisma/dev.db prisma/backup.db
```

### Restore Database

```bash
cp prisma/backup.db prisma/dev.db
```

## Development Workflow

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration:
   ```bash
   pnpm prisma:migrate dev --name your_migration_name
   ```
3. Update seed script if needed in `prisma/seed.ts`

### Adding shadcn/ui Components

The project uses shadcn/ui components. To add more:

```bash
# Example: Add a Toast component
npx shadcn-ui@latest add toast

# Example: Add a Dropdown Menu component
npx shadcn-ui@latest add dropdown-menu
```

Available components: button, card, dialog, input, label, select, table, textarea, toast, dropdown-menu, checkbox, radio-group, switch, tabs, and more.

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Building for Production

```bash
pnpm build
pnpm start
```

## File Structure Reference

```
src/
├── app/
│   ├── (routes)/              # Route groups
│   │   ├── dashboard/         # Dashboard page with metrics
│   │   ├── entries/           # Entries CRUD
│   │   └── bets/              # Bets CRUD
│   ├── layout.tsx             # Root layout with navigation
│   ├── page.tsx               # Home page (redirects to dashboard)
│   └── globals.css            # Global styles and CSS variables
├── components/
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── text.ts                # Text processing (tokenize, word frequency)
│   ├── stopwords.ts           # English stopwords list
│   └── utils.ts               # Utility functions (cn for Tailwind)
prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Seed script
```

## Key Technologies

- **Next.js 14**: App Router, Server Components, Server Actions
- **TypeScript**: Strict mode enabled
- **Prisma**: ORM with SQLite (portable to PostgreSQL)
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Pre-built accessible components
- **Recharts**: Data visualization
- **Zod**: Runtime type validation

## Demo User

The seed script creates a demo user:
- **Email**: `demo@example.com`
- **ID**: Generated CUID

All operations are scoped to this user in the code.

## Next Steps

1. **Explore the Dashboard**: See your Brier score and word frequency analysis
2. **Create Entries**: Add journal entries, beliefs, and notes
3. **Make Predictions**: Create bets with probabilities
4. **Resolve Bets**: Mark bets as true/false and watch your Brier score update
5. **Customize**: Modify components, add features, or change the styling

## Common Customizations

### Change Theme Colors

Edit `src/app/globals.css` to modify CSS variables:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  /* ... other colors ... */
}
```

### Add Authentication

Consider using:
- Clerk
- NextAuth.js
- Supabase Auth

### Switch to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Add `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/wm"
   ```

3. Run migrations:
   ```bash
   pnpm prisma:migrate dev
   ```

## Support

If you encounter issues:
1. Check the main `README.md` for more details
2. Verify all setup steps were completed
3. Check the console for error messages
4. Ensure Node.js 18+ is installed
5. Try resetting the database

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)


