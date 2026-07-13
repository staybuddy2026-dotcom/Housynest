import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, redirectPath = '/login' }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('accessToken');
  
  if (!token || !userStr) {
    return <Navigate to={redirectPath} replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their respective dashboard or home if unauthorized role
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
    return children;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
