# WardrobeFlow - Product Requirements Document (PRD)

## 1. Overview

WardrobeFlow is a personal wardrobe tracking application designed to help users manage and track their daily outfits.

Many people own a limited wardrobe and often forget:

* What they wore recently
* Which clothes they own
* How frequently a particular item is worn

WardrobeFlow solves this by maintaining a digital wardrobe, tracking daily outfit usage, and providing insights that help users avoid unnecessary outfit repetition.

The application is designed as a fast, mobile-first web application with a clean user experience and minimal user effort.

---

# 2. Goals

### Primary Goals

* Track daily outfits and day status by **wardrobe context** (office, stay home, travel, day out)
* Maintain a personal wardrobe inventory
* Prevent excessive outfit repetition
* Track clothing usage history across contexts, not only office
* Provide useful wardrobe analytics

### Secondary Goals

* Reduce time spent deciding what to wear
* Encourage better wardrobe utilization
* Provide outfit recommendations in future versions

---

# 3. Target User

Individuals who:

* Want to remember what they wore and how often
* Go to office, stay home, travel, or go out - and want a simple way to log what mattered
* Want to avoid repeating outfits too often in visible contexts
* Want visibility into clothing usage
* Prefer a simple and quick daily logging process

---

# 4. Version 1 Scope

Version 1 focuses on personal wardrobe management and outfit tracking.

No AI features.
No social features.
No weather integration.

The goal is simplicity, speed, and reliability.

---

# 5. Authentication

Authentication will be handled by Supabase Auth.

Supported methods:

* Email + Password Signup
* Email + Password Login
* Password Reset
* Logout

Requirements:

* Secure authentication
* Session persistence
* Protected routes
* User-specific data isolation

Every user only sees their own wardrobe and outfit history.

---

# 6. Wardrobe Management

Users can manage clothing items.

## Clothing Categories

### Shirts

Examples:

* Formal Shirts
* Casual Shirts
* Polo T-Shirts

### Pants

Examples:

* Jeans
* Chinos
* Trousers

### Shoes

Examples:

* Formal Shoes
* Sneakers
* Loafers

---

## Clothing Item Information

Each item stores:

* Name
* Category
* Color
* Optional Notes
* Optional Image
* Created Date

---

# 7. Daily Outfit Tracking

Users can create one entry per day.

Every entry always includes:

* **Day type** (required) - describes the day from a **wardrobe** perspective, not HR/payroll categories
* **Optional note**

**Outfit items** (shirt, pants, shoes) are layered on top: required for office, optional everywhere else.

---

## Why these day types?

WardrobeFlow cares about **whether and what you wore**, not whether a day was “annual leave” vs “public holiday.” Those distinctions do not change outfit tracking.

Day types answer:

* Did I dress for work? → **Office**
* Was I mostly at home? → **Stay home**
* Was I away / on a trip? → **Travel**
* Did I go out for something social or an event? → **Day out**

---

## Day types (v1)

| Type | User-facing label | Wardrobe meaning |
|------|-------------------|------------------|
| `office` | **Office** | Went to work - primary outfit-logging loop |
| `stay_home` | **Stay home** | At home (WFH, rest day, sick day, holiday at home - no HR split) |
| `travel` | **Travel** | Trip or away from usual routine |
| `day_out` | **Day out** | Outing, meetup, event, brunch, date - you went somewhere and may have dressed up |

**Not in scope:** separate “leave” vs “holiday” vs “WFH” labels. **Stay home** covers all at-home days. **Day out** covers social and event days where outfit choice often matters.

---

## Logging model

| Day type | Day status | Outfit items |
|----------|------------|--------------|
| **Office** | Required | **Required:** shirt + pants. **Optional:** shoes |
| **Stay home** | Required | Optional - picker collapsed (“Add what you wore”) |
| **Travel** | Required | Optional - picker collapsed (“Add what you wore”) |
| **Day out** | Required | Optional - picker **shown by default** (“What did you wear?”) - outfit memory is often the point |

### Fast path (any day type)

User selects day type (+ optional note) and saves without selecting outfit items. No `outfit_items` or `wear_history` rows are created.

### Office entry

When day type is **Office**, the user must select:

* Shirt (required)
* Pants (required)
* Shoes (optional)

Optional note field.

### Optional outfit (stay home, travel, day out)

When the user selects outfit items:

* Same shirt / pants / shoes picker as office
* **No minimum** on non-office types - any combination of selected items is valid
* A `wear_history` row is created for each selected item only
* Repetition warnings when the picker is open (wording varies by day type; see §10)

