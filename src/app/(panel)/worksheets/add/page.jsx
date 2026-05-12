"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import AdvancedEditor from "@/component/AdvancedEditor";
import { getImageUrl, fallbackImage, fallbackIcon } from "@/utils/media";

export default function AddWorksheetPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subTitle: "",
    slug: "",
    price: "",
    discountedPrice: "",
    rating: "",
    description: "",
    includes: "",
    category: "",
    fileUrl: "",
    thumbnail: "",
    icon: "",
    author: "",
    authorImage: "",
    publishedDate: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "active",
  });

  const thumbnailRef = useRef(null);
  const pdfFileRef = useRef(null);
  const iconRef = useRef(null);
  const authorImageRef = useRef(null);

  const fetchCategories = async () => {
    const response = await APITemplate("category/all", "GET");
    if (response?.success) {
      const list = Array.isArray(response.data) ? response.data : [];
      const map = {};
      list.forEach((c) => { map[c._id] = c; });
      const buildCategoryPath = (category) => {
        const names = [];
        let current = category;
        while (current) {
          names.unshift(current.name);
          const parentId = current.parent || null;
          current = parentId ? map[parentId] : null;
        }
        return names.join(" > ");
      };
      setCategoryOptions(
        list.filter((c) => c.status !== "deleted").map((c) => ({
          id: c._id,
          name: buildCategoryPath(c),
        }))
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadEditWorksheet = async () => {
      if (!editId) return;
      const response = await APITemplate("worksheet/all", "GET");
      if (response?.success) {
        const found = (Array.isArray(response.data) ? response.data : []).find(
          (item) => item._id === editId
        );
        if (found) {
          setSlugLocked(true);
          setForm({
            title: found.title || "",
            subTitle: found.subTitle || "",
            slug: found.slug || "",
            price: String(found.price ?? ""),
            discountedPrice: String(found.discountedPrice ?? ""),
            rating: String(found.rating ?? ""),
            description: found.description || "",
            includes: found.includes || "",
            category: found.category?._id || found.category || "",
            fileUrl: found.fileUrl || "",
            thumbnail: found.thumbnail || "",
            icon: found.icon || "",
            author: found.author || "",
            authorImage: found.authorImage || "",
            publishedDate: found.publishedDate || "",
            metaTitle: found.metaTitle || "",
            metaDescription: found.metaDescription || "",
            metaKeywords: found.metaKeywords || "",
            status: found.status || "active",
          });
        }
      }
    };
    loadEditWorksheet();
  }, [editId]);

  const resetForm = () => {
    setSlugLocked(false);
    setForm({
      title: "", subTitle: "", slug: "", price: "", discountedPrice: "",
      rating: "", description: "", includes: "", category: "", fileUrl: "",
      thumbnail: "", icon: "", author: "", authorImage: "", publishedDate: "",
      metaTitle: "", metaDescription: "", metaKeywords: "", status: "active",
    });
    [thumbnailRef, pdfFileRef, iconRef, authorImageRef].forEach(ref => {
      if (ref.current) ref.current.value = "";
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    const payload = {
      ...form,
      title: form.title.trim(),
      slug: (form.slug || form.title).trim().toLowerCase().replaceAll(" ", "-"),
      price: Number(form.price || 0),
      discountedPrice: Number(form.discountedPrice || 0),
      rating: Number(form.rating || 0),
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    const response = editId
      ? await APITemplate(`worksheet/${editId}`, "PUT", payload)
      : await APITemplate("worksheet/create", "POST", payload);
    setLoading(false);
    if (response?.success) {
      enqueueSnackbar(editId ? "Worksheet updated" : "Worksheet created", { variant: "success" });
      if (!editId) resetForm();
    } else {
      enqueueSnackbar(response?.message || "Operation failed", { variant: "error" });
    }
  };

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="worksheet-add-page">
        <div className="worksheet-add-toolbar d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>
              {editId ? "Edit Worksheet" : "Add Worksheet"}
            </h2>
            <p className="text-muted mb-0">Create premium worksheet assets for your library.</p>
          </div>
          <Link href="/worksheets" className="btn btn-outline-dark">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Worksheets
          </Link>
        </div>

        <div className="worksheet-add-card">
          <form onSubmit={handleSubmit} className="worksheet-add-form">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Basic Information</h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="dynoba-label">Title</label>
                      <input
                        className="form-control"
                        value={form.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setForm(prev => ({
                            ...prev, title,
                            slug: slugLocked ? prev.slug : title.trim().toLowerCase().replaceAll(" ", "-")
                          }));
                        }}
                        placeholder="e.g. Mathematics Tracing Worksheet"
                      />
                    </div>
                    <div className="col-12">
                      <label className="dynoba-label">Subtitle</label>
                      <input
                        className="form-control"
                        value={form.subTitle}
                        onChange={e => setForm(prev => ({ ...prev, subTitle: e.target.value }))}
                        placeholder="Short catchy subtitle"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="dynoba-label">Slug</label>
                      <input
                        className="form-control"
                        value={form.slug}
                        onChange={e => { setSlugLocked(true); setForm(prev => ({ ...prev, slug: e.target.value })); }}
                        placeholder="auto-generated"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="dynoba-label">Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Detailed Content</h5>
                  <div className="mb-4">
                    <label className="dynoba-label">Description</label>
                    <AdvancedEditor value={form.description} onChange={val => setForm(prev => ({ ...prev, description: val }))} />
                  </div>
                  <div>
                    <label className="dynoba-label">Includes (Features)</label>
                    <AdvancedEditor value={form.includes} onChange={val => setForm(prev => ({ ...prev, includes: val }))} />
                  </div>
                </div>

                <div className="dynoba-form-section">
                  <h5 className="mb-3">SEO & Meta</h5>
                  <div className="mb-3">
                    <label className="dynoba-label">Meta Title</label>
                    <input className="form-control" value={form.metaTitle} onChange={e => setForm(prev => ({ ...prev, metaTitle: e.target.value }))} />
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
                      className="form-control" 
                      value={form.metaKeywords} 
                      onChange={e => setForm(prev => ({ ...prev, metaKeywords: e.target.value }))} 
                      placeholder="comma-separated, e.g. math, tracing, kids"
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Pricing & Status</h5>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="dynoba-label">Price (₹)</label>
                      <input type="number" className="form-control" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="dynoba-label">Discount (₹)</label>
                      <input type="number" className="form-control" value={form.discountedPrice} onChange={e => setForm(prev => ({ ...prev, discountedPrice: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="dynoba-label">Rating</label>
                      <input type="number" step="0.1" className="form-control" value={form.rating} onChange={e => setForm(prev => ({ ...prev, rating: e.target.value }))} />
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

                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Media Assets</h5>
                  <div className="mb-3">
                    <label className="dynoba-label">Thumbnail</label>
                    <input type="file" className="form-control mb-1" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData(); data.append("file", file);
                      const res = await APITemplate("upload/image", "POST", data);
                      if (res?.success) setForm(prev => ({ ...prev, thumbnail: res.data.url }));
                    }} />
                    <p className="dynoba-hint">Recommended: 800x600px (4:3), PNG/JPG/WebP, max 2MB</p>
                    {form.thumbnail && (
                      <div className="image-preview-box">
                        <img src={getImageUrl(form.thumbnail)} onError={e => e.target.src = fallbackImage} />
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="dynoba-label">Icon</label>
                    <input type="file" className="form-control mb-1" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData(); data.append("file", file);
                      const res = await APITemplate("upload/image", "POST", data);
                      if (res?.success) setForm(prev => ({ ...prev, icon: res.data.url }));
                    }} />
                    <p className="dynoba-hint">Recommended: 128x128px (1:1), Transparent PNG/WebP</p>
                    {form.icon && (
                      <div className="mt-2 p-2 border rounded d-flex align-items-center gap-2">
                        <img src={getImageUrl(form.icon)} style={{ height: "32px", width: "32px", objectFit: "contain" }} onError={e => e.target.src = fallbackIcon} />
                        <span className="small text-muted text-truncate">Icon Linked</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="dynoba-label">PDF File</label>
                    <input type="file" accept=".pdf" className="form-control" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData(); data.append("file", file);
                      const res = await APITemplate("upload/file", "POST", data);
                      if (res?.success) setForm(prev => ({ ...prev, fileUrl: res.data.url }));
                    }} />
                    {form.fileUrl && <div className="mt-2 small text-primary fw-bold text-truncate"><i className="fas fa-file-pdf me-1"></i>PDF Linked</div>}
                  </div>
                </div>

                <div className="dynoba-form-section mb-4">
                  <h5 className="mb-3">Author Info</h5>
                  <div className="mb-3">
                    <label className="dynoba-label">Author Name</label>
                    <input className="form-control" value={form.author} onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))} />
                  </div>
                  <div>
                    <label className="dynoba-label">Author Image</label>
                    <input type="file" className="form-control mb-1" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData(); data.append("file", file);
                      const res = await APITemplate("upload/image", "POST", data);
                      if (res?.success) setForm(prev => ({ ...prev, authorImage: res.data.url }));
                    }} />
                    <p className="dynoba-hint">Recommended: 200x200px (Square), JPG/PNG</p>
                    {form.authorImage && (
                      <div className="d-flex align-items-center gap-2">
                        <img src={getImageUrl(form.authorImage)} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} onError={e => e.target.src = fallbackIcon} />
                        <span className="small text-muted">Image Linked</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary py-2 fw-bold" disabled={loading}>
                    {editId ? "Save Changes" : "Create Worksheet"}
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
