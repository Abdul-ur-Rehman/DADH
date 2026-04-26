// // src/context/AuthContext.js
// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // { role: "admin", token: "..." }

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem("data"));
//     if (savedUser) setUser(savedUser);
//   }, []);

//   const login = (role) => {
//     const newUser = { role, token: "token" };
//     setUser(newUser);
//     localStorage.setItem("user", JSON.stringify(newUser));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user = { role, token, ... }

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("data")); // fixed key name to "user"
    if (savedUser) setUser(savedUser);
  }, []);

  const login = (userData) => {
    // userData = { role, token, ... }
    setUser(userData);
    localStorage.setItem("data", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("sendBirdUserId");
    localStorage.removeItem("sendBirdUserName");
    localStorage.removeItem("data"); // optional if still used elsewhere
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
