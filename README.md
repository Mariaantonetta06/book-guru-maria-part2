# 📚 Book Guru – Book Management System

[![Build Status](http://localhost:8080/buildStatus/icon?job=book-guru-pipeline)](http://localhost:8080/job/book-guru-pipeline/)

> **Note:** This README covers Part 1, Part 2, and Part 3 of the DevOps project.

---

## 👥 Team Roles

1. DevOps Lead – Angel
	- Manages GitHub repository structure
	- Creates and maintains main, dev, and feature branches
	- Reviews and merges pull requests
	- Handles SCM tools (GitKraken, .gitignore, .gitattributes, .gitkeep)
	- Ensures repository stays conflict-free and stable

2. Project Coordinator / Scrum Master – Alisha
	- Plans sprints and manages tasks using Jira/Asana
	- Tracks progress and ensures deadlines are met
	- Leads stand-ups every Monday & Friday (15 mins)
	- Oversees documentation, reporting, and submission
	- Ensures DevOps principles are applied (Lean, Agile, Scrumban, TDD mindset)

3. Release Manager – Maria
	- Leads integration and verifies feature compatibility
	- Ensures all features work together across frontend + backend
	- Oversees Testing & Debugging sprint
	- Validates JSON read/write consistency and UI behaviour
	- Prepares final demo build for Sprint 6

---

## ⚙️ DevOps Principles We Follow

Our team applied several core DevOps principles throughout Part 1:

1. Lean Principles
	- Reduce waste (avoid redundant work, small iterative commits)
	- Improve flow (short sprints, continuous integration)
	- Quick feedback loops (frequent testing + early integration)

2. Collaboration & Communication
	- Daily communication in group chat
	- Stand-up meetings twice a week
	- Transparent task tracking using Jira/Asana

3. Automation Mindset
	- Used standardized GitHub labels to categorize issues and PRs
	- Milestones used to group work by release/sprint

5. Continuous Integration
	- All features developed in isolated branches
	- Merged into dev only after PR review
	- Integrated early to prevent conflicts

6. TDD Influence

While Part 1 did not require full automated testing, we adopted the mindset:
	- Define test cases upfront
	- Develop backend logic to meet test expectations
	- Validate success and error scenarios manually

---

## 🧭 Project Methodology

We used a hybrid "Scrumban" approach
	- Scrum elements:
	- 6 structured sprints
	- Stand-ups
	- Clear sprint goals
	- Iterative delivery
	- Kanban elements:
	- Visual board (To Do → In Progress → Done)
	- Continuous task flow
	- Easy tracking of responsibilities

Why Scrumban?
	- Perfect for a small 3-person team
	- Flexible enough for real-time changes
	- Still structured enough to meet deadlines

---

## 🚀 Part 3: CI/CD Pipeline Implementation

### Pipeline Architecture
Our automated CI/CD pipeline uses Jenkins and Docker, implementing the following stages:

#### **Build Stage**
- Checks out latest code from GitHub
- Installs npm dependencies using `npm ci`
- Creates Docker image tagged with build number: `book-guru:${BUILD_NUMBER}`
- Stores image for deployment

#### **Test Stage**  
- Runs Jest unit tests (6 test cases)
- Executes API integration tests
- Generates code coverage report (58.24% coverage)
- **All 6 tests must pass** before proceeding to deployment

#### **Deploy Stage**
- Stops and removes previous container (if exists)
- Deploys new Docker container on port 30050
- Implements health checks (30-second intervals)
- Container runs with resource limits (128Mi memory, 500m CPU)

### Additional Features Implemented

1. **Blue Ocean Dashboard**
   - Visual pipeline representation
   - Stage-by-stage execution view
   - Real-time build status and logs
   - Enhanced developer experience

2. **Health Monitoring & Logging**
   - Automated container health checks
   - Build metrics tracking (success rate, duration)
   - Docker container status monitoring
   - Comprehensive logging for debugging

3. **Automated Build Status Badge**
   - GitHub README integration
   - Real-time pipeline status visibility
   - Professional DevOps presentation

### Technology Stack (Part 3)
- **CI/CD:** Jenkins with Blue Ocean plugin
- **Containerization:** Docker with multi-stage builds
- **Automation:** Jenkinsfile (declarative pipeline)
- **Monitoring:** Docker health checks, Jenkins logs
- **Testing:** Jest with code coverage (Istanbul)

### Quick Start - Part 3
```bash
# Run locally
npm install
npm run test:coverage
node index.js

# Docker deployment
docker build -t book-guru:latest .
docker run -d -p 30050:5050 book-guru:latest

# Access application
http://localhost:30050
```

---

## 🔀 GitFlow Strategy

We follow a clean and industry-standard GitFlow model:

Primary Branches
	- main → stable, production-ready branch
	- testing-branch → integration branch (all features merge here first)

Feature Branch Pattern

Each member uses:

feature/<name>-<feature-name>

Examples:

feature/angel-delete-book
feature/alisha-view-book
feature/maria-add-book

Pull Request Workflow
	1.	Create feature/* branch
	2.	Commit with meaningful messages
	3.	Push to GitHub
	4.	Open Pull Request → merge into dev (testing branch)
	5.	DevOps Lead (Angel) reviews + resolves conflicts
	6.	After Sprint 4 testing → merge dev ( testing branch) → main

---

## 🌱 GitFlow Diagram (Mermaid)

gitGraph
   commit id: "Start Project"
   branch "Testing-Branch" order: 1
   checkout "Testing-Branch"
   commit id: "Setup Repo & Structure"

   branch "feature/angel-delete-book" order: 2
   checkout "feature/angel-delete-book"
   commit id: "Implement Delete Book Logic"
   checkout "Testing-Branch"
   merge "feature/angel-delete-book" id: "Testing Branch - delete"

   branch "feature/alisha-retrieve-book" order: 3
   checkout "feature/alisha-retrieve-book"
   commit id: "Implement Retrieve Book Logic"
   checkout "Testing-Branch"
   merge "feature/alisha-retrieve-book" id: "Testing Branch - get"

   branch "feature/maria-add-book" order: 4
   checkout "feature/maria-add-book"
   commit id: "Implement Add Book Logic"
   checkout "Testing-Branch"
   merge "feature/maria-add-book" id: "Testing Branch - add"

   checkout main
   merge "Testing-Branch" id: "Final Merge for Part 1"

---

## 🏃 Sprint Structure (Jira Scrum Board)

We used 6 sprints, each aligned with DevOps stages:

Sprint 1 – Setup & Planning

Repo creation, JSON structure, wireframes, templates, Asana/Jira setup

Sprint 2 – Feature Development

Each developer builds ONE feature:
	- Add Book (Maria)
	- Retrieve Book (Alisha)
	- Delete Book (Angel)

Sprint 3 – Integration & Version Control

Link frontend scripts, connect APIs, debug combined flow

Sprint 4 – Testing & Debugging

Validate:
	- success case
	- missing/empty input
	- invalid or duplicate entries
Fix issues before merging

Sprint 5 – SCM & Documentation

Git screenshots, GitHub labels/milestones, README, report sections

Sprint 6 – Presentation & Submission

Slides, demo walkthrough, final LMS submission

---

## 📁 Repository Structure

/public
   /js
     - alisha-view-book.js
     - maria-add-book.js
     - angel-delete-book.js
   index.html
   styles.css

/utils
   MariaAddBookUtil.js
   AlishaViewBookUtil.js
   AngelDeleteBookUtil.js
   library.json
   library.template.json

index.js
README.md
.gitignore
.gitattributes

---

## 🎯 Summary

This README documents:
	- Team roles
	- DevOps principles
	- Scrumban methodology
	- GitFlow strategy
	- 6-sprint DevOps workflow
	- CI/CD pipeline implementation
	- Repo structure

Figma wireframe: https://www.figma.com/design/NcvqF5vcVFNvbMNn8nXGjN/book-guru?node-id=0-1&t=uR7p07mMASKMfOFB-1

---

## 👤 Author
**Maria Arul Antonetta Antony**  
Feature: Add Book Functionality  
CI/CD Pipeline Implementation (Part 3)