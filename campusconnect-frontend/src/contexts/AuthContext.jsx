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
    url = "http://localhost:8080/campus-connect/journalist/login";
    roleName = "JOURNALIST";
  } 
  else if (role === "reviewer") {
    url = "http://localhost:8080/campus-connect/reviewer/login";
    roleName = "REVIEWER";
  } 
  else if (role === "student") {
    url = "http://localhost:8080/campus-connect/student/login";
    roleName = "STUDENT";
  } 
  else if (role === "collegeAdmin") {
    url = "http://localhost:8080/campus-connect/college-admin/login";
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
      setUser({ email, role });
      return data.redirectUrl; 
    }
    

    return "Invalid credentials";
  } catch (err) {
    console.error(err);
    return "Invalid credentials";
  }
};

// handle logout
  const logout = () =>{ 
    setUser(null);
    localStorage.removeItem("authToken");
  }


  // collage admin signup
  const collegeSignup = async (payload) => {
    try{
      const res = await fetch("http://localhost:8080/campus-connect/college-admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setToken(data.token);
      setUser({ email: payload.email, role: "COLLEGE_ADMIN" });
      return data.redirectUrl; 
    }
    catch(error) {
      console.error("Register student error:", error);
      throw error;
    }
};

// student signup
const studentSignup = async (formData) => {
  try {
    const response = await fetch("http://localhost:8080/campus-connect/student/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    

    if (!response.ok) {
      throw new Error("Student registration failed");
    }

    const data = await response.json();

    setUser({
      email: formData.email,
      role: "STUDENT",
      college: formData.collegeName,
    });

    setToken(data.token);
    return data.redirectUrl;
  } catch (error) {
    console.error("Register student error:", error);
    throw error;
  }
};


  return (
<AuthContext.Provider
  value={{
    login,
    logout,
    collegeSignup,
    studentSignup,
    user,
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
