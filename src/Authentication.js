import { useEffect, createContext, useContext, useState } from "react";

// Create a React Context for authentication, starting with null (no user)
const AuthContext = createContext(null);

// This component wraps your app and provides auth state & functions to children
export const AuthProvider = ({ children }) => {
  // State to hold the current logged-in user info (null means no user logged in)
  const [user, setUser] = useState(null);

  // State to track if auth info is still loading (helps avoid flicker on page load)
  const [isLoading, setIsLoading] = useState(true);

  // useEffect runs once when the component mounts, to check if user info is saved locally
  useEffect(() => {
    // Try to get the saved user from localStorage (persisted login)
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      // If user info found, update the user state to reflect logged-in user
      setUser({ user: storedUser });
    }

    // Loading is done, whether user found or not
    setIsLoading(false);
  }, []);

  // Function to handle login: sets user state and saves user info to localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', userData.user);
  };

  // Function to handle logout: clears user state and removes user info from localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Provide user info, login/logout functions, and loading state to any component that consumes this context
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to allow easy access to AuthContext data and functions in components
export const useAuth = () => useContext(AuthContext);
