"use client";
import { useState } from "react";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetForm = () => {
    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      enqueueSnackbar("Please fill all password fields", { variant: "warning" });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      enqueueSnackbar("New password and confirm password do not match", {
        variant: "error",
      });
      return;
    }

    setLoading(true);
    const response = await APITemplate("admin/change-password", "PUT", form);
    setLoading(false);

    if (response?.success) {
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      resetForm();
    } else {
      enqueueSnackbar(response?.message || "Failed to change password", {
        variant: "error",
      });
    }
  };

  return (
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 settings-page">
        <div className="settings-header">
          <h2>Settings</h2>
          <p>Update your admin account password.</p>
        </div>

        <div className="settings-card">
          <h5>Change Password</h5>
          <form onSubmit={handleSubmit} className="settings-form">
            <div>
              <label>Old Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter old password"
                value={form.oldPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                }
              />
            </div>

            <div>
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={resetForm}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
