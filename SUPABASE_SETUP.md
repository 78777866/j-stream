# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Jstream streaming platform.

## Prerequisites

1. A Supabase account and project
2. Node.js and npm installed
3. The Jstream project cloned

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note down your project URL and anon key

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Jstream"

# TMDb API Configuration
NEXT_PUBLIC_TMDB_TOKEN=your_tmdb_api_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Optional: Social Media Links
NEXT_PUBLIC_TWITTER=https://x.com
NEXT_PUBLIC_FACEBOOK=https://facebook.com
NEXT_PUBLIC_INSTAGRAM=https://instagram.com
NEXT_PUBLIC_YOUTUBE=https://youtube.com

# Optional: Image Domain
NEXT_PUBLIC_IMAGE_DOMAIN=
```

## Step 3: Configure Supabase Authentication

### 3.1 Enable Email/Password Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure the following settings:
   - **Enable email confirmations**: Disabled (since we're not allowing sign-ups)
   - **Enable secure email change**: Disabled
   - **Enable double confirm changes**: Disabled

### 3.2 Disable Sign-ups

1. Go to **Authentication** > **Settings**
2. Set **Enable sign ups** to **Disabled**
3. This ensures only manually added users can access the platform

### 3.3 Add Users Manually

1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Enter the user's email and password
4. The user will be able to sign in immediately

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Application

```bash
npm run dev
```

## Step 6: Test Authentication

1. Visit `http://localhost:3000`
2. You should be redirected to `/login`
3. Use the credentials you created in Supabase to sign in
4. After successful authentication, you'll be redirected to the homepage

## Features Implemented

- ✅ **Supabase Authentication**: Email/password login using Supabase
- ✅ **No Sign-up**: Registration is disabled, only manually added users can access
- ✅ **Session Management**: Automatic session checking and persistence
- ✅ **AuthGuard**: Protects all routes except `/login`
- ✅ **Login Page**: Clean, responsive login form
- ✅ **Logout Functionality**: Sign out button in navigation
- ✅ **Error Handling**: Proper error messages for failed login attempts
- ✅ **Loading States**: Loading indicators during authentication
- ✅ **Responsive Design**: Works on desktop and mobile

## Security Features

- **No Public Registration**: Users can only be added by administrators
- **Session Validation**: Automatic session checking on page load
- **Secure Redirects**: Proper redirect handling for authenticated/unauthenticated users
- **Environment Variables**: Secure configuration management

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Ensure the user exists in Supabase dashboard
   - Check that email/password are correct

2. **"Supabase URL not found"**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - Ensure the URL includes `https://`

3. **"Anon key not found"**
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
   - Check that the key is from the correct project

4. **Infinite redirect loop**
   - Clear browser cookies and local storage
   - Check that the login page is accessible at `/login`

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Check that users are manually added in Supabase dashboard

## Next Steps

After setting up authentication, you can:
1. Customize the login page design
2. Add user profile management
3. Implement role-based access control
4. Add password reset functionality (if needed)
5. Configure additional authentication providers 