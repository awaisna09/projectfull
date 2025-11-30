# RLS Issue Diagnosis

## Problem Found

The test is failing because **`SUPABASE_SERVICE_ROLE_KEY` is not set** in `config.env`.

### Current Situation:
- ❌ `SUPABASE_SERVICE_ROLE_KEY`: NOT FOUND
- ✅ `SUPABASE_ANON_KEY`: Found
- ⚠️  Code is using: `SUPABASE_ANON_KEY` (subject to RLS policies)

### Why This Matters:
- **Service Role Key**: Bypasses RLS automatically - can insert/update any data
- **Anon Key**: Subject to RLS policies - needs explicit policies to allow inserts

## Solutions

### Option 1: Set Service Role Key (Recommended)
Add to `config.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

To get your service role key:
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy the "service_role" key (NOT the anon key)
4. Add it to `config.env`

### Option 2: Use Updated RLS Policies
I've updated `fix_mock_exam_rls_policies.sql` to include permissive policies that allow inserts even with the anon key. Run this SQL script in Supabase SQL Editor.

**Note:** Option 2 is less secure for production. Option 1 is recommended.

## Next Steps

1. **If using Option 1:**
   - Add `SUPABASE_SERVICE_ROLE_KEY` to `config.env`
   - Re-run test: `python test_mock_exam_table_updates.py`

2. **If using Option 2:**
   - Run `fix_mock_exam_rls_policies.sql` in Supabase SQL Editor
   - Re-run test: `python test_mock_exam_table_updates.py`

## Security Note

The service role key has full database access and should:
- ✅ Only be used server-side (backend)
- ✅ Never be exposed to the frontend
- ✅ Be kept secret in `.env` files
- ✅ Not be committed to version control

