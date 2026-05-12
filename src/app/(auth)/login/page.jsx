"use client";
import { useState, useEffect } from "react";
import { APITemplate } from "@/component/API/Template";
import { useRouter } from "next/navigation";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

function Login() {
  const router = useRouter();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlesubmit = async () => {
    setLoading(true);
    try {
      if (email == "" || password == "") {
        setLoading(false);
        enqueueSnackbar(
          "Please fill all the fields",
          { variant: "warning" },
          { autoHideDuration: 500 }
        );
        return;
      } else if (!emailRegex.test(email)) {
        setLoading(false);
        enqueueSnackbar("Please enter a valid email address", {
          variant: "warning",
        });
        return;
      } else {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        const response = await APITemplate("admin/login", "POST", formData);
        // console.log(response);
        if (response.success == true) {
          setLoading(false);
          enqueueSnackbar(
            "Login Successful",
            { variant: "success" },
            { autoHideDuration: 500 }
          );
          setTimeout(() => {
            router.push("/");
          }, 500);
        } else {
          setLoading(false);
          enqueueSnackbar(
            response.message,
            { variant: "error" },
            { autoHideDuration: 500 }
          );
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      enqueueSnackbar(
        error.response?.data?.message || error.message,
        { variant: "error" },
        { autoHideDuration: 500 }
      );
    }
  };

  return (
    <>
      <SnackbarProvider />
      <style jsx global>{`
        .login-wrapper {
          background-color: #ffffff !important;
        }
        .login-card {
          background-color: #ffffff !important;
        }
        .login-card label {
          color: #000000 !important;
          font-weight: 700 !important;
          opacity: 1 !important;
          display: block !important;
          margin-bottom: 8px !important;
          font-size: 0.85rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
        }
        .login-card .form-control {
          border: 2px solid #000000 !important;
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .login-card .form-control::placeholder {
          color: #000000 !important;
          opacity: 0.5 !important;
        }
        .login-card .btn-primary {
          background-color: #6a00f5 !important;
          border-color: #6a00f5 !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 12px rgba(106, 0, 245, 0.3) !important;
        }
        .login-card .btn-primary:hover {
          background-color: #5800cc !important;
          transform: translateY(-1px);
        }
        .logo-box {
          background-color: #6a00f5 !important;
          box-shadow: 0 0 20px rgba(106, 0, 245, 0.2) !important;
        }
      `}</style>
      <div className="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
        <div 
          className="login-card p-5"
          style={{
            width: "100%",
            maxWidth: "440px",
            border: "2px solid #000000",
            borderRadius: "4px",
            backgroundColor: "#ffffff"
          }}
        >
          <div className="text-center mb-5">
            <div className="logo-box mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "4px",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "1.5rem"
              }}
            >W</div>
            <h2 className="fw-bold" style={{ color: "#000000", letterSpacing: "-0.02em" }}>Admin Login</h2>
            <p style={{ color: "#000000", fontSize: "0.95rem", fontWeight: "500" }}>Enter your credentials to access the panel</p>
          </div>

          <div className="form-group mb-4">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "14px 16px" }}
            />
          </div>

          <div className="form-group mb-4">
            <label>Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              className="form-control"
              placeholder="••••••••"
              style={{ padding: "14px 16px" }}
            />
          </div>

          <button
            disabled={loading}
            onClick={handlesubmit}
            className="btn btn-primary w-100 py-3 mt-3"
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              "SIGN IN"
            )}
          </button>
          
          <div className="text-center mt-5 pt-4" style={{ borderTop: "2px solid #000000" }}>
            <p style={{ color: "#000000", fontSize: "0.85rem", fontWeight: "600", marginBottom: 0 }}>&copy; 2026 Worksheet Admin Panel</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
