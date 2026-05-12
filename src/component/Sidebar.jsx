"use client";
import Link from "next/link.js";
import { useEffect } from "react";
import { usePathname } from "next/navigation.js";
import { useUser } from "@/context/UserContext";

function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  useEffect(() => {
    import("./main.js");
  }, []);

  const isActive = (url) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">W</div>
        <span className="brand-name">Worksheet Admin</span>
      </div>
      
      <div className="sidebar-wrapper">
        <div className="sidebar-content">
          <ul className="nav nav-secondary mt-0">
            <li className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
              <Link href="/dashboard">
                <i className="fas fa-chart-pie"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            <li className="nav-section mt-2">
              <h4 className="text-section">Worksheet Management</h4>
            </li>

            <li className={`nav-item ${isActive("/categories") ? "active" : ""}`}>
              <Link href="/categories">
                <i className="fas fa-sitemap"></i>
                <p>Categories</p>
              </Link>
            </li>

            <li className={`nav-item ${isActive("/worksheets") ? "active" : ""}`}>
              <Link href="/worksheets">
                <i className="fas fa-file-pdf"></i>
                <p>Worksheets</p>
              </Link>
            </li>

            <li className={`nav-item ${isActive("/site-pages") ? "active" : ""}`}>
              <Link href="/site-pages">
                <i className="fas fa-file-lines"></i>
                <p>Website Pages</p>
              </Link>
            </li>

            <li className="nav-section mt-2">
              <h4 className="text-section">Settings</h4>
            </li>

            <li className={`nav-item ${isActive("/settings") ? "active" : ""}`}>
              <Link href="/settings">
                <i className="fas fa-gear"></i>
                <p>Change Password</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="sidebar-user-card">
        <div className="user-avatar-container">
          <img 
            src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.username || "Admin") + "&background=6a00f5&color=fff"} 
            className="user-avatar" 
            alt="User" 
          />
        </div>
        <div className="user-info">
          <span className="user-name">{user?.username || "Admin"}</span>
          <span className="user-role">Administrator</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
