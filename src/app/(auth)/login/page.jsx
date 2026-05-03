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
      <div className="container-fluid mt-5">
        <div className="row min-vh-100 gap-0 vw-100 flex-wrap-reverse mt-5">
          <div className="col-md-12 px-0 mt-5">
            <div
              className="text-center px-4 px-md-5 mt-5"
              style={{
                maxWidth: "700px",
                margin: "auto",
              }}
            >
              <h2 className="fw-bold ">Login</h2>
              <div className="mt-4">
                <div className="form-group" id="showEmail">
                  <label htmlFor="email2">Email</label>
                  <input
                    type="email"
                    className="form-control "
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email2">Password</label>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    className="form-control "
                    placeholder="Enter Password"
                  />
                </div>
                <button
                  disabled={loading}
                  onClick={handlesubmit}
                  className="btn mt-3 btn-primary w-100 btn-lg"
                >
                  <div>
                    <div>Login</div>
                    {loading && (
                      <div
                        className="spinner-border spinner-border-sm ms-2 "
                        role="status"
                        aria-hidden="true"
                      ></div>
                    )}
                  </div>
                </button>
              </div>

              <hr className="my-5" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
