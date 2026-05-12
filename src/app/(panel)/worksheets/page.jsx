"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

export default function WorksheetsPage() {
  const [worksheets, setWorksheets] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState("all");
  const [tableQuery, setTableQuery] = useState("");

  const buildCategoryPath = (category, map) => {
    const names = [];
    let current = category;
    while (current) {
      names.unshift(current.name);
      const parentId = current.parent || null;
      current = parentId ? map[parentId] : null;
    }
    return names.join(" > ");
  };

  const fetchCategories = async () => {
    const response = await APITemplate("category/all", "GET");
    if (response?.success) {
      const list = Array.isArray(response.data) ? response.data : [];
      const map = {};
      list.forEach((c) => { map[c._id] = c; });
      setCategoryOptions(
        list.filter((c) => c.status !== "deleted").map((c) => ({
          id: c._id,
          name: buildCategoryPath(c, map),
        }))
      );
    }
  };

  const fetchWorksheets = async () => {
    setLoading(true);
    const response = await APITemplate("worksheet/all", "GET");
    if (response?.success) {
      setWorksheets(Array.isArray(response.data) ? response.data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchWorksheets();
  }, []);

  const deleteWorksheet = async (id) => {
    const response = await APITemplate(`worksheet/${id}`, "DELETE");
    if (response?.success) {
      enqueueSnackbar("Worksheet moved to deleted", { variant: "success" });
      await fetchWorksheets();
    } else {
      enqueueSnackbar(response?.message || "Failed to delete worksheet", { variant: "error" });
    }
  };

  const getCategoryName = (id) =>
    categoryOptions.find((item) => item.id === id)?.name || "-";

  const statusClass = (status) => {
    switch (status) {
      case "active": return "is-active";
      case "draft": return "is-draft";
      case "deleted": return "is-deleted";
      default: return "is-active";
    }
  };

  const filteredWorksheets = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    return worksheets.filter((item) => {
      const status = (item.status || "active").toLowerCase();
      const matchesStatus =
        tableStatus === "all" ? status !== "deleted" : status === tableStatus;
      const title = item.title?.toLowerCase() || "";
      const categoryName = getCategoryName(item.category?._id || item.category).toLowerCase();
      const matchesQuery = q ? title.includes(q) || categoryName.includes(q) : true;
      return matchesStatus && matchesQuery;
    });
  }, [worksheets, tableStatus, tableQuery, categoryOptions]);

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="worksheet-page">
        <div className="worksheet-header d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>Worksheets</h2>
            <p className="text-muted mb-0">Manage and organize your worksheet collection.</p>
          </div>
          <Link href="/worksheets/add" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Add Worksheet
          </Link>
        </div>

        <div className="worksheet-card mt-4">
          <div className="worksheet-table-head">
            <h5>Worksheet Records</h5>
            <span>{loading ? "Loading..." : `${filteredWorksheets.length} Records Found`}</span>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="search-input-group">
                <i className="fas fa-search search-icon"></i>
                <input
                  className="form-control ps-5"
                  placeholder="Search by title or category..."
                  value={tableQuery}
                  onChange={(e) => setTableQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={tableStatus}
                onChange={(e) => setTableStatus(e.target.value)}
              >
                <option value="all">Status: All (except deleted)</option>
                <option value="active">Status: Active</option>
                <option value="draft">Status: Draft</option>
                <option value="deleted">Status: Deleted</option>
              </select>
            </div>
          </div>

          <div className="worksheet-table-wrap">
            <table className="worksheet-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price Details</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorksheets.length > 0 ? (
                  filteredWorksheets.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="fw-bold text-dark">{item.title}</div>
                        <div className="text-muted small">{item.slug}</div>
                      </td>
                      <td>{getCategoryName(item.category?._id || item.category)}</td>
                      <td>
                        <div className="fw-bold">₹{item.price}</div>
                        {item.discountedPrice && <div className="text-muted small text-decoration-line-through">₹{item.discountedPrice}</div>}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <i className="fas fa-star text-warning small"></i>
                          <span>{item.rating || "0.0"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`dynoba-status ${statusClass(item.status)}`}>
                          {item.status || "active"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="table-actions justify-content-end">
                          <Link
                            href={`/worksheets/view/${item._id}`}
                            className="btn btn-sm btn-outline-dark"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            href={`/worksheets/add?edit=${item._id}`}
                            className={`btn btn-sm btn-outline-dark ${loading || item.status === "deleted" ? "disabled" : ""}`}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteWorksheet(item._id)}
                            disabled={loading || item.status === "deleted"}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      {loading ? "Loading..." : "No worksheets found matching your criteria"}
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
