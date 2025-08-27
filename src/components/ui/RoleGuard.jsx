import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/types/userTypes";

const RoleGuard = ({ children, allowedRoles = [], fallbackRoute = "/" }) => {
  const { user, isAuthenticated, getUserType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const userType = getUserType();
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    // Redirecionar para dashboard específico do tipo de usuário
    const redirectRoute = userType === USER_TYPES.COMPANY ? "/dashboard-empresa" : "/dashboard";
    return <Navigate to={redirectRoute} replace />;
  }

  return children;
};

export default RoleGuard;