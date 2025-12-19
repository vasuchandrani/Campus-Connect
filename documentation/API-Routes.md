# Campus Connect — API Routes

This document lists all application routes used in **Campus Connect**, reflecting the **role-first onboarding flow** and updated role responsibilities.

Routes are grouped by **user role** and describe **when each route is accessed and what it represents**.

---

## Base Path

`/campus-connect`

All routes are relative to this base path.

---

## 1. Entry & Role Selection (Public)

### `/campus-connect/home`
- Landing page of Campus Connect
- Introduces the platform and its purpose

### `/campus-connect/role-selection`
- First mandatory step for all users
- User selects one of the following roles:
  - College Admin
  - Journalist
  - Reviewer
  - Student
- Determines the entire onboarding and authentication flow

---

## 2. College Admin Routes

> Used when `role == College Admin`  
> College Admins **must purchase a subscription before registering a college**

---

### Subscription & Registration

### `/campus-connect/college-admin/subscription`
- College Admin selects and purchases a subscription plan
- Required before college registration

### `/campus-connect/college-admin/signup`
- Accessible only after successful subscription purchase
- Collects:
  - College details
  - Admin credentials
- Registers both the **college** and its **primary admin**

### `/campus-connect/college-admin/signin`
- College Admin authentication
- Redirects to College Admin dashboard

---

### College Admin Dashboard

### `/campus-connect/college-admin/dashboard`

The College Admin dashboard provides **full governance and moderation** over campus activities.

**Functional Capabilities:**

- Dashboard monitoring and analytics
- Club approval, rejection, and control
- User management (students, journalists, club admins)
- Newspaper moderation and journalist verification
- Research paper approval and tracking
- Centralized approval and verification control
- Platform health and engagement analysis
- Notifications and alerts
- College-level settings and configuration

**One-Line Role Summary:**  
The College Admin governs, moderates, verifies, and monitors all campus-level activity.

---

## 3. Journalist Routes

> Used when `role == Journalist`  
> Journalists are **pre-added by the College Admin**  
> No signup is available

---

### `/campus-connect/journalist/signin`
- Journalist signs in using existing credentials
- Redirects to Journalist dashboard

---

### Journalist Dashboard

### `/campus-connect/journalist/dashboard`

**Functional Capabilities:**

- Personal dashboard overview
- Article creation (draft, edit, submit)
- Article status tracking (Draft / Pending / Published)
- Article management (edit or delete drafts)
- Performance analytics (read-only)
- Notifications for approval or rejection
- Profile and account settings

**Constraint:**  
Articles are published only after College Admin approval.

**One-Line Role Summary:**  
A Journalist writes, manages, and tracks articles but cannot publish without admin approval.

---

## 4. Reviewer Routes

> Used when `role == Reviewer`  
> Reviewers are **pre-assigned by the College Admin**  
> No signup is available

---

### `/campus-connect/reviewer/signin`
- Reviewer signs in using existing credentials
- Redirects to Reviewer dashboard

---

### Reviewer Dashboard

### `/campus-connect/reviewer/dashboard`

**Functional Capabilities:**

- View assigned research papers
- Read full paper submissions
- Provide ratings and written feedback
- Submit final review decisions
- Track reviewed papers and workload

**Restrictions:**
- No access to:
  - User management
  - Clubs
  - Newspaper content
  - Platform analytics

**One-Line Role Summary:**  
A Reviewer evaluates assigned research papers with academic authority only.

---

## 5. Student Routes

> Used when `role == Student`

---

### College Selection & Authentication

### `/campus-connect/student/choose-college`
- Student selects a college
- Registration is allowed only if the college exists

### `/campus-connect/student/signup`
- Student registration with personal and academic details

### `/campus-connect/student/signin`
- Student authentication
- Redirects to Student dashboard

---

### Student Dashboard

### `/campus-connect/student/dashboard`

**Functional Capabilities:**

- Personal activity overview
- Club browsing and participation
- Event discovery and registration
- Announcements and notifications
- Digital newspaper access
- Research paper submission and tracking
- Profile and account settings

**One-Line Role Summary:**  
A Student participates in clubs and events, consumes content, submits research papers, and receives campus updates.

---

## 6. Your Clubs (Dynamic Role-Based Access)

> Available to authenticated users (primarily Students)

---

### `/campus-connect/your-clubs`

- Displays a list of clubs where the user is:
  - A Club Admin, or
  - A Club Member
- Clicking a club redirects to:
  - Club Admin Dashboard (if admin)
  - Club Member Dashboard (if member)
- If the user has no club association:
  - Shows a **Request to Add Club** button
- The **Request to Add Club** option is visible even if the user already belongs to other clubs

---

## 7. Club Dashboards (Contextual)

---

### Club Admin Dashboard

### `/campus-connect/clubs/:clubId/admin-dashboard`

**Functional Capabilities:**

- Club performance overview
- Announcement creation and visibility control
- Event creation and management
- Member and role management
- Core committee visibility
- Club-specific settings

**One-Line Role Summary:**  
A Club Admin manages a single club’s announcements, events, members, and internal structure.

---

### Club Member Dashboard

### `/campus-connect/clubs/:clubId/member-dashboard`

**Functional Capabilities:**

- View club announcements
- RSVP and participate in events
- View fellow club members
- Receive club notifications

**One-Line Role Summary:**  
A Club Member participates in club activities without management permissions.

---
