# Campus Connect — Software Requirements Specification (SRS)

---

## Index
1. Introduction and Scope  
2. Stakeholders and Users  
3. Functional and Non-Functional Requirements  
4. User Stories  

---

## 1. Introduction and Scope

### 1.1 Purpose
Campus Connect aims to eliminate fragmented campus communication by consolidating announcements, club updates, events, campus news, and research publications into a single verified, college-controlled platform.

The goal is to centralize information, increase engagement, and ensure transparency across academic and campus activities.

---

### 1.2 Description
Campus Connect is a multi-college platform that unifies student communication, club management, event workflows, research publishing, and a digital university newspaper.

Each role (Student, Club Admin, Journalist, Reviewer, College Admin, System Admin) operates under strict role-based access control (RBAC). Students receive a personalized feed, colleges maintain full control, and all academic outputs remain verified and organized.

---

### 1.3 Scope
Campus Connect provides:
1. University digital newspaper  
2. Research paper submission and publication  
3. Club announcements and event management  
4. Role-based access control  
5. Multi-college (multi-tenant) support  
6. Notifications and real-time updates  

---

## 2. Stakeholders and Users

### Stakeholders
- System Administrator (SysAdmin)
- College Administration
- Payment Gateway Provider

### Users
1. College Admin  
2. Club Admin  
3. Club Member  
4. Student Journalist  
5. Reviewer  
6. Student  

---

## 3. Functional and Non-Functional Requirements

### 3.1 Functional Requirements

| ID | Description |
|----|------------|
| FR-01 | User registration and authentication using verified college email, password hashing, and MFA |
| FR-02 | Role assignment and RBAC enforcement |
| FR-03 | College verification and onboarding by SysAdmin |
| FR-04 | Club creation, update, deletion, and member management |
| FR-05 | Announcements with targeting, attachments, and scheduling |
| FR-06 | Event creation, registration, capacity, and waitlist handling |
| FR-07 | University digital newspaper with editorial workflow |
| FR-08 | Research paper submission, review, and publication |
| FR-09 | Reviewer assignment and review history tracking |
| FR-10 | Subscriptions and personalized content feeds |
| FR-11 | Real-time notifications via WebSocket and email |
| FR-12 | File and media uploads (images, PDFs, videos) |
| FR-13 | User profiles and pre-filled event forms |
| FR-14 | Multi-college tenant-level data isolation |

---

### 3.2 Non-Functional Requirements

| ID | Description |
|----|------------|
| NFR-01 | High performance with minimal latency |
| NFR-02 | Scalability to support multiple colleges and users |
| NFR-03 | Security against XSS, CSRF, and SQL injection |
| NFR-04 | Privacy compliance and data deletion support |
| NFR-05 | High availability and fault tolerance |
| NFR-06 | Maintainable, modular architecture with CI/CD |
| NFR-07 | Logging, monitoring, and alerting |
| NFR-08 | Simple and intuitive user experience |

---

## 4. User Stories

### US-01: User Registration and Login
As a user, I want to register and log in using my college email so that I can securely access campus services.

**Backend**
- College-domain validation  
- Email verification  
- Password hashing and MFA  

---

### US-02: Role-Based Access
As a user, I want access only to features permitted by my role.

**Backend**
- Secure role storage (JWT/session)  
- Unauthorized access blocked  

---

### US-03: College Onboarding
As a SysAdmin, I want to approve college registrations so that only verified institutions join the platform.

**Backend**
- Document verification  
- Approval or rejection workflow  

---

### US-04: Club Creation
As a Club Admin, I want to register a club so students can follow it.

**Backend**
- College Admin approval  
- Activation after verification  

---

### US-05: Club Profile Management
As a Club Admin, I want to update club details so followers see accurate information.

**Backend**
- Editable metadata  
- Visibility controls  
- Change logs  

---

### US-06: Club Member Management
As a Club Admin, I want to manage club members and roles.

**Backend**
- Role-based permissions  
- Instant access revocation  

---

### US-07: Club Subscription
As a student, I want to subscribe to clubs based on my interests.

**Backend**
- Follow/unfollow support  
- Personalized feed updates  

---

### US-08: Announcements Publishing
As a Club Admin, I want to publish announcements so students receive updates.

**Backend**
- Mandatory fields validation  
- Notification triggers  

---

### US-09: Event Creation
As a Club Admin, I want to create events for student participation.

**Backend**
- Capacity limits  
- Automatic waitlist handling  

---

### US-10: Event Registration
As a student, I want one-click event registration with pre-filled details.

**Backend**
- Profile-based auto-fill  
- Real-time seat tracking  

---

### US-11: Newspaper Drafting
As a Journalist, I want to create article drafts.

**Backend**
- Draft visibility control  
- Auto-save support  

---

### US-12: Editorial Review
As an Editor, I want to approve or reject articles.

**Backend**
- Review history tracking  
- Change requests  

---

### US-13: Newspaper Publishing
As an Editor, I want to publish approved articles.

**Backend**
- Scheduling support  
- Feed and notification updates  

---

### US-14: Research Paper Submission
As a student, I want to submit research papers for review.

**Backend**
- File type validation  
- Duplicate submission prevention  

---

### US-15: Reviewer Assignment
As a College Admin, I want to assign reviewers to submissions.

**Backend**
- Multiple reviewers  
- Deadline tracking  

---

### US-16: Research Review
As a Reviewer, I want to evaluate research papers.

**Backend**
- Feedback and scoring  
- Review isolation until final decision  

---

### US-17: Research Publication
As a College Admin, I want to publish accepted research papers.

**Backend**
- Accepted-only visibility  

---

### US-18: Personalized Feed
As a student, I want a feed tailored to my interests.

**Backend**
- Subscription-based filtering  
- Real-time updates  

---

### US-19: Notifications
As a user, I want real-time notifications.

**Backend**
- WebSocket alerts  
- User preference controls  

---

### US-20: Profile Management
As a user, I want to manage my personal and academic profile.

**Backend**
- Validation rules  
- Auto-fill usage  

---

### US-21: Multi-College Isolation
As a SysAdmin, I want strict separation between colleges.

**Backend**
- Tenant ID enforcement  
- No cross-college access  

---

### US-22: File and Media Uploads
As a content creator, I want to upload files.

**Backend**
- Cloud storage  
- Size and type restrictions  

---

### US-23: Admin Dashboard
As a College Admin, I want to monitor campus activity.

**Backend**
- Engagement statistics  
- Filters and analytics  

---

### US-24: System Configuration
As a SysAdmin, I want to configure platform rules.

**Backend**
- College-level overrides  
- Workflow customization  

---

### US-25: Access Control Enforcement
As the system, I must enforce permissions.

**Backend**
- Server-side RBAC  
- Unauthorized access logging  
- Token invalidation on role change  

---