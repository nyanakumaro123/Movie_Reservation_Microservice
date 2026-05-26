import { useState } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
  };

  // Jika user belum login, tampilkan halaman autentikasi (Login/Register)
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Jika sudah login, lempar data user ke komponen Dashboard
  return <Dashboard user={user} token={token} onLogout={handleLogout} />;
}