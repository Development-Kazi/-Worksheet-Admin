"use client";
import { useUser } from "@/context/UserContext";
import "./page.css";
import { useEffect, useMemo, useState } from "react";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

export default function Home() {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [worksheets, setWorksheets] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [catRes, wsRes] = await Promise.all([
        APITemplate("category/all", "GET"),
        APITemplate("worksheet/all", "GET"),
      ]);

      if (!catRes?.success) {
        enqueueSnackbar(catRes?.message || "Failed to load categories", {
          variant: "error",
        });
      }
      if (!wsRes?.success) {
        enqueueSnackbar(wsRes?.message || "Failed to load worksheets", {
          variant: "error",
        });
      }

      setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
      setWorksheets(Array.isArray(wsRes?.data) ? wsRes.data : []);
      setLoading(false);
    };

    load();
  }, []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c._id] = c;
    });
    return map;
  }, [categories]);

  const buildCategoryPath = (categoryId) => {
    if (!categoryId) return "-";
    const names = [];
    let current = categoryMap[categoryId];
    while (current) {
      names.unshift(current.name);
      const parentId = current.parent || null;
      current = parentId ? categoryMap[parentId] : null;
    }
    return names.join(" > ");
  };

  const cards = useMemo(() => {
    const catActive = categories.filter((c) => (c.status || "active") === "active").length;
    const catDraft = categories.filter((c) => c.status === "draft").length;
    const catDeleted = categories.filter((c) => c.status === "deleted").length;
    const catTotal = catActive + catDraft + catDeleted;

    const wsActive = worksheets.filter((w) => (w.status || "active") === "active").length;
    const wsDraft = worksheets.filter((w) => w.status === "draft").length;
    const wsDeleted = worksheets.filter((w) => w.status === "deleted").length;
    const wsTotal = wsActive + wsDraft + wsDeleted;

    return [
      {
        title: "Categories",
        value: loading ? "..." : catTotal,
        helper: loading
          ? ""
          : `Active ${catActive} | Draft ${catDraft} | Deleted ${catDeleted}`,
      },
      {
        title: "Worksheets",
        value: loading ? "..." : wsTotal,
        helper: loading
          ? ""
          : `Active ${wsActive} | Draft ${wsDraft} | Deleted ${wsDeleted}`,
      },
    ];
  }, [categories, worksheets, loading]);

  const recentWorksheets = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return worksheets
      .filter((w) => {
        if (w.status === "deleted") return false;
        const sourceDate = new Date(w.updatedAt || w.createdAt || "");
        return !Number.isNaN(sourceDate.getTime()) && sourceDate >= sevenDaysAgo;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || "").getTime() -
          new Date(a.updatedAt || a.createdAt || "").getTime(),
      )
      .slice(0, 8)
      .map((w) => ({
        _id: w._id,
        title: w.title || "-",
        category: w.category?._id
          ? buildCategoryPath(w.category._id)
          : w.category
            ? buildCategoryPath(w.category)
            : "-",
        status: (w.status || "active").toLowerCase(),
        updatedAt: w.updatedAt || w.createdAt || "",
      }));
  }, [worksheets, categoryMap]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const statusClass = (status) => {
    if (status === "active" || status === "published") return "is-published";
    if (status === "draft") return "is-draft";
    return "is-review";
  };

  return (
    <div className="content-container p-4">
      <SnackbarProvider />
      <div className="dynoba-dashboard">
        <div className="dynoba-hero">
          <div>
            <p className="dynoba-badge">Admin Panel</p>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>Dashboard Overview</h2>
            <p className="dynoba-subtitle mb-0">
              Real-time summary of your worksheet content and activity.
            </p>
          </div>
          <div className="dynoba-welcome">
            <span className="dynoba-label">Logged In As</span>
            <strong>{user?.username || "Master Admin"}</strong>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {cards.map((card) => (
            <div className="col-md-6" key={card.title}>
              <div className="dynoba-stat-card">
                <div className="dynoba-stat-head">
                  <h6>{card.title}</h6>
                </div>
                <div className="dynoba-stat-value">{card.value}</div>
                <p>{card.helper}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dynoba-panel-card" id="recent-worksheets">
          <div className="dynoba-panel-header">
            <h5>Recent Worksheets</h5>
            <span>{loading ? "Loading..." : "Past 7 days"}</span>
          </div>
          <div className="dynoba-table-wrap">
            <table className="dynoba-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentWorksheets.length > 0 ? (
                  recentWorksheets.map((item) => (
                    <tr key={item._id}>
                      <td className="fw-bold text-dark">{item.title}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`dynoba-status ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{formatDate(item.updatedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      {loading ? "Loading..." : "No worksheets recorded in the past 7 days"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
