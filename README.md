xConfess
An anonymous confession platform where users can share their thoughts, react to confessions, and engage in private messaging. Built with Next.js (frontend) and NestJS (backend), offering high security, real-time interactions, and an intuitive UI.

👉 First, join our community on Telegram: https://t.me/xconfess_Community

Table of Contents
Installation

Usage

Roadmap

Contributing

License

Installation
Prerequisites
Node.js (v16 or higher)

PostgreSQL (for the backend)

Setup
Clone the repository:

bash
Copy
Edit
git clone https://github.com/YOUR_USERNAME/xconfess.git
cd xconfess
Install backend dependencies (NestJS):

bash
Copy
Edit
cd xconfess-backend
npm install
Install frontend dependencies (Next.js):

bash
Copy
Edit
cd ../xconfess-frontend
npm install
Set up environment variables:

Copy .env.example to .env in both frontend and backend folders.

Add your PostgreSQL database connection string and JWT secret.

Example for backend:

env
Copy
Edit
DATABASE_URL=postgres://username:password@localhost:5432/xconfess
JWT_SECRET=your-secret-key
Start the backend:

bash
Copy
Edit
cd xconfess-backend
npm run start:dev
Start the frontend:

bash
Copy
Edit
cd ../xconfess-frontend
npm run dev
Your app will run at:
Frontend → http://localhost:3000
Backend API → http://localhost:5000

Usage
Once the project is running, you can:

Make anonymous confessions

React to other users' confessions (Love, Funny, Sad, Confused, Angry, etc.)

Send direct messages to other users using their unique ID

Comment on confessions and receive replies

Filter confessions by Trending, Gender, and Date

🗺️ Roadmap
Here’s what we’re working on and planning next:

✅ Completed
🎉 Anonymous confession submission

🎭 Reaction system (7+ emotions)

💬 Comments and replies

🔐 JWT-based user authentication

📋 Unique User IDs with clipboard copy

🎨 Responsive UI with Tailwind CSS

🗂️ Role-based dashboard (Admin, User, Moderator)

⚙️ REST API for frontend consumption (Next.js + NestJS)

🪪 User registration with Gender + optional Age

🛠️ In Progress
📥 Secure private messaging with file attachments

📢 Real-time notifications (new comments, reactions, DMs)

🧠 Basic AI toxicity filter on confessions & comments

📤 Supabase integration for media storage (images/audio)

🔜 Coming Soon
📊 Analytics dashboard (for admins/mods)

📌 Confession pinning & moderation tools

🎭 Anonymous stories (long-form mode)

🌍 Multilingual support (i18n)

📱 React Native mobile app (iOS & Android)

We welcome feedback and contributions—see Issues to get started!

Contributing
We welcome contributions! Here's how to get involved:

Fork the repo to your GitHub account.

Clone your forked repo locally:

bash
Copy
Edit
git clone https://github.com/YOUR_USERNAME/xconfess.git
cd xconfess
Create a new branch:

bash
Copy
Edit
git checkout -b feature/your-feature-name
Make changes, commit, and push:

bash
Copy
Edit
git commit -m "Add feature"
git push origin feature/your-feature-name
Open a pull request!

License
This project is open-source and available under the MIT License.
