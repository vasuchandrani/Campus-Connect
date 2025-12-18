# Campus Connect — Agile Sprint Plan

---

## Sprint 0 — Foundation & Architecture

### Goals
- Lock system architecture, data model, and security baseline

### Tasks
- Finalize system architecture (monolith vs modular backend)
- Decide multi-tenancy strategy (`tenant_id` everywhere — no exceptions)
- Database schema design (Users, Roles, Colleges, Clubs, Articles, Papers, Events)
- Define RBAC matrix (explicit permission mapping)
- Authentication strategy (JWT + refresh tokens + MFA flow)
- Select tech stack and cloud storage
- Setup repository and CI/CD skeleton
- Configure environments (dev / stage / prod)

### Deliverables
- Running backend skeleton
- Database schema and RBAC specification
- Authentication flow diagram

---

## Sprint 1 — Authentication, Authorization & College Onboarding

### Goals
- Secure access
- Verified colleges only

### Tasks
- College registration and SysAdmin verification
- Domain-based email validation
- User registration and login
- Email verification
- Password hashing and MFA
- JWT-based authentication
- Role assignment post-login

### Mapped SRS
- **FR:** FR-01, FR-02, FR-03
- **US:** US-01, US-02, US-03, US-21, US-25

### Deliverables
- Users can log in securely
- Role-based access enforced
- Colleges isolated per tenant

---

## Sprint 2 — Club Management & Subscriptions

### Goals
- Clubs exist
- Students can follow clubs

### Tasks
- Club creation with CollegeAdmin approval
- Club profile management
- Club member roles and permissions
- Subscribe / unsubscribe functionality
- Interest-based tagging
- Activity logging

### Mapped SRS
- **FR:** FR-04, FR-10
- **US:** US-04 to US-07

### Deliverables
- Active clubs
- Subscription-based feed ready

---

## Sprint 3 — Announcements & Events

### Goals
- Clubs can announce events on Campus Connect

### Tasks
- Announcement CRUD operations
- Event creation
- Capacity handling and waitlist
- Event registration
- Pre-filled event forms

### Mapped SRS
- **FR:** FR-05, FR-06, FR-13
- **US:** US-08 to US-10

### Deliverables
- Announcements visible to users
- Events open for registration
- Zero manual form filling

---

## Sprint 4 — Notifications & Personalized Feed

### Goals
- Increase engagement
- Enable real-time updates

### Tasks
- Feed algorithm (subscriptions + interests + college)
- WebSocket setup
- In-app notifications
- Notification preferences
- Real-time seat availability updates

### Mapped SRS
- **FR:** FR-10, FR-11
- **US:** US-18, US-19

### Deliverables
- Real-time personalized feed
- Notifications reliably delivered

---

## Sprint 5 — University Digital Newspaper

### Goals
- Controlled journalism workflow

### Tasks
- Journalist onboarding and approval
- Draft submission to editor
- Editorial review workflow
- Article versioning
- Scheduling and publishing
- Category-based notifications

### Mapped SRS
- **FR:** FR-07
- **US:** US-11 to US-13

### Deliverables
- Digital newspaper live
- Editor-controlled publishing workflow

---

## Sprint 6 — Research Paper Submission & Review System

### Goals
- Academic credibility
- Transparent review process

### Tasks
- Research paper submission
- Reviewer assignment
- Reviewer dashboard
- Blind review enforcement
- Feedback and scoring
- Final publication flow

### Mapped SRS
- **FR:** FR-08, FR-09
- **US:** US-14 to US-17

### Deliverables
- Research paper publication functional
- Review history preserved

---

## Sprint 7 — Media Handling, Admin Dashboards & Configuration

### Goals
- Administrative visibility
- Platform-level control

### Tasks
- Cloud media upload
- CollegeAdmin dashboard
- System configuration rules
- College-level overrides

### Mapped SRS
- **FR:** FR-12
- **US:** US-22 to US-24

### Deliverables
- Admin insights available
- Configurable platform behavior

---

## Sprint 8 — Hardening, Compliance & Release

### Goals
- Stability
- Compliance
- Production readiness

### Tasks
- Load testing
- Security testing (XSS, CSRF, SQL Injection)
- Logging and monitoring
- Data deletion workflows
- UX cleanup
- Documentation finalization

### Mapped SRS
- **NFR:** All Non-Functional Requirements

### Deliverables
- Production-ready system
- No critical blockers

---