"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import CustomEditor from "@/component/Editor";

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
    tags: "",
    metaTitle: "",
    metaDescription: "",
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
      list.forEach((c) => {
        map[c._id] = c;
      });
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
        list
          .filter((c) => c.status !== "deleted")
          .map((c) => ({
            id: c._id,
            name: buildCategoryPath(c),
          })),
      );
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
    const loadEditWorksheet = async () => {
      if (!editId) return;
      const response = await APITemplate("worksheet/all", "GET");
      if (!response?.success) {
        enqueueSnackbar(response?.message || "Failed to load worksheet", {
          variant: "error",
        });
        return;
      }

      const foundWorksheet = (Array.isArray(response.data) ? response.data : []).find(
        (item) => item._id === editId,
      );

      if (!foundWorksheet) {
        enqueueSnackbar("Worksheet not found", { variant: "error" });
        return;
      }

      setSlugLocked(true);
      setForm({
        title: foundWorksheet.title || "",
        subTitle: foundWorksheet.subTitle || "",
        slug: foundWorksheet.slug || "",
        price: String(foundWorksheet.price ?? ""),
        discountedPrice: String(foundWorksheet.discountedPrice ?? ""),
        rating: String(foundWorksheet.rating ?? ""),
        description: foundWorksheet.description || "",
        includes: foundWorksheet.includes || "",
        category: foundWorksheet.category?._id || foundWorksheet.category || "",
        fileUrl: foundWorksheet.fileUrl || "",
        thumbnail: foundWorksheet.thumbnail || "",
        icon: foundWorksheet.icon || "",
        author: foundWorksheet.author || "",
        authorImage: foundWorksheet.authorImage || "",
        publishedDate: foundWorksheet.publishedDate ? foundWorksheet.publishedDate.split("T")[0] : "",
        tags: Array.isArray(foundWorksheet.tags)
          ? foundWorksheet.tags.join(",")
          : foundWorksheet.tags || "",
        metaTitle: foundWorksheet.metaTitle || "",
        metaDescription: foundWorksheet.metaDescription || "",
        status: foundWorksheet.status || "active",
      });
    };

    loadEditWorksheet();
  }, [editId]);

  const resetForm = () => {
    setSlugLocked(false);
    setForm({
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
      tags: "",
      metaTitle: "",
      metaDescription: "",
      status: "active",
    });
    if (thumbnailRef.current) thumbnailRef.current.value = "";
    if (pdfFileRef.current) pdfFileRef.current.value = "";
    if (iconRef.current) iconRef.current.value = "";
    if (authorImageRef.current) authorImageRef.current.value = "";
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
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    const response = editId
      ? await APITemplate(`worksheet/${editId}`, "PUT", payload)
      : await APITemplate("worksheet/create", "POST", payload);

    setLoading(false);

    if (response?.success) {
      enqueueSnackbar(editId ? "Worksheet updated" : "Worksheet created", {
        variant: "success",
      });
      if (!editId) {
        resetForm();
      }
    } else {
      enqueueSnackbar(
        response?.message || `Failed to ${editId ? "update" : "create"} worksheet`,
        { variant: "error" },
      );
    }
  };

  return (
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 worksheet-add-page">
        <div className="worksheet-add-toolbar">
          <div className="worksheet-add-header">
            <h2>{editId ? "Edit Worksheet" : "Add Worksheet"}</h2>
            <p>
              {editId
                ? "Update worksheet details here without loading the full management table."
                : "Create new worksheet here without loading the full management table."}
            </p>
          </div>
          <Link href="/worksheets" className="btn btn-outline-primary">
            Back to Worksheets
          </Link>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="worksheet-add-card">
              <h5>{editId ? "Edit Worksheet" : "Add Worksheet"}</h5>
              <form onSubmit={handleSubmit} className="worksheet-add-form">
                <div className="row g-2">
                  <div className="col-12">
                    <label>Title</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          title,
                          slug: slugLocked
                            ? prev.slug
                            : String(title).trim().toLowerCase().replaceAll(" ", "-"),
                        }));
                      }}
                      placeholder="Worksheet title"
                    />
                  </div>
                  <div className="col-12">
                    <label>Sub Title</label>
                    <input
                      className="form-control"
                      value={form.subTitle}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, subTitle: e.target.value }))
                      }
                      placeholder="Short subtitle"
                    />
                  </div>
                  <div className="col-12">
                    <label>Category</label>
                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label>Description</label>
                    <CustomEditor
                      value={form.description}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, description: value }))
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label>Includes (Key Features/Details)</label>
                    <CustomEditor
                      value={form.includes}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, includes: value }))
                      }
                    />
                  </div>

                  <div className="col-6">
                    <label>Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="col-6">
                    <label>Discounted Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.discountedPrice}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, discountedPrice: e.target.value }))
                      }
                      placeholder="49"
                    />
                  </div>

                  <div className="col-6">
                    <label>Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={form.rating}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, rating: e.target.value }))
                      }
                      placeholder="4.5"
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

                  <div className="col-12">
                    <label>Slug</label>
                    <input
                      className="form-control"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugLocked(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="auto-from-title"
                    />
                  </div>
                  <div className="col-6">
                    <label>Published Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.publishedDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, publishedDate: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label>Thumbnail Image</label>
                    <input
                      ref={thumbnailRef}
                      type="file"
                      accept="image/*"
                      className="form-control mb-2"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const data = new FormData();
                        data.append("file", file);
                        const response = await APITemplate("upload/image", "POST", data);
                        if (response?.success && response.data?.url) {
                          setForm((prev) => ({ ...prev, thumbnail: response.data.url }));
                          enqueueSnackbar("Thumbnail uploaded", { variant: "success" });
                        }
                      }}
                    />
                    <input
                      className="form-control"
                      value={form.thumbnail}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, thumbnail: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="col-12">
                    <label>Icon URL / Emoji</label>
                    <input
                      ref={iconRef}
                      type="file"
                      accept="image/*"
                      className="form-control mb-2"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const data = new FormData();
                        data.append("file", file);
                        const response = await APITemplate("upload/image", "POST", data);
                        if (response?.success && response.data?.url) {
                          setForm((prev) => ({ ...prev, icon: response.data.url }));
                          enqueueSnackbar("Icon uploaded", { variant: "success" });
                        }
                      }}
                    />
                    <input
                      className="form-control"
                      value={form.icon}
                      onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                      placeholder="https://... or emoji"
                    />
                  </div>

                  <div className="col-12">
                    <label>PDF File</label>
                    <input
                      ref={pdfFileRef}
                      type="file"
                      accept="application/pdf"
                      className="form-control mb-2"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const data = new FormData();
                        data.append("file", file);
                        const response = await APITemplate("upload/image", "POST", data); // assuming upload endpoint handles pdf or is generic
                        if (response?.success && response.data?.url) {
                          setForm((prev) => ({ ...prev, fileUrl: response.data.url }));
                          enqueueSnackbar("PDF uploaded", { variant: "success" });
                        }
                      }}
                    />
                    <input
                      className="form-control"
                      value={form.fileUrl}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, fileUrl: e.target.value }))
                      }
                      placeholder="https://...pdf"
                    />
                  </div>

                  <div className="col-12">
                    <hr className="my-2" />
                    <h5>Author Information</h5>
                  </div>

                  <div className="col-12">
                    <label>Author Name</label>
                    <input
                      className="form-control"
                      value={form.author}
                      onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                    />
                  </div>

                  <div className="col-12">
                    <label>Author Image</label>
                    <input
                      ref={authorImageRef}
                      type="file"
                      accept="image/*"
                      className="form-control mb-2"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const data = new FormData();
                        data.append("file", file);
                        const response = await APITemplate("upload/image", "POST", data);
                        if (response?.success && response.data?.url) {
                          setForm((prev) => ({ ...prev, authorImage: response.data.url }));
                          enqueueSnackbar("Author image uploaded", { variant: "success" });
                        }
                      }}
                    />
                    <input
                      className="form-control"
                      value={form.authorImage}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, authorImage: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-12">
                    <label>Meta Title</label>
                    <input
                      className="form-control"
                      value={form.metaTitle}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                      }
                      placeholder="Meta title"
                    />
                  </div>
                  <div className="col-12">
                    <label>Meta Description</label>
                    <CustomEditor
                      value={form.metaDescription}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, metaDescription: value }))
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label>Meta Keywords (comma separated)</label>
                    <input
                      className="form-control"
                      value={form.tags}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, tags: e.target.value }))
                      }
                      placeholder="math,number,tracing"
                    />
                  </div>
                </div>

                <div className="worksheet-add-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {editId ? "Update Worksheet" : "Add Worksheet"}
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
