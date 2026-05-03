"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { APITemplate } from "@/component/API/Template";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function authAdmin() {
      const adminID = Cookies.get("adminSession");
      if (adminID) {
        // Fetch user data from cookies
        let response = await APITemplate(`admin/${adminID}`, "GET");
        setUser(response.data);
      }
    }
    authAdmin();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
