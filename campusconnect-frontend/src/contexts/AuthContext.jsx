import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // set auth token in local storage
  const setToken = (token) => {
    localStorage.setItem("authToken", token);
  };

  // handle login for different roles
  const login = async (email, password, role) => {
    let url = "";
    let roleName = "";

    if (role === "journalist") {
      url = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/journalist/login`;
      roleName = "JOURNALIST";
    } else if (role === "reviewer") {
      url = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/reviewer/login`;
      roleName = "REVIEWER";
    } else if (role === "student") {
      url = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student/login`;
      roleName = "STUDENT";
    } else if (role === "collegeAdmin") {
      url = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/college-admin/login`;
      roleName = "COLLEGE_ADMIN";
    }
    // call backend API for login
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: roleName,
        }),
      });

      const data = await res.json();

      if (data && data.token) {
        setToken(data.token);
        localStorage.setItem("role", roleName);
        setUser({ email, role });
        return data.redirectUrl;
      } else if (data && data.role == "EXPIRE") {
        return "EXPIRE subscription";
      }

      return "Invalid credentials";
    } catch (err) {
      console.error(err);
      return "Invalid credentials";
    }
  };

  // handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
  };

  // collage admin signup
  const collegeSignup = async (payload) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/campus-connect/college-admin/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("role", "COLLEGE_ADMIN");
      setUser({ email: payload.email, role: "COLLEGE_ADMIN" });
      return data.redirectUrl;
    } catch (error) {
      console.error("Register student error:", error);
      throw error;
    }
  };

  // student signup
  const studentSignup = async (formData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Student registration failed");
      }

      const data = await response.json();
      console.log("Student registered successfully:", data);

      setUser({
        email: formData.email,
        role: "STUDENT",
        college: formData.collegeName,
      });

      setToken(data.token);
      localStorage.setItem("role", "STUDENT");
      return data.redirectUrl;
    } catch (error) {
      console.error("Register student error:", error);
      throw error;
    }
  };

  const routeProtection = (roleName) => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    if (!authToken || !role) {
      return false;
    } else if (role !== roleName) {
      return false;
    }
    return true;
  };

  const isClubAdmin = async (clubId) => {
    return true;
    
  };

  const isClubMember = async (clubId) => {
    return true;
  };
  
  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        collegeSignup,
        studentSignup,
        user,
        routeProtection,
        isClubAdmin,
        isClubMember,
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
