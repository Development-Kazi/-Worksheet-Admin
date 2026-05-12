"use client";
import { APITemplate } from "./API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import jsCookie from "js-cookie";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    if (user) {
      setAdminData(user);
    }
  }, [user]);

  async function logout() {
    const response = await APITemplate("admin/logout", "POST");
    jsCookie.remove("adminSession");
    if (response.success == true) {
      enqueueSnackbar(
        "Logout Successful",
        { variant: "success" },
        {
          autoHideDuration: 500,
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  const getPageTitle = () => {
    if (pathname.includes("dashboard")) return "Dashboard";
    if (pathname.includes("categories")) return "Categories";
    if (pathname.includes("worksheets")) return "Worksheets";
    if (pathname.includes("site-pages")) return "Website Pages";
    if (pathname.includes("settings")) return "Settings";
    return "Admin Panel";
  };

  return (
    <>
      <SnackbarProvider />
      <header className="main-header">
        <div className="navbar-header d-flex align-items-center justify-content-between">
          <h1 className="page-title">{getPageTitle()}</h1>
          
          <div className="header-actions d-flex align-items-center gap-4" style={{ paddingTop: "8px" }}>
            <div className="user-profile-summary d-none d-md-flex align-items-center" style={{ gap: "8px" }}>
              <span style={{ color: "#666666", fontSize: "0.85rem", fontWeight: "500" }}>Logged in as</span>
              <span style={{ color: "#000000", fontSize: "0.85rem", fontWeight: "700" }}>{adminData?.username || "Admin"}</span>
            </div>
            
            <button
              type="button"
              onClick={logout}
              className="btn btn-outline-dark d-flex align-items-center gap-2"
              style={{ 
                padding: "8px 16px",
                fontSize: "0.85rem",
                fontWeight: "600",
                borderRadius: "4px",
                border: "1px solid #ff4d4d",
                color: "#ff4d4d",
                background: "transparent",
                transition: "all 0.2s ease"
              }}
              title="Logout"
            >
              <i className="fas fa-power-off" style={{ fontSize: "0.8rem" }}></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
