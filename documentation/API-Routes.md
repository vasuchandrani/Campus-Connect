# Campus Connect — API Routes

This document lists all application routes used in Campus Connect.  
Routes are grouped by user role and describe **how each route is hit and what it represents**.

---

## Base Path


`/campus-connect`

All routes are relative to the base path.

---

## 1. Public Routes

### `/campus-connect/home`
- Landing / home page of Campus Connect

### `/campus-connect/role-selection`
- Triggered when the user clicks **Get Started**
- Used to select the user role before authentication

---

## 2. College Admin Routes

> Used when `role == College Admin`

### `/campus-connect/choose-subscription`
- College Admin selects a subscription plan
- Required before registering a college

### `/campus-connect/collegeadmin-signup`
- Accessed after successful subscription selection and payment
- Collects complete college and admin details

### `/campus-connect/collegeadmin-signin`
- College Admin signs in
- Redirects to College Admin dashboard

---

## 3. Club Admin Routes

> Used when `role == Club Admin`

### `/campus-connect/choose-college`
- Club Admin selects the college they belong to

### `/campus-connect/clubadmin-signup`
- Club Admin submits club details
- Sends a verification request to College Admin
- Club is not active until approved

### `/campus-connect/verify-request`
- Used by Club Admin to check the status of the club verification request
- Request is tracked using a request ID

### `/campus-connect/clubadmin-signin`
- Available only after club verification
- Club Admin signs in to the dashboard

### `/campus-connect/clubadmin-dashboard`
- Club Admin dashboard
- Used to:
  - Add club members
  - Edit club information
  - Manage club activities

---

## 4. Club Member Routes

> Club Members are added by Club Admins  
> No signup is required

### `/campus-connect/clubmember-signin`
- Club Member signs in using:
  - Club ID
  - Email
  - Password

---

## 5. Student Routes

> Used when `role == Student`

### `/campus-connect/choose-college`
- Student selects their college from existing registered colleges

### `/campus-connect/student-signup`
- Student registers by providing personal and academic details

### `/campus-connect/student-signin`
- Student signs in
- Redirects to Student dashboard

---

## 6. Reviewer Routes

> Reviewers are assigned by College Admin  
> No signup is required

### `/campus-connect/reviewer-signin`
- Reviewer signs in using existing credentials

---

## 7. Journalist Routes

> Journalists are assigned by College Admin  
> No signup is required

### `/campus-connect/journalist-signin`
- Journalist signs in to access journalist dashboard

---