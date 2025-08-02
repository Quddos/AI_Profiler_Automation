# Role-Based Profile Management Dashboard

This is a full-stack Next.js application with PWA support, a role-based profile management dashboard, and file upload capabilities.

## Features

*   **Frontend**: Next.js (with App Router and PWA support)
*   **Backend**: Next.js API routes
*   **Database**: Neon (PostgreSQL)
*   **Authentication**: Email/password authentication with roles (`superadmin`, `admin`, `user`)
*   **UI**: TailwindCSS + Shadcn UI with animated yellow/blue theme
*   **File Storage**: Vercel Blob (for all uploaded documents/files)

## Default Credentials

*   **Superadmin**:
    *   Email: `admin@qudmeet.click`
    *   Password: `admin@123`
*   **Admin**:
    *   Email: `john@admin.com`
    *   Password: `password123`
*   **User**:
    *   Email: `jane@user.com`
    *   Password: `password123`

## Setup and Deployment

1.  **Clone the repository**:
    \`\`\`bash
    git clone <your-repo-url>
    cd AI_Profiler_Automation
    \`\`\`

2.  **Install dependencies**:
    \`\`\`bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    \`\`\`

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root of your project and add the following:
    \`\`\`
    DATABASE_URL="your_neon_postgresql_connection_string"
    BLOB_READ_WRITE_TOKEN="your_vercel_blob_read_write_token"
    \`\`\`
    *   Replace `your_neon_postgresql_connection_string` with your Neon database connection string.
    *   Replace `your_vercel_blob_read_write_token` with your Vercel Blob token.

4.  **Run Database Migrations**:
    This project uses SQL scripts for migrations. You need to run the initial schema script to create tables and seed the default users.

    \`\`\`bash
    # You can run this script using a PostgreSQL client or a tool like `psql`
    # Example using psql:
    # psql -h <your_neon_host> -U <your_neon_user> -d <your_neon_database> -f scripts/001_fresh_schema.sql
    \`\`\`
    Alternatively, you can use the Vercel CLI to run the script if you have it configured:
    \`\`\`bash
    # This is a placeholder command, actual execution depends on your setup
    # For local development, you might need a local PostgreSQL instance or connect directly to Neon.
    # The `scripts/001_fresh_schema.sql` file contains the necessary SQL.
    \`\`\`
    **Important**: Ensure your `DATABASE_URL` is correctly set before running the migration.

5.  **Run the Development Server**:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    \`\`\`

6.  **Access the Application**:
    Open your browser and navigate to `http://localhost:3000`.

## Project Structure

\`\`\`
.
├── app/
│   ├── admin/             # Admin Dashboard pages
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/          # Authentication API routes (login, logout, check, me)
│   │   ├── cards/         # Card CRUD API routes
│   │   ├── debug/         # Debugging API routes
│   │   ├── upload/        # Vercel Blob upload API
│   │   └── users/         # User CRUD API routes
│   │       └── [id]/
│   ├── dashboard/         # User Dashboard pages
│   │   └── page.tsx
│   ├── login/             # Login page
│   │   └── page.tsx
│   ├── setup/             # Database setup page
│   │   └── page.tsx
│   ├── globals.css        # Global Tailwind CSS styles
│   └── layout.tsx         # Root layout for the application
├── components/
│   ├── admin/             # Admin-specific components (UserManagement, CardManagement)
│   ├── ui/                # Shadcn UI components
│   └── user/              # User-specific components (CardDetailModal)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions (auth, db, config, utils)
├── public/                # Static assets (manifest.json, images)
├── scripts/               # Database migration and utility scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── next.config.mjs        # Next.js configuration (PWA setup)
