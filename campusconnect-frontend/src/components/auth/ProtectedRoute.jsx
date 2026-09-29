import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Decode JWT payload and check if the token is expired.
 * Returns true if the token is expired or malformed.
 */
function isTokenExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    // JWT uses Base64URL encoding — convert to standard Base64 before decoding
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '=' to make length a multiple of 4
    while (base64.length % 4 !== 0) base64 += "=";
    const payload = JSON.parse(atob(base64));
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
  const { routeProtection } = useAuth();
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

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!routeProtection(allowedRoles)) {
      const currentRole = role.toUpperCase();
      if (currentRole === "STUDENT") return <Navigate to="/campus-connect/student/dashboard" replace />;
      if (currentRole === "PROFESSOR") return <Navigate to="/campus-connect/professor/dashboard" replace />;
      if (currentRole === "COLLEGE_ADMIN") return <Navigate to="/campus-connect/college-admin/dashboard" replace />;
      if (currentRole === "JOURNALIST") return <Navigate to="/campus-connect/journalist/dashboard" replace />;
      
      const cid = localStorage.getItem("subLoginClubId");
      if (cid) {
        if (currentRole === "CLUB_ADMIN") return <Navigate to={`/campus-connect/club-admin/${cid}/dashboard`} replace />;
        if (currentRole === "CLUB_MEMBER") return <Navigate to={`/campus-connect/club-member/${cid}/dashboard`} replace />;
        if (currentRole === "CLUB_MENTOR") return <Navigate to={`/campus-connect/professor/clubs/${cid}/mentor-dashboard`} replace />;
      }
      return <Navigate to="/auth" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
