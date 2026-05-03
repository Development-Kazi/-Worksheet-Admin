"use client";
import { APITemplate } from "./API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import jsCookie from "js-cookie";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import "./fonts.min.css";
function Header() {
  const { user } = useUser();
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

  useEffect(() => {
    import("./main.js");
    import("bootstrap/js/src/collapse.js");
  }, []);

  return (
    <>
      <SnackbarProvider />
      <div className="main-header z-2">
        <div className="main-header-logo">
          <div className="logo-header" data-background-color="">
            <a href="/" className="logo ">
              <img
                src="/img/logo.png"
                alt="navbar brand"
                className="navbar-brand"
                height="40"
              />
            </a>
            <button
              className="navbar-toggler sidenav-toggler ms-auto"
              type="button"
            >
              <span className="navbar-toggler-icon">
                <i className="gg-menu-right"></i>
              </span>
            </button>
            <button className="topbar-toggler more">
              <i className="icon-options-vertical"></i>
            </button>
          </div>
        </div>
        <nav
          data-background-color=""
          className="navbar navbar-header navbar-header-transparent navbar-expand-lg bg-white"
        >
          <div className="container-fluid align-items-center">
            <nav className="navbar navbar-header-left ms-4 navbar-expand-lg navbar-form nav-search p-0 d-none d-lg-flex"></nav>
            <ul className="navbar-nav topbar-nav ms-md-auto gap-md-4 align-items-center">
              <li className="nav-item topbar-user  hidden-caret">
                <a className="nav-link profile-pic">
                  <span style={{ color: "black" }} className="profile-username">
                    <span className="op-7">Hi, </span>
                    <span className="fw-bold">{adminData?.username}</span>
                  </span>
                </a>
              </li>
            </ul>
            <div className="px-3">
              {/* add tooltip */}

              <button
                type="button"
                onClick={logout}
                className="btn btn-lg btn-label-danger"
              >
                <i className="fas fa-power-off"></i>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
export default Header;
