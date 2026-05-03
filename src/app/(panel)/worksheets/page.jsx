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
      list.forEach((c) => {
        map[c._id] = c;
      });
      setCategoryOptions(
        list
          .filter((c) => c.status !== "deleted")
          .map((c) => ({
            id: c._id,
            name: buildCategoryPath(c, map),
          })),
      );
    } else {
      enqueueSnackbar(response?.message || "Failed to fetch categories", {
        variant: "error",
      });
    }
  };

  const fetchWorksheets = async () => {
    setLoading(true);
    const response = await APITemplate("worksheet/all", "GET");
    if (response?.success) {
      setWorksheets(Array.isArray(response.data) ? response.data : []);
    } else {
      enqueueSnackbar(response?.message || "Failed to fetch worksheets", {
        variant: "error",
      });
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
      enqueueSnackbar(response?.message || "Failed to delete worksheet", {
        variant: "error",
      });
    }
  };

  const getCategoryName = (id) =>
    categoryOptions.find((item) => item.id === id)?.name || "-";

  const filteredWorksheets = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    return worksheets.filter((item) => {
      const status = (item.status || "active").toLowerCase();
      const matchesStatus =
        tableStatus === "all"
          ? status !== "deleted"
          : status === tableStatus;
      const title = item.title?.toLowerCase() || "";
      const categoryName = getCategoryName(item.category?._id || item.category)
        .toLowerCase();
      const matchesQuery = q ? title.includes(q) || categoryName.includes(q) : true;
      return matchesStatus && matchesQuery;
    });
  }, [worksheets, tableStatus, tableQuery, categoryOptions]);

  return (
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 worksheet-page">
        <div className="worksheet-header">
          <h2>Worksheets</h2>
          <p>Manage worksheet records here. Add worksheet is available on a separate page.</p>
        </div>
        <div className="mb-3">
          <Link href="/worksheets/add" className="btn btn-primary">
            Add Worksheet
          </Link>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="worksheet-card">
              <div className="worksheet-table-head">
                <h5>Worksheet List</h5>
                <span>
                  {loading ? "Loading..." : `${filteredWorksheets.length} shown`}
                </span>
              </div>
              <div className="d-flex gap-2 mb-2">
                <div className="flex-grow-1">
                  <input
                    className="form-control"
                    placeholder="Search by title or category"
                    value={tableQuery}
                    onChange={(e) => setTableQuery(e.target.value)}
                  />
                </div>
                <div style={{ minWidth: 140 }}>
                  <select
                    className="form-select"
                    value={tableStatus}
                    onChange={(e) => setTableStatus(e.target.value)}
                  >
                    <option value="all">All (except deleted)</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>
              <div className="worksheet-table-wrap">
                <table className="worksheet-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorksheets.map((item) => (
                      <tr key={item._id}>
                        <td>{item.title}</td>
                        <td>{getCategoryName(item.category?._id || item.category)}</td>
                        <td>
                          {item.price} / <span className="text-muted">{item.discountedPrice}</span>
                        </td>
                        <td>{item.rating || "-"}</td>
                        <td>
                          <span
                            className={`status-chip ${
                              item.status === "active" ? "is-active" : "is-draft"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link
                              href={`/worksheets/add?edit=${item._id}`}
                              className={`btn btn-sm btn-outline-primary ${
                                loading || item.status === "deleted" ? "disabled" : ""
                              }`}
                              aria-disabled={loading || item.status === "deleted"}
                              onClick={(e) => {
                                if (loading || item.status === "deleted") {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteWorksheet(item._id)}
                              disabled={loading || item.status === "deleted"}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
