import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserSession {
  id: string;
  username: string;
  avatar?: string;
}

interface UserContextType {
  currentUser: UserSession | null;
  login: (userData: UserSession) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);}, []);

  const login = (userData: UserSession) => {
    setCurrentUser(userData);
    localStorage.setItem("user_session", JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user_session");
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};