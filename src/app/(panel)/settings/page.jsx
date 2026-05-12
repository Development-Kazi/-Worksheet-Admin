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
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      enqueueSnackbar("Please fill all password fields", { variant: "warning" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      enqueueSnackbar("New password and confirm password do not match", { variant: "error" });
      return;
    }

    setLoading(true);
    const response = await APITemplate("admin/change-password", "PUT", form);
    setLoading(false);

    if (response?.success) {
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      resetForm();
    } else {
      enqueueSnackbar(response?.message || "Failed to change password", { variant: "error" });
    }
  };

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="settings-page">
        <div className="settings-header mb-5">
          <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>Account Settings</h2>
          <p className="text-muted mb-0">Update your security credentials and administrative preferences.</p>
        </div>

        <div className="settings-card shadow-sm">
          <h5 className="d-flex align-items-center gap-2">
            <i className="fas fa-lock text-primary"></i>
            Change Password
          </h5>
          <form onSubmit={handleSubmit} className="settings-form mt-4">
            <div>
              <label>Current Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.oldPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
              />
              <small className="text-muted mt-1 d-block">Enter your existing password to verify it's you.</small>
            </div>

            <hr className="my-2" />

            <div>
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.newPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>

            <div>
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key me-2"></i>
                    Update Password
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={resetForm}
                disabled={loading}
              >
                Reset Fields
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
