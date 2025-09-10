import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'participant';
  plan_id?: string;
}

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('eventflow_user');
      
      if (!userData) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData) as User;
        
        if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
          navigate('/login');
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('eventflow_user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;