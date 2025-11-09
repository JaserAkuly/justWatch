# Television - All Your Sports, One Tap Away

A unified live sports guide and redirect hub that shows users what they can watch *right now* based on their connected streaming services.

## Features

- **User Authentication**: Secure email-based authentication with Supabase
- **Service Management**: Connect and manage multiple streaming services
- **Live Sports Dashboard**: Real-time view of all available games
- **One-Tap Watching**: Instant redirects to streaming apps via deep links
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) Vercel account for deployment

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/television.git
cd television
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase/schema.sql` to create tables
4. (Optional) Run `supabase/seed.sql` to add sample data

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

   You can find these in your Supabase project settings under API.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
television/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── onboarding/       # Onboarding wizard
│   ├── settings/         # Settings page
│   └── page.tsx          # Landing page
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client configuration
├── types/                 # TypeScript type definitions
├── supabase/             # Database schema and seeds
└── middleware.ts         # Auth middleware for protected routes
```

## User Flow

1. **Landing Page**: Users see the value proposition and can sign up
2. **Onboarding**: 3-step wizard for account creation and service connection
3. **Dashboard**: View live and upcoming games, one-tap watch functionality
4. **Settings**: Manage connected services and account preferences

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your production URL)
4. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## Supported Streaming Services

- ESPN+
- YouTubeTV
- Hulu
- Disney+
- Peacock
- Prime Video
- DirecTV Stream
- Sling

## Deep Links Format

The app uses platform-specific deep links for each service:

- ESPN+: `espn://live/{contentId}`
- YouTubeTV: `youtubetv://live/{contentId}`
- Hulu: `hulu://live/{contentId}`
- Peacock: `peacock://live/{contentId}`
- Prime Video: `primevideo://live/{contentId}`
- DirecTV: `directv://live/{contentId}`
- Sling: `sling://live/{contentId}`

## Development

### Run Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@television.app or open an issue on GitHub.
