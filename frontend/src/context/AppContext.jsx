import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);
const API = "http://localhost:5000";

export function AppProvider({ children }) {
  const [profile, setProfile] = useState({ displayName: "Đang tải...", theme: "light" });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/profile`)
      .then(async response => {
        if (!response.ok) throw new Error("Không tải được profile");
        return response.json();
      })
      .then(data => {
        setProfile(data);
        document.body.className = data.theme === "dark" ? "dark" : "light";
      })
      .catch(error => console.error(error))
      .finally(() => setProfileLoading(false));
  }, []);

  function updateProfile(nextProfile) {
    setProfile(nextProfile);
    document.body.className = nextProfile.theme === "dark" ? "dark" : "light";
  }

  return (
    <AppContext.Provider value={{ profile, setProfile, updateProfile, profileLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp phải được dùng bên trong AppProvider");
  return value;
}