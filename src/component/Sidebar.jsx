"use client";
import Link from "next/link.js";
import { useEffect } from "react";
import { usePathname } from "next/navigation.js";

function Sidebar() {
  const pathname = usePathname();

  useEffect(() => {
    import("./main.js");
    import("bootstrap/js/src/collapse.js");
  }, []);

  const isActive = (url) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <div className="sidebar" data-background-color="">
      <div className="sidebar-logo">
        <div className="logo-header" data-background-color="">
          <button
            className="navbar-toggler sidenav-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="collapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon ">
              <i style={{ color: "black" }} className="gg-menu-right "></i>
            </span>
          </button>
          <button className="topbar-toggler more">
            <i style={{ color: "black" }} className="icon-options-vertical"></i>
          </button>
          <div className="nav-toggle">
            <button className="btn btn-toggle toggle-sidebar">
              <i style={{ color: "black" }} className="gg-menu-right"></i>
            </button>
            <button className="btn btn-toggle sidenav-toggler">
              <i style={{ color: "black" }} className="gg-menu-left"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="sidebar-wrapper ">
        <div className="sidebar-content">
          <ul className="nav nav-secondary mt-0">
            <li className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
              <Link href="/dashboard">
                <i className="fas fa-chart-pie"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            <li className="nav-section mt-2">
              <span className="sidebar-mini-icon">
                <i className="fa fa-ellipsis-h"></i>
              </span>
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
              <span className="sidebar-mini-icon">
                <i className="fa fa-ellipsis-h"></i>
              </span>
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
    </div>
  );
}

export default Sidebar;
