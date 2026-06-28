<div align="center">

<img src="Frontend/public/Flash.png" width="90" style="border-radius:16px" />

# ChatRoom

### Real-time rooms for real conversations.

Create rooms. Invite people. Chat instantly.

[![Live Demo](https://img.shields.io/badge/Live-chatroom--hub.vercel.app-00c950?style=for-the-badge)](https://chatroom-hub.vercel.app)

<br/>

![React](https://img.shields.io/badge/React+Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## About ChatRoom

ChatRoom is a full-stack real-time chat application where users can create private rooms, request access, approve members, and communicate instantly.

The app combines a React + Vite frontend with an Express.js backend, MongoDB database, JWT authentication, email OTP verification, and Socket.IO live messaging.

It is designed for secure room-based conversations with ownership controls, request handling, saved messages, and a responsive user interface.

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | [chatroom-hub.vercel.app](https://chatroom-hub.vercel.app) |
| Backend | [chatroom-hub-server.onrender.com](https://chatroom-hub-server.onrender.com) |

---

## Main Features

| Feature | Description |
|---------|-------------|
| Real-time messaging | Send and receive room messages instantly with Socket.IO. |
| Email OTP signup | New users verify their email before account creation. |
| JWT authentication | Access tokens and refresh cookies protect user sessions. |
| Private rooms | Users can create rooms for focused conversations. |
| Join requests | Members request access before entering protected rooms. |
| Owner approval | Room owners can approve or reject join requests. |
| Request notifications | Room owners can see pending access requests. |
| Persistent messages | Chat messages are saved in MongoDB. |
| Responsive UI | Pages work smoothly across desktop and mobile screens. |

---

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JSON Web Token
- Bcrypt
- Nodemailer

### Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Email Service | Gmail SMTP |

---

## Folder Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   └── routes
│   ├── package.json
│   └── server.js
├── Frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── styles
│   │   └── utils
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/dharmapal25/ChatRoom.git
cd ChatRoom
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

### Start Backend Server

```bash
cd ../backend
npm start
```

### Start Frontend

```bash
cd ../Frontend
npm run dev
```

---

## Environment Variables

Create `backend/.env`:

```env
FRONTEND_URL=https://chatroom-hub.vercel.app
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=production
PORT=5000
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
MONGO_URI=your_mongodb_connection_string
```

Create `Frontend/.env.development`:

```env
VITE_API_URL=http://localhost:5000/api
```

Create `Frontend/.env.production`:

```env
VITE_API_URL=https://chatroom-hub-server.onrender.com/api
```

---

## Author

<div align="center">

### Dharmapal (Flash)

[![Portfolio](https://img.shields.io/badge/Portfolio-flash--devs.vercel.app-000000?style=for-the-badge)](https://flash-devs.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-dharmapal25-181717?style=for-the-badge&logo=github)](https://github.com/dharmapal25)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dharmapal25-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/dharmapal25)

</div>

---

<div align="center">

### Built with love by Dharmapal

</div>
