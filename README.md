# NavEdge Fleet Management System

A comprehensive fleet management solution for vehicle rental and taxi operations.

## Features

- **Multi-device Access**: Access your fleet data from any device with cloud database
- **Real-time Tracking**: Monitor your fleet with GPS tracking
- **Driver Management**: Manage drivers, performance, and contracts
- **Fine Tracking**: Track and manage traffic violations
- **Incident Reporting**: Document and track accidents and incidents
- **Analytics**: Comprehensive reporting and analytics
- **Multi-language Support**: English, Arabic, Hindi, and Urdu

## Database Setup

This application uses Supabase as the backend database. To set up:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL migrations in `supabase/migrations/` to set up your database schema
4. Copy your project URL and anon key to `.env` file

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update the Supabase URL and anon key with your project details

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Mobile Apps

The system includes two mobile web apps:

- **Driver App**: `/mobile.html` - For drivers to track their location
- **Owner App**: `/owner.html` - For fleet owners to manage on the go

## Data Migration

When first setting up with Supabase, the system will automatically migrate your local data to the cloud database. This ensures a seamless transition from local storage to a multi-device solution.

## Offline Support

The application includes offline support with automatic synchronization when connectivity is restored.

## License

Copyright © 2024 NavEdge Fleet Management