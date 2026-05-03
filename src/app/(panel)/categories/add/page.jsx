"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import CustomEditor from "@/component/Editor";

export default function AddCategoryPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    order: "",
    image: "",
    icon: "",
    status: "active",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });
  const imageFileInputRef = useRef(null);
  const iconFileInputRef = useRef(null);

  const fetchCategories = async () => {
    const response = await APITemplate("category/all", "GET");
    if (response?.success) {
      setCategories(Array.isArray(response.data) ? response.data : []);
    } else {
      enqueueSnackbar(response?.message || "Failed to fetch categories", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadEditCategory = async () => {
      if (!editId) return;

      const response = await APITemplate("category/all", "GET");
      if (!response?.success) {
        enqueueSnackbar(response?.message || "Failed to load category", {
          variant: "error",
        });
        return;
      }

      const foundCategory = (Array.isArray(response.data) ? response.data : []).find(
        (item) => item._id === editId,
      );

      if (!foundCategory) {
        enqueueSnackbar("Category not found", { variant: "error" });
        return;
      }

      setSlugLocked(true);
      setForm({
        name: foundCategory.name || "",
        slug: foundCategory.slug || "",
        parentId: foundCategory.parent || "",
        order: String(foundCategory.order ?? ""),
        image: foundCategory.image || "",
        icon: foundCategory.icon || "",
        status: foundCategory.status || "active",
        metaTitle: foundCategory.metaTitle || "",
        metaDescription: foundCategory.metaDescription || "",
        metaKeywords: foundCategory.metaKeywords || "",
      });
    };

    loadEditCategory();
  }, [editId]);

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

  const renderHierarchy = (category) => {
    const chain = getChainNames(category.parent);
    return chain.length ? `${chain.join(" > ")} > ${category.name}` : category.name;
  };

  const parentChain = getChainNames(form.parentId);

  const resetForm = () => {
    setSlugLocked(false);
    setForm({
      name: "",
      slug: "",
      parentId: "",
      order: "",
      image: "",
      icon: "",
      status: "active",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    });
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    if (iconFileInputRef.current) {
      iconFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || form.name).trim().toLowerCase().replaceAll(" ", "-"),
      parent: form.parentId || null,
      order: Number(form.order || 0),
      image: form.image || "",
      icon: form.icon || "",
      status: form.status,
      metaTitle: form.metaTitle || "",
      metaDescription: form.metaDescription || "",
      metaKeywords: form.metaKeywords || "",
    };

    const response = editId
      ? await APITemplate(`category/${editId}`, "PUT", payload)
      : await APITemplate("category/create", "POST", payload);
    setLoading(false);
    if (response?.success) {
      enqueueSnackbar(editId ? "Category updated" : "Category created", {
        variant: "success",
      });
      if (!editId) {
        resetForm();
      }
      await fetchCategories();
    } else {
      enqueueSnackbar(
        response?.message || `Failed to ${editId ? "update" : "create"} category`,
        {
          variant: "error",
        },
      );
    }
  };

  return (
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 category-add-page">
        <div className="category-add-toolbar">
          <div className="category-add-header">
            <h2>{editId ? "Edit Category" : "Add Category"}</h2>
            <p>
              {editId
                ? "Update category details here without loading the full management table."
                : "Create new category here without loading the full management table."}
            </p>
          </div>
          <Link href="/categories" className="btn btn-outline-primary">
            Back to Categories
          </Link>
        </div>

        <div className="category-add-layout">
          <div className="col-12">
            <div className="category-add-card">
              <h5>{editId ? "Edit Category" : "Add Category"}</h5>
              <form onSubmit={handleSubmit} className="category-add-form">
                <div>
                  <label>Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter category name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name,
                        slug: slugLocked
                          ? prev.slug
                          : String(name)
                              .trim()
                              .toLowerCase()
                              .replaceAll(" ", "-"),
                      }));
                    }}
                  />
                </div>

                <div>
                  <label>Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="auto-from-name"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugLocked(true);
                      setForm((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                  />
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label>Order</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={form.order}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, order: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label>Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Parent Category</label>
                  <select
                    className="form-select"
                    value={form.parentId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, parentId: e.target.value }))
                    }
                  >
                    <option value="">None (Main Category)</option>
                    {categories
                      .filter((item) => item.status !== "deleted")
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {renderHierarchy(item)}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label>Image URL</label>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    className="form-control mb-2"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData();
                      data.append("file", file);
                      const response = await APITemplate(
                        "upload/image",
                        "POST",
                        data,
                      );
                      if (response?.success && response.data?.url) {
                        setForm((prev) => ({ ...prev, image: response.data.url }));
                        enqueueSnackbar("Image uploaded", { variant: "success" });
                      } else {
                        enqueueSnackbar(
                          response?.message || "Failed to upload image",
                          { variant: "error" },
                        );
                      }
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://..."
                    value={form.image}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, image: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Icon URL</label>
                  <input
                    ref={iconFileInputRef}
                    type="file"
                    accept="image/*"
                    className="form-control mb-2"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData();
                      data.append("file", file);
                      const response = await APITemplate(
                        "upload/image",
                        "POST",
                        data,
                      );
                      if (response?.success && response.data?.url) {
                        setForm((prev) => ({ ...prev, icon: response.data.url }));
                        enqueueSnackbar("Icon uploaded", { variant: "success" });
                      } else {
                        enqueueSnackbar(
                          response?.message || "Failed to upload icon",
                          { variant: "error" },
                        );
                      }
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://... or emoji"
                    value={form.icon}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, icon: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Meta Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Meta title"
                    value={form.metaTitle}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Meta Description</label>
                  <CustomEditor
                    value={form.metaDescription}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        metaDescription: value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label>Meta Keywords (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="kids, worksheets, math"
                    value={form.metaKeywords}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))
                    }
                  />
                </div>

                <div className="category-add-preview">
                  <strong>Auto Parent Path</strong>
                  <p>
                    {parentChain.length
                      ? `${parentChain.join(" > ")} > ${form.name || "New Category"}`
                      : form.name || "Main Category"}
                  </p>
                </div>

                <div className="category-add-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {editId ? "Update Category" : "Add Category"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    {editId ? "Reset" : "Clear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
