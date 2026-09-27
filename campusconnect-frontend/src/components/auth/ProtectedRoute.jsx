import { Navigate } from "react-router-dom";

/**
 * Decode JWT payload and check if the token is expired.
 * Returns true if the token is expired or malformed.
 */
function isTokenExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false; // No expiry claim — treat as valid
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Malformed token
  }
}

/**
 * Route guard component that checks authentication and role authorization.
 * Redirects to /auth if not authenticated or not authorized for the role.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected component to render
 * @param {string[]} props.allowedRoles - Array of role strings that can access this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const authToken = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  // Not authenticated
  if (!authToken || !role || isTokenExpired(authToken)) {
    // Clear stale session data
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    return <Navigate to="/auth" replace />;
  }

  // Check role authorization with alias support (CLUB_ADMIN <-> ADMIN, CLUB_MEMBER <-> MEMBER)
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = role.toUpperCase();
    const hasAccess = allowedRoles.some((allowed) => {
      const target = allowed.toUpperCase();
      if (target === currentRole) return true;
      if (target === "CLUB_ADMIN" && (currentRole === "ADMIN" || currentRole === "CLUB_ADMIN")) return true;
      if (target === "CLUB_MEMBER" && (currentRole === "MEMBER" || currentRole === "CLUB_MEMBER" || currentRole === "ADMIN" || currentRole === "CLUB_ADMIN")) return true;
      if ((target === "CLUB_MENTOR" || target === "MENTOR") && (currentRole === "MENTOR" || currentRole === "CLUB_MENTOR")) return true;
      if (target === "STUDENT" && (currentRole === "STUDENT" || currentRole === "CLUB_ADMIN" || currentRole === "CLUB_MEMBER" || currentRole === "JOURNALIST")) return true;
      return false;
    });

    if (!hasAccess) {
      return <Navigate to="/auth" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
