import { createContext, useContext, useState, useCallback } from "react";
import { authApi, studentApi, journalistApi, clubAdminApi, clubMemberApi, professorApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("userEmail");
    if (token && role) {
      return { email: email || "", role };
    }
    return null;
  });
  // set auth token in local storage
  const setToken = (token) => {
    localStorage.setItem("authToken", token);
  };

  // handle login for primary roles (collegeAdmin, professor, student)
  const login = async (email, password, role) => {
    try {
      const data = await authApi.login(email, password, role);

      if (data && data.token) {
        setToken(data.token);
        const roleName =
          role === "professor"
            ? "PROFESSOR"
            : role === "student"
            ? "STUDENT"
            : "COLLEGE_ADMIN";
        localStorage.setItem("role", roleName);
        if (email) {
          localStorage.setItem("userEmail", email);
        }
        setUser({ email, role: roleName });
        return data.redirectUrl;
      }
      return "Invalid email or password. Please try again.";
    } catch (err) {
      if (err.message === "EXPIRE") {
        return "EXPIRE subscription";
      }
      if (
        err.isServerDown ||
        err.status === 0 ||
        err.status >= 500 ||
        err.message?.includes("connect to server")
      ) {
        return "Unable to connect to server. Please try again shortly.";
      }
      return err.message || "Invalid email or password. Please try again.";
    }
  };

  // Sub-dashboard login for journalist:
  // Seamless token swap: replace student token with journalist token upon successful verification
  const subLoginJournalist = async (password) => {
    try {
      const data = await studentApi.subLoginJournalist(password);
      if (data && data.token && data.success !== false) {
        // Atomically replace student session with journalist session
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", "JOURNALIST");
        setUser({ role: "JOURNALIST" });
        return data.redirectUrl || "/campus-connect/journalist/dashboard";
      }
      throw new Error(data?.message || "Invalid journalist password");
    } catch (err) {
      throw err;
    }
  };

  // Sub-dashboard login for clubs (Admin or Member):
  // Seamless token swap: replace student token with club admin/member token
  const subLoginClub = async (clubId, password) => {
    try {
      const data = await studentApi.subLoginClub(clubId, password);
      if (data && data.token && data.success !== false) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", data.role || "CLUB_ADMIN");
        localStorage.setItem("subLoginClubId", clubId.toString());
        setUser({ role: data.role || "CLUB_ADMIN" });
        return data.redirectUrl || `/campus-connect/club-admin/${clubId}/dashboard`;
      }
      throw new Error(data?.message || "Invalid club password");
    } catch (err) {
      throw err;
    }
  };

  // Return to student dashboard from sub-dashboard (Journalist, Club Admin, Club Member):
  // Requires only student password (session is securely verified and swapped)
  // BUG-030 fix: No fallback re-login — if token-swap fails, surface the error.
  const returnToStudent = async (password, emailFallback, clubId) => {
    const currentRole = localStorage.getItem("role") || user?.role;
    const pathMatch =
      window.location.pathname.match(/\/campus-connect\/club-(?:admin|member)\/(\d+)/) ||
      window.location.pathname.match(/\/campus-connect\/clubs\/(\d+)/);
    const targetClubId = clubId || (pathMatch ? pathMatch[1] : null);

    let data;
    if (currentRole === "CLUB_ADMIN" && targetClubId) {
      data = await clubAdminApi.returnToStudent(targetClubId, password);
    } else if (currentRole === "CLUB_MEMBER" && targetClubId) {
      data = await clubMemberApi.returnToStudent(targetClubId, password);
    } else {
      data = await journalistApi.returnToStudent(password);
    }

    if (data && data.token && data.success !== false) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", "STUDENT");
      localStorage.removeItem("subLoginClubId");
      const studentEmail = emailFallback || localStorage.getItem("userEmail") || user?.email || "";
      setUser({ email: studentEmail, role: "STUDENT" });
      return data.redirectUrl || "/campus-connect/student/dashboard";
    }
    throw new Error(data?.message || "Invalid student password");
  };

  // Sub-dashboard login for club mentor (Professor -> Club Mentor):
  // Seamless token swap: replace professor token with club mentor token
  const subLoginMentor = async (clubId, password) => {
    try {
      const data = await professorApi.subLoginMentor(clubId, password);
      if (data && data.token && data.success !== false) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", data.role || "CLUB_MENTOR");
        localStorage.setItem("subLoginClubId", clubId.toString());
        setUser({ role: data.role || "CLUB_MENTOR" });
        return data.redirectUrl || `/campus-connect/professor/clubs/${clubId}/mentor-dashboard`;
      }
      throw new Error(data?.message || "Invalid club mentor password");
    } catch (err) {
      throw err;
    }
  };

  // Return to professor dashboard from club mentor dashboard:
  // Requires professor account password
  const returnToProfessor = async (password, clubId) => {
    const pathMatch =
      window.location.pathname.match(/\/campus-connect\/professor\/clubs\/(\d+)/) ||
      window.location.pathname.match(/\/campus-connect\/clubs\/(\d+)/);
    const targetClubId = clubId || (pathMatch ? pathMatch[1] : null);

    try {
      const data = await professorApi.returnToProfessor(targetClubId, password);
      if (data && data.token && data.success !== false) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", "PROFESSOR");
        localStorage.removeItem("subLoginClubId");
        const profEmail = localStorage.getItem("userEmail") || user?.email || "";
        setUser({ email: profEmail, role: "PROFESSOR" });
        return data.redirectUrl || "/campus-connect/professor/dashboard";
      }
      throw new Error(data?.message || "Invalid professor password");
    } catch (err) {
      throw err;
    }
  };

  // handle logout
  const logout = async () => {
    try {
      if (localStorage.getItem("authToken")) {
        await authApi.logout().catch(() => {});
      }
    } finally {
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userEmail");
    }
  };

  // college admin signup
  const collegeSignup = async (payload) => {
    try {
      const data = await authApi.collegeSignup(payload);
      if (data && data.token) {
        setToken(data.token);
        localStorage.setItem("role", "COLLEGE_ADMIN");
        setUser({ email: payload.email, role: "COLLEGE_ADMIN" });
        return data.redirectUrl;
      }
      throw new Error("Signup failed. No token received.");
    } catch (error) {
      throw error;
    }
  };

  // student signup
  const studentSignup = async (formData) => {
    try {
      const data = await authApi.studentSignup(formData);
      if (data && data.token) {
        setUser({
          email: formData.email,
          role: "STUDENT",
          college: formData.collegeName,
        });
        setToken(data.token);
        localStorage.setItem("role", "STUDENT");
        return data.redirectUrl;
      }
      throw new Error("Signup failed. No token received.");
    } catch (error) {
      throw error;
    }
  };

  // professor signup
  const professorSignup = async (formData) => {
    try {
      const data = await authApi.professorSignup(formData);
      if (data && data.token) {
        setUser({
          email: formData.email,
          role: "PROFESSOR",
          college: formData.collegeName,
        });
        setToken(data.token);
        localStorage.setItem("role", "PROFESSOR");
        return data.redirectUrl || "/campus-connect/professor/dashboard";
      }
      throw new Error("Signup failed. No token received.");
    } catch (error) {
      throw error;
    }
  };

  // BUG-019 fix: Sub-roles (CLUB_ADMIN, CLUB_MEMBER, JOURNALIST) should NOT
  // inherit STUDENT route access. When operating under a role-swapped JWT,
  // only routes matching the current role (or its aliases) are allowed.
  const routeProtection = useCallback((roleName) => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    if (!authToken || !role) {
      return false;
    }
    const currentRole = role.toUpperCase();

    const matchesRole = (target) => {
      const t = target.toUpperCase();
      if (t === currentRole) return true;
      // CLUB_ADMIN aliases: ADMIN
      if (t === "CLUB_ADMIN" && currentRole === "ADMIN") return true;
      if (t === "ADMIN" && currentRole === "CLUB_ADMIN") return true;
      // CLUB_MEMBER aliases: MEMBER (CLUB_ADMIN can also access CLUB_MEMBER routes)
      if (t === "CLUB_MEMBER" && (currentRole === "MEMBER" || currentRole === "CLUB_ADMIN" || currentRole === "ADMIN")) return true;
      if (t === "MEMBER" && currentRole === "CLUB_MEMBER") return true;
      // CLUB_MENTOR aliases: MENTOR
      if ((t === "CLUB_MENTOR" || t === "MENTOR") && (currentRole === "MENTOR" || currentRole === "CLUB_MENTOR")) return true;
      // STUDENT: only exact match — sub-roles do NOT inherit student access
      if (t === "STUDENT") return currentRole === "STUDENT";
      // PROFESSOR: only exact match
      if (t === "PROFESSOR") return currentRole === "PROFESSOR";
      // JOURNALIST: only exact match
      if (t === "JOURNALIST") return currentRole === "JOURNALIST";
      // COLLEGE_ADMIN: only exact match
      if (t === "COLLEGE_ADMIN") return currentRole === "COLLEGE_ADMIN";
      return false;
    };

    if (Array.isArray(roleName)) {
      return roleName.some(matchesRole);
    }
    return matchesRole(roleName);
  }, []);

  const isClubAdmin = () => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    if (!authToken) return false;
    const currentRole = (role || "").toUpperCase();
    return currentRole === "CLUB_ADMIN" || currentRole === "ADMIN";
  };

  const isClubMember = () => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    if (!authToken) return false;
    const currentRole = (role || "").toUpperCase();
    return (
      currentRole === "CLUB_MEMBER" ||
      currentRole === "MEMBER" ||
      currentRole === "CLUB_ADMIN" ||
      currentRole === "ADMIN"
    );
  };

  const isClubMentor = () => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    if (!authToken) return false;
    const currentRole = (role || "").toUpperCase();
    return currentRole === "CLUB_MENTOR" || currentRole === "MENTOR";
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        subLoginJournalist,
        subLoginClub,
        returnToStudent,
        subLoginMentor,
        returnToProfessor,
        logout,
        collegeSignup,
        studentSignup,
        professorSignup,
        user,
        routeProtection,
        isClubAdmin,
        isClubMember,
        isClubMentor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
