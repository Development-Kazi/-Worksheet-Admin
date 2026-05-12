"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { getImageUrl, fallbackImage, fallbackIcon } from "@/utils/media";
import "../../page.css";

export default function WorksheetViewPage() {
  const { id } = useParams();
  const [worksheet, setWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorksheet = async () => {
    setLoading(true);
    const response = await APITemplate("worksheet/all", "GET");
    if (response?.success) {
      const found = (Array.isArray(response.data) ? response.data : []).find(
        (item) => item._id === id
      );
      if (found) {
        setWorksheet(found);
      } else {
        enqueueSnackbar("Worksheet not found", { variant: "error" });
      }
    } else {
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchWorksheet();
  }, [id]);

  if (loading) {
    return (
      <div className="content-container">
        <div className="p-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading worksheet details...</p>
        </div>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="content-container">
        <div className="p-5 text-center">
          <h3>Worksheet Not Found</h3>
          <Link href="/worksheets" className="btn btn-primary mt-3">Back to List</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="worksheet-page">
        <div className="worksheet-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>Worksheet Details</h2>
            <p className="text-muted mb-0">Full overview of the worksheet asset and metadata.</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/worksheets" className="btn btn-outline-dark">
              <i className="fas fa-arrow-left me-2"></i> Back
            </Link>
            <Link href={`/worksheets/add?edit=${id}`} className="btn btn-primary">
              <i className="fas fa-edit me-2"></i> Edit
            </Link>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="worksheet-card mb-4">
              <div className="mb-4">
                <span className={`dynoba-status ${worksheet.status === "active" ? "is-active" : "is-draft"} mb-2 d-inline-block`}>
                  {worksheet.status || "active"}
                </span>
                <h3 className="fw-bold text-dark mb-1">{worksheet.title}</h3>
                <p className="text-muted lead mb-0">{worksheet.subTitle}</p>
                <div className="mt-2 text-primary small fw-bold">/{worksheet.slug}</div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Price</label>
                  <div className="h5 fw-bold">₹{worksheet.price}</div>
                </div>
                <div className="col-md-4">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Discount Price</label>
                  <div className="h5 text-muted">₹{worksheet.discountedPrice || "0"}</div>
                </div>
                <div className="col-md-4">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Rating</label>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fas fa-star text-warning"></i>
                    <span className="h5 mb-0 fw-bold">{worksheet.rating || "0.0"}</span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Description</label>
                <div 
                  className="bg-light p-3 rounded border"
                  dangerouslySetInnerHTML={{ __html: worksheet.description || "No description provided." }}
                />
              </div>

              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Includes</label>
                <div 
                  className="bg-light p-3 rounded border"
                  dangerouslySetInnerHTML={{ __html: worksheet.includes || "No details provided." }}
                />
              </div>
              
              <div>
                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Author</label>
                <div className="d-flex align-items-center gap-3 p-3 bg-white border rounded shadow-sm">
                  <img 
                    src={getImageUrl(worksheet.authorImage)} 
                    onError={e => e.target.src = fallbackIcon}
                    className="rounded-circle border"
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                  <div>
                    <div className="fw-bold text-dark">{worksheet.author || "Anonymous"}</div>
                    <div className="text-muted small">Content Creator</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="worksheet-card">
              <h5 className="fw-bold mb-3">SEO & Discovery</h5>
              <div className="mb-3">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Meta Title</label>
                <div className="fw-bold text-dark">{worksheet.metaTitle || worksheet.title}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Meta Description</label>
                <div className="text-muted small" style={{ whiteSpace: "pre-wrap" }}>
                  {worksheet.metaDescription || "None"}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Meta Keywords</label>
                <div className="text-dark small fw-bold">
                  {worksheet.metaKeywords || "None"}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="worksheet-card mb-4">
              <h5 className="fw-bold mb-3">Media & Files</h5>
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Thumbnail</label>
                <img 
                  src={getImageUrl(worksheet.thumbnail)} 
                  className="img-fluid rounded border shadow-sm" 
                  onError={(e) => { e.target.src = fallbackImage; }}
                />
              </div>
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Icon</label>
                <img 
                  src={getImageUrl(worksheet.icon)} 
                  className="img-thumbnail" 
                  style={{ width: "64px", height: "64px", objectFit: "contain" }} 
                  onError={(e) => { e.target.src = fallbackIcon; }}
                />
              </div>
              <div>
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">PDF Attachment</label>
                {worksheet.fileUrl ? (
                  <a 
                    href={getImageUrl(worksheet.fileUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary w-100 mt-2"
                  >
                    <i className="fas fa-file-pdf me-2"></i> View PDF
                  </a>
                ) : (
                  <div className="alert alert-secondary py-2 small mb-0">No PDF uploaded</div>
                )}
              </div>
            </div>

            <div className="worksheet-card">
              <h5 className="fw-bold mb-3">System Metadata</h5>
              <div className="mb-3">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Worksheet ID</label>
                <code className="small bg-light p-1 rounded border d-block text-truncate">{worksheet._id}</code>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Last Updated</label>
                <div className="small text-dark fw-bold">
                  {new Date(worksheet.updatedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div>
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Published Date</label>
                <div className="small text-dark">
                  {worksheet.publishedDate ? new Date(worksheet.publishedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
