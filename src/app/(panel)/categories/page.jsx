"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState("all");
  const [tableQuery, setTableQuery] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const response = await APITemplate("category/all", "GET");
    if (response?.success) {
      setCategories(Array.isArray(response.data) ? response.data : []);
    } else {
      enqueueSnackbar(response?.message || "Failed to fetch categories", {
        variant: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((item) => {
      map[item._id] = item;
    });
    return map;
  }, [categories]);

  const getChainNames = (parentId) => {
    const chain = [];
    let current = parentId;
    while (current && categoryMap[current]) {
      chain.unshift(categoryMap[current].name);
      current = categoryMap[current].parent || null;
    }
    return chain;
  };

  const removeCategory = async (id) => {
    const response = await APITemplate(`category/${id}`, "DELETE");
    if (response?.success) {
      enqueueSnackbar("Category and linked data moved to deleted", {
        variant: "success",
      });
      await fetchCategories();
    } else {
      enqueueSnackbar(response?.message || "Failed to delete category", {
        variant: "error",
      });
    }
  };

  const renderHierarchy = (category) => {
    const chain = getChainNames(category.parent);
    return chain.length ? `${chain.join(" > ")} > ${category.name}` : category.name;
  };

  const statusClass = (status) => {
    switch (status) {
      case "active": return "is-active";
      case "draft": return "is-draft";
      case "deleted": return "is-deleted";
      default: return "is-active";
    }
  };

  const filteredCategories = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    return categories.filter((category) => {
      const status = (category.status || "active").toLowerCase();
      const matchesStatus =
        tableStatus === "all"
          ? status !== "deleted"
          : status === tableStatus;
      const matchesQuery = q
        ? category.name?.toLowerCase().includes(q) ||
          renderHierarchy(category).toLowerCase().includes(q)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [categories, tableStatus, tableQuery]);

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="category-page">
        <div className="category-header d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>Categories</h2>
            <p className="text-muted mb-0">Manage your content hierarchy and organization.</p>
          </div>
          <Link href="/categories/add" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Add Category
          </Link>
        </div>

        <div className="category-card mt-4">
          <div className="category-table-head">
            <h5>Category Records</h5>
            <span>{loading ? "Loading..." : `${filteredCategories.length} Records Found`}</span>
          </div>
          
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="search-input-group">
                <i className="fas fa-search search-icon"></i>
                <input
                  className="form-control ps-5"
                  placeholder="Search by name, slug or hierarchy path..."
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

          <div className="category-table-wrap">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Name & Hierarchy</th>
                  <th>Slug</th>
                  <th style={{ width: "80px" }}>Order</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div className="fw-bold text-dark">{category.name}</div>
                        <div className="text-muted small">{renderHierarchy(category)}</div>
                      </td>
                      <td className="text-muted small">/{category.slug}</td>
                      <td>{category.order ?? 0}</td>
                      <td>
                        <span className={`dynoba-status ${statusClass(category.status)}`}>
                          {category.status || "active"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="table-actions justify-content-end">
                          <Link
                            href={`/categories/view/${category._id}`}
                            className="btn btn-sm btn-outline-dark"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            href={`/categories/add?edit=${category._id}`}
                            className={`btn btn-sm btn-outline-dark ${
                              loading || category.status === "deleted" ? "disabled" : ""
                            }`}
                            aria-disabled={loading || category.status === "deleted"}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeCategory(category._id)}
                            disabled={loading || category.status === "deleted"}
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
                    <td colSpan="5" className="text-center py-5">
                      {loading ? "Loading..." : "No categories found matching your criteria"}
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
