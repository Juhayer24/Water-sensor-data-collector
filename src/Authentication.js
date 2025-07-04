import {useEffect, createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, isLoadingFlag] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')

    if (storedUser) {
      setUser({ user: storedUser })
    }
    isLoadingFlag(false)
  }, []);
  
  const login = (userData) =>  {
    setUser(userData)
    localStorage.setItem('currentUser', userData.user)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  } 

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);