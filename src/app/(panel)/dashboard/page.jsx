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

  const categoryWorksheetCounts = useMemo(() => {
    const counts = {};
    worksheets.forEach((w) => {
      if (w.status === "deleted") return;
      const catId = w.category?._id || w.category;
      if (!catId) return;
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [worksheets]);

  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("all");
  const [categorySort, setCategorySort] = useState("order_asc");

  const categoryRows = useMemo(() => {
    const rows = categories.map((c) => {
      const parentName = c.parent ? categoryMap[c.parent]?.name || "-" : "-";
      const path = buildCategoryPath(c._id);
      return {
        _id: c._id,
        name: c.name || "-",
        parentName,
        path,
        order: typeof c.order === "number" ? c.order : Number(c.order || 0),
        worksheets: categoryWorksheetCounts[c._id] || 0,
        status: (c.status || "active").toLowerCase(),
        updatedAt: c.updatedAt || c.createdAt || "",
      };
    });

    const q = categoryQuery.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      const matchesQuery = q
        ? (r.name || "").toLowerCase().includes(q) ||
          (r.path || "").toLowerCase().includes(q) ||
          (r.parentName || "").toLowerCase().includes(q)
        : true;
      const matchesStatus =
        categoryStatus === "all"
          ? r.status !== "deleted"
          : r.status === categoryStatus;
      return matchesQuery && matchesStatus;
    });

    const sorted = [...filtered];
    const sortKey = categorySort;
    sorted.sort((a, b) => {
      if (sortKey === "name_asc") return a.name.localeCompare(b.name);
      if (sortKey === "name_desc") return b.name.localeCompare(a.name);
      if (sortKey === "order_desc") return b.order - a.order;
      if (sortKey === "worksheets_desc") return b.worksheets - a.worksheets;
      if (sortKey === "worksheets_asc") return a.worksheets - b.worksheets;
      if (sortKey === "updated_desc")
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortKey === "updated_asc")
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.order - b.order;
    });

    return sorted;
  }, [
    categories,
    categoryMap,
    categoryWorksheetCounts,
    categoryQuery,
    categoryStatus,
    categorySort,
  ]);

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
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 dynoba-dashboard">
        <div className="dynoba-hero">
          <div>
            <p className="dynoba-badge">Dynoba Admin</p>
            <h2 className="fw-bold mb-2 text-dark">Dashboard Overview</h2>
            <p className="dynoba-subtitle mb-0">
              Manage worksheet content with a clean, model-driven overview.
            </p>
          </div>
          <div className="dynoba-welcome">
            <span className="dynoba-label">Signed in as</span>
            <strong>{user?.username || "Admin"}</strong>
          </div>
        </div>

        <div className="row g-4 mt-1">
          {cards.map((card) => (
            <div className="col-12 col-md-6 col-xl-6" key={card.title}>
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

        <div className="row g-4 mt-2">
          <div className="col-12">
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
                          <td>{item.title}</td>
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
                        <td colSpan="4" className="text-center">
                          {loading ? "Loading..." : "No worksheets in the past 7 days"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/*
          <div className="col-12">
            <div className="dynoba-panel-card" id="categories-overview">
              <div className="dynoba-panel-header">
                <h5>Categories Overview</h5>
                <span>{loading ? "Loading..." : `${categories.length} total`}</span>
              </div>
              <div className="dynoba-filters">
                <div className="dynoba-filter">
                  <label>Search</label>
                  <input
                    className="form-control"
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    placeholder="Search by category or parent"
                  />
                </div>
                <div className="dynoba-filter">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={categoryStatus}
                    onChange={(e) => setCategoryStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
                <div className="dynoba-filter">
                  <label>Sort</label>
                  <select
                    className="form-select"
                    value={categorySort}
                    onChange={(e) => setCategorySort(e.target.value)}
                  >
                    <option value="order_asc">Order (Low â†’ High)</option>
                    <option value="order_desc">Order (High â†’ Low)</option>
                    <option value="name_asc">Name (A â†’ Z)</option>
                    <option value="name_desc">Name (Z â†’ A)</option>
                    <option value="worksheets_desc">Worksheets (High â†’ Low)</option>
                    <option value="worksheets_asc">Worksheets (Low â†’ High)</option>
                    <option value="updated_desc">Updated (Newest)</option>
                    <option value="updated_asc">Updated (Oldest)</option>
                  </select>
                </div>
              </div>
              <div className="dynoba-table-wrap">
                <table className="dynoba-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Parent</th>
                      <th>Order</th>
                      <th>Worksheets</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRows.length > 0 ? (
                      categoryRows.map((row) => (
                        <tr key={row._id}>
                          <td>{row.name}</td>
                          <td>{row.parentName}</td>
                          <td>{row.order}</td>
                          <td>{row.worksheets}</td>
                          <td>
                            <span
                              className={`dynoba-status ${statusClass(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td>{formatDate(row.updatedAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {loading ? "Loading..." : "No matching categories"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
