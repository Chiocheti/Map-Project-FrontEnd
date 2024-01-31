import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext';

export default function PrivateRoute({ children, isAdmin = false, isPrivate = true }) {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) return null;

  if ((isPrivate || isAdmin) && !user && !isLoading) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
}
