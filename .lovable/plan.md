

# Fix: Connect Dashboard Home to Real Data and Jobs Page

## Problem
The Dashboard Home (`/dashboard`) displays hardcoded placeholder data (fake jobs, stats, and tasks) instead of real data from the database. Additionally, clicking on jobs or the "View All" button does nothing -- there's no navigation to the Jobs page.

## Solution

### 1. Fetch Real Data on the Dashboard
Replace all static arrays with live queries from the database:
- **Stats cards**: Query actual counts for active jobs, total clients, pending tasks, and documents
- **Recent Jobs list**: Fetch the latest projects with their task progress (same pattern used in JobsPage)
- **Upcoming Tasks list**: Fetch tasks sorted by due date

### 2. Connect Dashboard to Jobs Page
- Make the "View All" button on Recent Jobs navigate to `/dashboard/jobs`
- Make each job card clickable, navigating to `/dashboard/jobs` (with the job pre-selected via URL or state)
- Make the "Add" button on Upcoming Tasks functional

### 3. Files to Modify
- **`src/pages/dashboard/DashboardHome.tsx`** -- Replace static data with real database queries using React Query (following the same pattern already used in JobsPage). Add navigation links using `useNavigate` from react-router-dom.

### Technical Details

The DashboardHome component will:
- Use `useQuery` to fetch projects, clients, project_tasks, and project_files counts
- Compute stats (active jobs count, client count, pending tasks, document count) from query results
- Display the 4 most recent projects with real progress bars
- Display upcoming tasks sorted by due date
- Wire "View All" to `navigate("/dashboard/jobs")`
- Wire job row clicks to `navigate("/dashboard/jobs")` 
- Show loading skeletons while data loads
- Show actual "change" indicators based on real data or remove the fake "+2 this week" text

