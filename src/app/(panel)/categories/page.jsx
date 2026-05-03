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
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 category-page">
        <div className="category-header">
          <h2>Categories</h2>
          <p>Manage category records here. Add category is available on a separate page.</p>
        </div>
        <div className="mb-3">
          <Link href="/categories/add" className="btn btn-primary">
            Add Category
          </Link>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="category-card">
              <div className="category-table-head">
                <h5>Category List</h5>
                <span>
                  {loading ? "Loading..." : `${filteredCategories.length} shown`}
                </span>
              </div>
              <div className="d-flex gap-2 mb-2">
                <div className="flex-grow-1">
                  <input
                    className="form-control"
                    placeholder="Search by name or hierarchy"
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
              <div className="category-table-wrap">
                <table className="category-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Hierarchy</th>
                      <th>Slug</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category._id}>
                        <td>{category.name}</td>
                        <td>{renderHierarchy(category)}</td>
                        <td>{category.slug}</td>
                        <td>{category.order ?? 0}</td>
                        <td>
                          <span
                            className={`status-chip ${
                              (category.status || "active") === "active"
                                ? "is-active"
                                : "is-draft"
                            }`}
                          >
                            {category.status || "active"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link
                              href={`/categories/add?edit=${category._id}`}
                              className={`btn btn-sm btn-outline-primary ${
                                loading || category.status === "deleted" ? "disabled" : ""
                              }`}
                              aria-disabled={loading || category.status === "deleted"}
                              onClick={(e) => {
                                if (loading || category.status === "deleted") {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeCategory(category._id)}
                              disabled={loading || category.status === "deleted"}
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