**UX intent:** Office is the required full-outfit loop. **Day out** encourages optional logging because going somewhere is when users often care what they wore. **Stay home** and **travel** stay fast by default.

---

# 8. Outfit History

Users can view historical outfit records.

Views:

### Timeline View

Recent outfits in chronological order.

### Calendar View

Monthly calendar displaying day-type markers:

* Office
* Stay home
* Travel
* Day out

Selecting a day opens full details.

---

# 9. Clothing Usage Tracking

Whenever a clothing item is included in a saved outfit entry (any day type), a wear record is automatically created.

Metrics include:

### Total Wears

Example:

Blue Formal Shirt

25 wears

---

### Last Worn Date

Example:

Last worn 6 days ago

---

### Wear Frequency

Example:

Used 5 times this month

---

# 10. Repetition Detection

When the outfit item picker is open, the system checks recent usage from `wear_history`.

Base signals (informational only - user can still select the item):

* Worn yesterday
* Worn 2 days ago
* Worn 3 times this week (Monday–Sunday, user-local)

### Context by day type

| Day type | Warning emphasis |
|----------|------------------|
| **Office** | Full base signals - highest visibility context |
| **Day out** | Full or near-full signals - social repetition matters (e.g. “Worn on your last day out”) |
| **Stay home** | Softer copy when optional outfit is used (e.g. “Last worn on a stay-home day”) |
| **Travel** | Trip-oriented hints (e.g. last travel day, consecutive travel days) |

Warnings never block selection.

---

# 11. Dashboard

Dashboard should provide an immediate overview.

Widgets:

### Today's Status

Current day's outfit or activity.

### Recent Activity

Last 7 days.

### Wardrobe Summary

Count by category.

### Quick Add Outfit

Fastest path to daily logging.

---

# 12. Analytics

Version 1 analytics:

### Most Worn Items

Top clothing items by wear count (all contexts).

Optional filtered views:

* Most worn on **office** days
* Most worn on **day out** days
* Most worn on **travel** days
* Most worn on **stay home** days (when outfit was logged)

### Least Worn Items

Rarely used clothing (all contexts).

### Day-type breakdown (monthly)

Wardrobe-context counts - not HR categories:

* **Office** - work days
* **Stay home** - at-home days (single bucket; no separate leave/holiday/WFH)
* **Travel** - trip days
* **Day out** - outings, meetups, events

---

# 13. Mobile First Experience

The application is primarily designed for mobile usage.

Requirements:

* Responsive layouts
* Thumb-friendly navigation
* Large touch targets
* Bottom navigation
* Fast page transitions

Desktop support is secondary but fully functional.

---

# 14. Performance Requirements

Performance is a critical requirement.

The application should feel instant.

---

## Data Fetching Principles

* Fetch only required data
* Avoid over-fetching
* Paginate historical records
* Use server-side caching where appropriate
* Use optimistic updates where safe

---

## UI Performance

* Minimal client-side JavaScript
* Server Components by default
* Client Components only when required
* Lazy load heavy components
* Lazy load images

---

## Database Performance

* Proper indexing
* User-scoped queries
* Avoid N+1 queries
* Aggregate calculations performed efficiently

---

## Target Performance

* Initial page load under 2 seconds
* Dashboard load under 1 second
* Outfit creation under 300ms perceived latency
* Smooth mobile experience on mid-range devices

---

# 15. Design Principles

The UI should feel:

* Modern
* Minimal
* Clean
* Fast
* Mobile-first

Design inspiration:

* Notion
* Linear
* Supabase Dashboard

Focus on usability rather than visual complexity.

---

# 16. Non Functional Requirements

### Security

* Row Level Security (RLS)
* Authenticated access only
* User data isolation

### Scalability

Architecture should support:

* Thousands of users
* Millions of wear records

Without major redesign.

### Reliability

* Consistent data model
* Transaction-safe updates
* Audit-friendly tracking

---

# 17. Out Of Scope (Version 1)

The following are intentionally excluded:

* AI outfit recommendations
* Weather integrations
* Social sharing
* Family wardrobes
* Multi-user wardrobes
* Outfit planning
* Packing lists
* Notifications
* QR tagging
* Marketplace integrations

These may be introduced in future versions.

---

# 18. Success Metrics

The product is considered successful if users can:

* Add clothing items in under 30 seconds
* Log daily outfits in under 10 seconds
* Easily see what they wore recently
* Track clothing usage accurately
* Avoid unwanted outfit repetition

The primary objective of Version 1 is to become a fast and reliable personal wardrobe tracking system.

