# Supabase Setup Guide

Follow these steps to configure your backend.

## 1. Create Project
1. Go to [Supabase](https://supabase.com/) and sign in.
2. Click **"New Project"**.
3. Choose your organization, name it `Loopin`, sets a database password, and choose a region close to you.
4. Click **"Create new project"**.
5. Wait for the database to set up.

## 2. SQL Setup (One-Click)
1. In your project dashboard, go to the **SQL Editor** (page icon in the left sidebar).
2. Click **"New Query"**.
3. Copy and paste the entire SQL block below into the editor.
4. Click **"Run"** (bottom right).

```sql
-- 1. Create Profiles Table (Public User Info)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 3. Profiles Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Trigger to automatically create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create Posts Table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable RLS on Posts
alter table public.posts enable row level security;

-- 7. Posts Policies
create policy "Posts are viewable by everyone."
  on posts for select
  using ( true );

create policy "Authenticated users can create posts."
  on posts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own posts."
  on posts for update
  using ( auth.uid() = user_id );

create policy "Users can delete own posts."
  on posts for delete
  using ( auth.uid() = user_id );

-- 8. Create Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Enable RLS on Comments
alter table public.comments enable row level security;

-- 10. Comments Policies
create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Authenticated users can create comments."
  on comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own comments."
  on comments for delete
  using ( auth.uid() = user_id );

-- 11. Enable Realtime for Comments
alter publication supabase_realtime add table comments;
```

## 3. Get API Keys
1. Go to **Project Settings** (gear icon) -> **API**.
2. Find `Project URL` and `anon` `public` key.
3. Copy these into your `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Auth Settings
1. Go to **Authentication** (left sidebar) -> **Providers**.
2. Ensure **Email** is enabled.
3. Ensure **Site URL** is set to `http://localhost:3000` for development.
4. Under **Redirect URLs**, add `http://localhost:3000/**`.

You are now ready to run the app!
