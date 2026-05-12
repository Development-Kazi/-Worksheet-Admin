"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { getImageUrl, fallbackImage, fallbackIcon } from "@/utils/media";
import "../../page.css";

export default function CategoryViewPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      const response = await APITemplate("category/all", "GET");
      if (response?.success) {
        const found = (Array.isArray(response.data) ? response.data : []).find(
          (item) => item._id === id
        );
        if (found) {
          setCategory(found);
        } else {
          enqueueSnackbar("Category not found", { variant: "error" });
        }
      }
      setLoading(false);
    };
    fetchCategory();
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="content-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="content-container">
        <div className="text-center py-5">
          <h3>Category not found</h3>
          <Link href="/categories" className="btn btn-primary mt-3">Back to Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="category-view-page">
        <div className="category-add-toolbar d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>
              Category Details
            </h2>
            <p className="text-muted mb-0">Detailed view of "{category.name}"</p>
          </div>
          <div className="d-flex gap-2">
            <Link href={`/categories/add?edit=${category._id}`} className="btn btn-dark">
              <i className="fas fa-edit me-2"></i> Edit Category
            </Link>
            <Link href="/categories" className="btn btn-outline-dark">
              <i className="fas fa-arrow-left me-2"></i> Back
            </Link>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="category-card mb-4">
              <h5 className="mb-4 pb-2 border-bottom fw-bold">Overview</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Category Name</label>
                  <p className="fs-5 fw-bold text-dark">{category.name}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Slug</label>
                  <p className="fs-5 text-primary">/{category.slug}</p>
                </div>
                <div className="col-md-12">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Meta Description</label>
                  <div className="p-3 bg-light rounded border text-muted small" style={{ whiteSpace: "pre-wrap" }}>
                    {category.metaDescription || "No description provided."}
                  </div>
                </div>
              </div>
            </div>

            <div className="category-card">
              <h5 className="mb-4 pb-2 border-bottom fw-bold">SEO & Metadata</h5>
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Meta Title</label>
                  <p className="fw-bold">{category.metaTitle || "-"}</p>
                </div>
                <div className="col-md-12">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Meta Keywords</label>
                  <p>{category.metaKeywords || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="category-card mb-4">
              <h5 className="mb-4 pb-2 border-bottom fw-bold">Status & Info</h5>
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Status</label>
                <span className={`dynoba-status ${category.status === 'active' ? 'is-active' : 'is-draft'}`}>
                  {category.status || "active"}
                </span>
              </div>
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Sort Order</label>
                <p className="fw-bold fs-4">{category.order ?? 0}</p>
              </div>
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Last Updated</label>
                <p>{formatDate(category.updatedAt)}</p>
              </div>
              <div className="mb-0">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Created At</label>
                <p>{formatDate(category.createdAt)}</p>
              </div>
            </div>

            <div className="category-card">
              <h5 className="mb-4 pb-2 border-bottom fw-bold">Media Assets</h5>
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Icon</label>
                {category.icon ? (
                  <img 
                    src={getImageUrl(category.icon)} 
                    className="img-thumbnail" 
                    style={{ width: "64px", height: "64px", objectFit: "contain" }} 
                    onError={(e) => { e.target.src = fallbackIcon; }}
                  />
                ) : (
                  <p className="text-muted italic">No icon uploaded</p>
                )}
              </div>
              <div>
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Feature Image</label>
                {category.image ? (
                  <img 
                    src={getImageUrl(category.image)} 
                    className="img-fluid rounded border" 
                    onError={(e) => { e.target.src = fallbackImage; }}
                  />
                ) : (
                  <p className="text-muted italic">No image uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
