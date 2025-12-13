# Company Info Feature - Setup Guide

## Problem: Company Info Saving Not Working

If you're experiencing issues saving company information, follow these steps:

## Step 1: Create the Database Table

The `company_info` table must exist in your Supabase database. Follow these steps:

### Option A: Using Supabase Dashboard (Recommended)

1. **Log in to Supabase**
   - Go to https://supabase.com and log in
   - Select your project: `https://ucoyzaegmxtyoguogxfy.supabase.co`

2. **Open SQL Editor**
   - In the left sidebar, click **SQL Editor**
   - Click **New Query**

3. **Copy and Paste the SQL**
   - Go to `scripts/007_create_company_info_complete.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor in Supabase

4. **Run the Query**
   - Click **Run** button (or Ctrl+Enter)
   - You should see: "Company Info table created successfully!"

### Option B: Using Supabase CLI

```bash
# Navigate to your project directory
cd "c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"

# Push the migration
supabase db push
```

## Step 2: Verify the Table was Created

1. In Supabase Dashboard:
   - Click **Table Editor** in the left sidebar
   - Look for `company_info` table in the list
   - Click on it to verify all columns exist

Expected columns:
- `id` (UUID, Primary Key)
- `user_id` (UUID, References auth.users)
- `company_name` (Text)
- `company_description` (Text)
- `consolidation_approach` (Text)
- `business_description` (Text)
- `reporting_period` (Text)
- `scope3_activities` (Text)
- `excluded_activities` (Text)
- `base_year` (Integer)
- `base_year_rationale` (Text)
- `base_year_recalculation_policy` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Step 3: Test the Feature

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Open your app**
   - Go to http://localhost:3000
   - Log in to your account

3. **Navigate to Company Info**
   - Click the sidebar
   - Click **"Company Info"** button

4. **Fill out the form**
   - Enter company name (required field)
   - Fill other fields as needed
   - Click **"Save Company Information"**

5. **Check for success message**
   - You should see: "Company information saved successfully!"
   - If you see an error, check the browser console (F12 > Console tab)

## Step 4: Troubleshooting

### Error: "Failed to save company information"

**Solution 1: Check RLS Policies**
- In Supabase, click **Authentication** → **Policies**
- Verify you have policies for `company_info` table
- The policies should allow users to SELECT, INSERT, UPDATE, DELETE their own records

**Solution 2: Check RLS is Enabled**
- In Supabase, go **Table Editor** → `company_info`
- Click the lock icon in the top-right
- Verify "Enable RLS" is turned ON

**Solution 3: Check Browser Console**
- Press F12 to open Developer Tools
- Go to the **Console** tab
- Look for error messages related to the save
- Share these errors for debugging

### Error: "relation \"public.company_info\" does not exist"

**Solution:** The table hasn't been created yet
- Follow **Step 1** above to create the table

### Error: "Permission denied"

**Solution:** Row Level Security policies are missing or incorrect
- Run the complete SQL script again from `scripts/007_create_company_info_complete.sql`

## Step 5: Verify Table Permissions

Run this SQL query in Supabase SQL Editor to check table exists and is accessible:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'company_info' 
  AND table_schema = 'public'
) AS table_exists;

-- Check row count
SELECT COUNT(*) as total_records FROM public.company_info;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'company_info';
```

## Expected Output After Save

When you successfully save company information:

1. **UI Feedback**
   - Green success message appears: "Company information saved successfully!"
   - Form data persists when you refresh the page

2. **Database**
   - A new row appears in `company_info` table
   - `user_id` matches your logged-in user
   - `created_at` and `updated_at` are populated
   - All form fields are stored

## Need More Help?

If you're still having issues:

1. **Check the browser console** (F12 > Console)
   - Look for error messages
   - Screenshot any errors

2. **Check Supabase logs**
   - In Supabase Dashboard: **Database** → **Query Performance**
   - Look for failed queries

3. **Verify you're logged in**
   - The form won't save if you're not logged in
   - You should see your name/email in the dashboard header

4. **Test with the migration SQL file**
   - Run `scripts/007_create_company_info_complete.sql` directly
   - This includes all necessary setup

## Database Schema Reference

The table uses:
- **UNIQUE constraint**: Only one company_info record per user
- **CHECK constraint**: consolidation_approach must be one of the allowed values
- **RLS Policies**: Users can only see/edit their own records
- **Automatic timestamps**: created_at and updated_at are managed by the database
- **Foreign key**: Deleting a user automatically deletes their company_info

This ensures data isolation and consistency across the application.
