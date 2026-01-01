# TaskLine

TaskLine is a comprehensive web-based project management application designed to streamline team collaboration and enhance productivity through centralized digital workflow management.

## Objectives
- To design and implement a centralized project management platform  
- To enable users to create projects, assign tasks, and monitor deadlines  
- To provide real-time collaboration through task updates and notifications  
- To integrate progress tracking  
- To offer a user-friendly and scalable solution adaptable to teams of all sizes  

---

## Features

### Admin Features

#### User Management
- Add, edit, or remove team members  
- Track user activity  
- Manage user roles and permissions  

#### Task Assignment
- Assign tasks to individual or multiple team members  
- Set priorities (High, Medium, Normal, Low)  
- Create and manage sub-tasks  
- Update task status in real-time  

#### Workspace & Project Management
- Create multiple isolated workspaces  
- Create multiple projects within a workspace  

---

## Tech Stack
- Node.js and Express for backend  
- HTML, CSS, JavaScript / TypeScript and React for frontend  
- TailwindCSS for UI styling  
- JWT for authentication  
- Arject.js for email verification  
- MongoDB for storing data  

---

## Getting Started

Follow these steps to set up TaskLine on your local machine for development and testing.

### Prerequisites

#### System Requirements
- Operating System: Windows 10/11, macOS, or Linux  
- RAM: Minimum 4 GB (8 GB recommended)  
- Storage: At least 2 GB free space  
- Internet connection for dependency installation and MongoDB Atlas (if used)  

#### Software Requirements
- Node.js (version 16 or higher)  
- npm or yarn  
- MongoDB (local installation or MongoDB Atlas account)  
- Git  

---

## Installation and Setup

### 1. Clone the Repository

    git clone https://github.com/your-username/TaskLine.git
    cd TaskLine

### 2. Install Dependencies

#### Backend
    cd backend
    npm install

#### Frontend
    cd ../frontend
    npm install

---

### 3. Environment Variables

Create a `.env` file in both the **backend** and **frontend** directories.

#### Backend `.env` example
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
#### Frontend `.env` example
    VITE_API_URL=http://localhost:5000

---

### 4. Running the Application

#### Start Backend Server
    cd backend
    npm start

#### Start Frontend Application
    cd frontend
    npm run dev

---

## Accessing the Application

- **Frontend:** [http://localhost:5173](http://localhost:5173)  
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---
## Usage

After starting both the frontend and backend servers, open the application in your browser and follow the steps below:

- Create an account or log in to your existing account.
- Set up a new workspace to organize your teams and projects.
- Create one or multiple projects inside the workspace.
- Add team members to your workspace and assign roles and permissions.
- Create tasks and sub-tasks and assign them to team members.
- Set task priorities, deadlines, and status updates.
- Track project progress through task statuses and activity logs.
- Manage user access, view team activity, and update workspace or project details.
- Use email verification (Arject.js) and authentication (JWT) for secure access.
- Monitor API requests and application behavior using the Morgan logger.