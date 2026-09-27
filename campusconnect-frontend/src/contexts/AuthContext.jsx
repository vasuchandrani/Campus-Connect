import { createContext, useContext, useState, useCallback } from "react";
import { authApi, studentApi, journalistApi, clubAdminApi, clubMemberApi, professorApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
      } else if (data && data.success === false && data.message === "EXPIRE") {
        return "EXPIRE subscription";
      }

      return "Invalid email or password. Please try again.";
    } catch (err) {
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
  const returnToStudent = async (password, emailFallback, clubId) => {
    const currentRole = localStorage.getItem("role") || user?.role;
    const pathMatch =
      window.location.pathname.match(/\/campus-connect\/club-(?:admin|member)\/(\d+)/) ||
      window.location.pathname.match(/\/campus-connect\/clubs\/(\d+)/);
    const targetClubId = clubId || (pathMatch ? pathMatch[1] : null);

    try {
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
        const studentEmail = emailFallback || localStorage.getItem("userEmail") || user?.email || "";
        setUser({ email: studentEmail, role: "STUDENT" });
        return data.redirectUrl || "/campus-connect/student/dashboard";
      }
      throw new Error(data?.message || "Invalid student password");
    } catch (err) {
      // Fallback: if student email is known in client session, attempt direct login
      const fallbackEmail = emailFallback || localStorage.getItem("userEmail") || user?.email;
      if (fallbackEmail) {
        try {
          const fallbackData = await authApi.login(fallbackEmail, password, "student");
          if (fallbackData && fallbackData.token) {
            localStorage.setItem("authToken", fallbackData.token);
            localStorage.setItem("role", "STUDENT");
            setUser({ email: fallbackEmail, role: "STUDENT" });
            return fallbackData.redirectUrl || "/campus-connect/student/dashboard";
          }
        } catch (_) {
          // preserve original error from returnToStudent
        }
      }
      throw err;
    }
  };

  // Sub-dashboard login for club mentor (Professor -> Club Mentor):
  // Seamless token swap: replace professor token with club mentor token
  const subLoginMentor = async (clubId, password) => {
    try {
      const data = await professorApi.subLoginMentor(clubId, password);
      if (data && data.token && data.success !== false) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", data.role || "CLUB_MENTOR");
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
        const profEmail = localStorage.getItem("userEmail") || user?.email || "";
        setUser({ email: profEmail, role: "PROFESSOR" });
        return data.redirectUrl || "/campus-connect/professor/dashboard";
      }
      throw new Error(data?.message || "Invalid professor password");
    } catch (err) {
      const fallbackEmail = localStorage.getItem("userEmail") || user?.email;
      if (fallbackEmail) {
        try {
          const fallbackData = await authApi.login(fallbackEmail, password, "professor");
          if (fallbackData && fallbackData.token) {
            localStorage.setItem("authToken", fallbackData.token);
            localStorage.setItem("role", "PROFESSOR");
            setUser({ email: fallbackEmail, role: "PROFESSOR" });
            return fallbackData.redirectUrl || "/campus-connect/professor/dashboard";
          }
        } catch (_) {
          // preserve original error
        }
      }
      throw err;
    }
  };

  // handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
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

  const routeProtection = useCallback((roleName) => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    if (!authToken || !role) {
      return false;
    }
    const currentRole = role.toUpperCase();
    if (Array.isArray(roleName)) {
      return roleName.some((r) => {
        const target = r.toUpperCase();
        if (target === currentRole) return true;
        if (target === "CLUB_ADMIN" && (currentRole === "ADMIN" || currentRole === "CLUB_ADMIN")) return true;
        if (target === "CLUB_MEMBER" && (currentRole === "MEMBER" || currentRole === "CLUB_MEMBER" || currentRole === "ADMIN" || currentRole === "CLUB_ADMIN")) return true;
        if ((target === "CLUB_MENTOR" || target === "MENTOR") && (currentRole === "MENTOR" || currentRole === "CLUB_MENTOR")) return true;
        if (target === "STUDENT" && (currentRole === "STUDENT" || currentRole === "CLUB_ADMIN" || currentRole === "CLUB_MEMBER" || currentRole === "JOURNALIST")) return true;
        return false;
      });
    }
    const target = roleName.toUpperCase();
    if (target === currentRole) return true;
    if (target === "CLUB_ADMIN") return currentRole === "CLUB_ADMIN" || currentRole === "ADMIN";
    if (target === "CLUB_MEMBER") return currentRole === "CLUB_MEMBER" || currentRole === "MEMBER" || currentRole === "CLUB_ADMIN" || currentRole === "ADMIN";
    if (target === "CLUB_MENTOR" || target === "MENTOR") return currentRole === "CLUB_MENTOR" || currentRole === "MENTOR";
    if (target === "STUDENT") return currentRole === "STUDENT" || currentRole === "CLUB_ADMIN" || currentRole === "CLUB_MEMBER" || currentRole === "JOURNALIST";
    return false;
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
