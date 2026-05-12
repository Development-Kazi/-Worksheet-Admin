"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { getImageUrl, fallbackImage, fallbackIcon } from "@/utils/media";
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
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadEditCategory = async () => {
      if (!editId) return;
      const response = await APITemplate("category/all", "GET");
      if (response?.success) {
        const found = (Array.isArray(response.data) ? response.data : []).find(
          (item) => item._id === editId,
        );
        if (found) {
          setSlugLocked(true);
          setForm({
            name: found.name || "",
            slug: found.slug || "",
            parentId: found.parent || "",
            order: String(found.order ?? ""),
            image: found.image || "",
            icon: found.icon || "",
            status: found.status || "active",
            metaTitle: found.metaTitle || "",
            metaDescription: found.metaDescription || "",
            metaKeywords: found.metaKeywords || "",
          });
        }
      }
    };
    loadEditCategory();
  }, [editId]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((item) => { map[item._id] = item; });
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
      name: "", slug: "", parentId: "", order: "", image: "", icon: "",
      status: "active", metaTitle: "", metaDescription: "", metaKeywords: "",
    });
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    if (iconFileInputRef.current) iconFileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const payload = {
      ...form,
      name: form.name.trim(),
      slug: (form.slug || form.name).trim().toLowerCase().replaceAll(" ", "-"),
      parent: form.parentId || null,
      order: Number(form.order || 0),
    };
    const response = editId
      ? await APITemplate(`category/${editId}`, "PUT", payload)
      : await APITemplate("category/create", "POST", payload);
    setLoading(false);
    if (response?.success) {
      enqueueSnackbar(editId ? "Category updated" : "Category created", { variant: "success" });
      if (!editId) resetForm();
      fetchCategories();
    } else {
      enqueueSnackbar(response?.message || "Operation failed", { variant: "error" });
    }
  };

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="category-add-page">
        <div className="category-add-toolbar d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>
              {editId ? "Edit Category" : "Add Category"}
            </h2>
            <p className="text-muted mb-0">
              {editId ? "Update category details and metadata." : "Create a new category for your worksheet collection."}
            </p>
          </div>
          <Link href="/categories" className="btn btn-outline-dark">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Categories
          </Link>
        </div>

        <div className="category-add-card">
          <form onSubmit={handleSubmit} className="category-add-form">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Basic Information</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="dynoba-label">Category Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mathematics"
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setForm(prev => ({
                            ...prev, name,
                            slug: slugLocked ? prev.slug : name.trim().toLowerCase().replaceAll(" ", "-")
                          }));
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="dynoba-label">Slug (URL Path)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="auto-generated"
                        value={form.slug}
                        onChange={(e) => { setSlugLocked(true); setForm(prev => ({ ...prev, slug: e.target.value })); }}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="dynoba-label">Parent Category</label>
                      <select
                        className="form-select"
                        value={form.parentId}
                        onChange={(e) => setForm(prev => ({ ...prev, parentId: e.target.value }))}
                      >
                        <option value="">None (Top Level)</option>
                        {categories.filter(c => c.status !== "deleted" && c._id !== editId).map(c => (
                          <option key={c._id} value={c._id}>{renderHierarchy(c)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="dynoba-form-section">
                  <h5 className="mb-3">SEO & Metadata</h5>
                  <div className="mb-3">
                    <label className="dynoba-label">Meta Title</label>
                    <input type="text" className="form-control" value={form.metaTitle} onChange={e => setForm(prev => ({ ...prev, metaTitle: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="dynoba-label">Meta Description</label>
                    <textarea 
                      className="form-control" 
                      rows="4"
                      value={form.metaDescription} 
                      onChange={e => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Enter meta description for SEO..."
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="dynoba-label">Meta Keywords</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={form.metaKeywords} 
                      onChange={e => setForm(prev => ({ ...prev, metaKeywords: e.target.value }))} 
                      placeholder="comma-separated, e.g. math, worksheets, learning"
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Settings</h5>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="dynoba-label">Order</label>
                      <input type="number" className="form-control" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="dynoba-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="dynoba-form-section">
                  <h5 className="mb-3">Media</h5>
                  <div className="mb-3">
                    <input type="file" className="form-control mb-2" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData(); data.append("file", file);
                      const res = await APITemplate("upload/image", "POST", data);
                      if (res?.success) setForm(prev => ({ ...prev, icon: res.data.url }));
                    }} />
                    {form.icon && (
                      <div className="mt-2 p-2 border rounded d-flex align-items-center gap-2">
                        <img 
                          src={getImageUrl(form.icon)} 
                          style={{ height: "32px", width: "32px", objectFit: "contain" }} 
                          onError={(e) => { e.target.src = fallbackIcon; }}
                        />
                        <span className="small text-muted text-truncate">{form.icon}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="dynoba-label">Feature Image</label>
                    <input type="file" className="form-control mb-2" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData(); data.append("file", file);
                      const res = await APITemplate("upload/image", "POST", data);
                      if (res?.success) setForm(prev => ({ ...prev, image: res.data.url }));
                    }} />
                    {form.image && (
                      <div className="mt-2 border rounded overflow-hidden">
                        <img 
                          src={getImageUrl(form.image)} 
                          style={{ width: "100%", height: "120px", objectFit: "cover" }} 
                          onError={(e) => { e.target.src = fallbackImage; }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary py-2 fw-bold" disabled={loading}>
                    {editId ? "Save Changes" : "Create Category"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Reset Form</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
