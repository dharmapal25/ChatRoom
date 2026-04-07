# Frontend Authentication Setup

## Installation

The required packages have been installed. Create a `.env.local` file in the Frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Implementation Guide

### 1. Update App.jsx with Router and AuthProvider

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; // Your home page

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### 2. Update package.json with React Router

Run in Frontend directory:
```bash
npm install react-router-dom
```

## Features

✅ **Access Token (Memory)** - Short-lived JWT stored in memory
✅ **Refresh Token (Cookies)** - Long-lived token in httpOnly cookies
✅ **Automatic Token Refresh** - Axios interceptor handles token expiration
✅ **Protected Routes** - PrivateRoute component for auth-required pages
✅ **Auth Context** - Global state management with useAuth hook
✅ **Error Handling** - Comprehensive error messages
✅ **CORS with Credentials** - Cookies sent with requests

## File Structure

```
Frontend/src/
├── services/
│   ├── api.js                 # Axios instance with interceptors
│   └── authService.js         # Auth API calls
├── context/
│   └── AuthContext.jsx        # Auth context provider
├── components/
│   └── PrivateRoute.jsx       # Protected route wrapper
├── pages/
│   ├── LoginPage.jsx          # Login form
│   └── RegisterPage.jsx       # Register form
└── App.jsx                    # Main app with routing
```

## Usage

### In Components

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout, error } = useAuth();

  if (!isAuthenticated) return <p>Not logged in</p>;

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Token Flow

1. **Register/Login** → Backend sets `refreshToken` in httpOnly cookie
2. **Access Token** → Stored in localStorage and memory
3. **Requests** → Axios interceptor adds access token to headers
4. **Token Expired** → Interceptor calls `/auth/refresh` endpoint
5. **New Access Token** → Updated in memory and localStorage
6. **Refresh Failed** → Redirected to login, token cleared

## Security

- ✅ Access token in memory (prevents XSS attacks)
- ✅ Refresh token in httpOnly cookies (prevents CSRF attacks)
- ✅ Automatic token refresh on expiration
- ✅ CORS with credentials enabled
- ✅ Secure flag on cookies in production

## Next Steps

1. Install React Router: `npm install react-router-dom`
2. Update App.jsx with routes
3. Add HomePage or other protected pages
4. Test login/register flows
