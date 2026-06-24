# SRMSS — Smart Route Management and Scheduling System

A premium, full-featured public transport depot management dashboard built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack Query**, **Framer Motion**, and **Recharts**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- (Optional) Spring Boot backend running at `http://localhost:8080`

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp .env.local.example .env.local   # or create .env.local manually

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Protected route group (uses AppLayout)
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── routes/page.tsx       # Route planning
│   │   ├── schedules/page.tsx    # Schedule management
│   │   ├── depots/page.tsx       # Depot management
│   │   ├── drivers/page.tsx      # Driver management
│   │   ├── vehicles/page.tsx     # Vehicle management
│   │   ├── fuel-logs/page.tsx    # Fuel logs
│   │   ├── maintenance/page.tsx  # Maintenance records
│   │   ├── reports/page.tsx      # Reports & analytics
│   │   └── settings/page.tsx     # Settings
│   ├── login/page.tsx            # Login page (public)
│   ├── layout.tsx                # Root layout (Inter font + Providers)
│   ├── providers.tsx             # QueryClient + Sonner Toaster
│   └── globals.css               # Design system tokens + animations
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Sidebar + Topbar + MobileNav
│   │   ├── Sidebar.tsx           # Collapsible desktop sidebar
│   │   ├── Topbar.tsx            # Top navigation bar
│   │   └── MobileBottomNav.tsx   # Mobile bottom navigation
│   ├── common/
│   │   ├── DashboardStatCard.tsx # Animated count-up stat card
│   │   ├── PageHeader.tsx        # Page title + breadcrumbs + actions
│   │   ├── StatusBadge.tsx       # Colour-coded status badge
│   │   ├── EmptyState.tsx        # Beautiful empty state
│   │   ├── LoadingSkeleton.tsx   # Shimmer loading skeletons
│   │   ├── ConfirmDialog.tsx     # Animated confirmation modal
│   │   └── SearchAndFilterBar.tsx # Search input + filter dropdowns
│   ├── tables/
│   │   ├── DataTable.tsx         # Generic desktop table
│   │   └── ResponsiveDataList.tsx # Auto-switch: table ↔ mobile cards
│   ├── cards/
│   │   └── MobileCardList.tsx    # Stacked card layout for mobile
│   ├── forms/
│   │   └── FormDrawer.tsx        # Animated right-side form drawer
│   └── charts/
│       └── ChartCard.tsx         # Recharts wrapper with states
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Axios instance with JWT interceptors
│   │   ├── dashboardApi.ts       # Dashboard stats, charts, alerts
│   │   ├── depotApi.ts           # Depot CRUD
│   │   ├── routeApi.ts           # Route CRUD
│   │   ├── driverApi.ts          # Driver CRUD
│   │   ├── vehicleApi.ts         # Vehicle CRUD
│   │   ├── scheduleApi.ts        # Schedule CRUD + cancel + status
│   │   ├── fuelLogApi.ts         # Fuel log CRUD
│   │   ├── maintenanceApi.ts     # Maintenance CRUD
│   │   └── reportApi.ts          # Weekly/monthly reports
│   ├── validators/index.ts       # Zod schemas for all forms
│   ├── utils/index.ts            # Utility helpers (formatDate, cn, etc.)
│   └── constants/index.ts        # Nav items, status colour maps
│
└── types/index.ts                # All TypeScript interfaces and enums
```

---

## 🎨 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework with file-based routing |
| React 19 | UI rendering |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Smooth animations and transitions |
| TanStack Query v5 | Server state management + caching |
| Axios | HTTP client |
| React Hook Form | Form state management |
| Zod | Runtime form validation |
| Recharts | Charts and data visualisations |
| Sonner | Toast notification system |
| Lucide React | Icon library |
| date-fns | Date formatting utilities |

---

## 📄 Pages

### 1. Login (`/login`)
- Animated gradient background with floating particles
- Email/password form with validation
- Demo credentials card (click to auto-fill)
- Mock authentication → stores JWT in localStorage

### 2. Dashboard (`/dashboard`)
- 9 animated stat cards with count-up effect
- Route performance bar chart (weekly)
- Fuel consumption line chart (monthly)
- Schedule status pie/donut chart
- Recent schedules list
- Active alerts (license expiry, maintenance, delays)

### 3. Routes (`/routes`)
- Searchable, filterable route list (depot + status filters)
- Add/Edit via animated right-side FormDrawer
- Route detail modal with ordered stops and Google Maps placeholder
- Delete with confirmation dialog

### 4. Schedules (`/schedules`)
- Status chip filters (On Time / Delayed / Completed / Cancelled)
- Date filter + text search
- Add schedule drawer with conflict error handling
- Cancel schedule with confirmation
- Responsive: table on desktop, cards on mobile

### 5. Depots (`/depots`)
- Card grid showing routes, buses, drivers per depot
- Add/Edit depot via drawer

### 6. Drivers (`/drivers`)
- License expiry warnings (red = expired, amber = ≤30 days)
- Filter by status (Active / Available / Inactive / On Leave)
- Responsive table / mobile cards

### 7. Vehicles (`/vehicles`)
- Status badges (Available / Assigned / Maintenance / Inactive)
- Filter by status and vehicle type
- Mileage display with Gauge icon

### 8. Fuel Logs (`/fuel-logs`)
- Summary cards: total liters + total cost
- Fuel usage trend line chart
- Add fuel log drawer
- Filterable log table

### 9. Maintenance (`/maintenance`)
- Upcoming service alert banner (within 14 days)
- Total cost summary card
- Filter by status and maintenance type
- Add maintenance record drawer

### 10. Reports (`/reports`)
- Weekly / Monthly toggle
- 7 summary KPI cards
- Trip status pie chart
- Top routes horizontal bar chart
- Cost breakdown with animated progress bars
- Export PDF button (UI ready, backend endpoint needed)

### 11. Settings (`/settings`)
- Profile editing form
- Notification preferences toggle
- System preferences
- API configuration display

---

## 🔌 API Integration

All API calls are in `src/lib/api/`. The pattern is:

```typescript
// Try real API, fall back to mock data automatically
export async function getRoutes(): Promise<Route[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<Route[]>>('/routes');
    return data.data;
  } catch {
    return mockRoutes; // fallback
  }
}
```

**Expected backend response structure:**
```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "timestamp": "2026-06-20T10:00:00Z"
}
```

To switch from mock to real API: start your Spring Boot backend at `http://localhost:8080` and the app will automatically use real data.

---

## 📱 Mobile Responsiveness

- **Sidebar**: Hidden on mobile, replaced by a hamburger menu + mobile overlay
- **Tables → Cards**: `ResponsiveDataList` auto-switches between `DataTable` (≥768px) and `MobileCardList` (<768px)
- **Bottom Navigation**: Visible only on mobile (5 most-used pages)
- **No horizontal overflow**: All layouts are overflow-safe on mobile

---

## 🧪 Running Tests / Build

```bash
# Type check + lint
npm run lint

# Production build (to verify no errors)
npm run build

# Start dev server
npm run dev
```

---

## 📝 Notes for Viva

1. **Why TanStack Query?** — Provides caching, background refetching, loading/error states, and avoids prop drilling for server data.
2. **Why Zod + React Hook Form?** — Separates validation schema from UI, provides type-safe form values, and gives excellent UX with per-field error messages.
3. **Mock-first API design** — All API functions try the real endpoint first and fall back to mock data, so the UI works without a backend during development.
4. **Responsive strategy** — `ResponsiveDataList` is a single reusable component that decides between a table and card layout based on viewport, keeping code DRY.
5. **Framer Motion animations** — Used selectively (page transitions, card entrance, drawer slide, stat count-up) to feel premium without being distracting.
