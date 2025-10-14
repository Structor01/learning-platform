import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/types/userTypes";

export const useUserPermissions = () => {
  const { user, isAuthenticated, getUserType, isCompany, isCandidate } = useAuth();

  const hasRole = (role) => {
    return getUserType() === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(getUserType());
  };

  const canAccessCompanyFeatures = () => {
    return isCompany() && isAuthenticated;
  };

  const canAccessCandidateFeatures = () => {
    return isCandidate() && isAuthenticated;
  };

  return {
    user,
    isAuthenticated,
    getUserType,
    isCompany,
    isCandidate,
    hasRole,
    hasAnyRole,
    canAccessCompanyFeatures,
    canAccessCandidateFeatures,
    USER_TYPES
  };
};