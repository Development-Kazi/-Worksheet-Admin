"use client";
import { useEffect, useMemo, useState } from "react";
import "./page.css";
import { APITemplate } from "@/component/API/Template";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import CustomEditor from "@/component/Editor";

const pageOrder = ["about-us", "contact-us", "privacy-policy"];

const pageLabels = {
  "about-us": "About Us",
  "contact-us": "Contact Us",
  "privacy-policy": "Privacy Policy",
};

const pageIcons = {
  "about-us": "fa-info-circle",
  "contact-us": "fa-envelope",
  "privacy-policy": "fa-shield-alt",
};

export default function SitePagesPage() {
  const [pages, setPages] = useState([]);
  const [loadingKey, setLoadingKey] = useState("");

  const fetchPages = async () => {
    const response = await APITemplate("site-page/all", "GET");
    if (response?.success) {
      setPages(Array.isArray(response.data) ? response.data : []);
    } else {
      enqueueSnackbar(response?.message || "Failed to fetch site pages", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const orderedPages = useMemo(() => {
    const map = new Map(pages.map((page) => [page.key, page]));
    return pageOrder.map((key) => map.get(key)).filter(Boolean);
  }, [pages]);

  const updatePageState = (key, updater) => {
    setPages((prev) =>
      prev.map((page) => (page.key === key ? { ...page, ...updater } : page))
    );
  };

  const savePage = async (page) => {
    setLoadingKey(page.key);
    const response = await APITemplate(`site-page/${page.key}`, "PUT", {
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      status: page.status || "active",
    });
    setLoadingKey("");

    if (response?.success) {
      enqueueSnackbar(`${pageLabels[page.key]} updated`, { variant: "success" });
      await fetchPages();
    } else {
      enqueueSnackbar(response?.message || `Failed to update ${pageLabels[page.key]}`, { variant: "error" });
    }
  };

  return (
    <div className="content-container">
      <SnackbarProvider />
      <div className="site-pages-page">
        <div className="site-pages-header mb-5">
          <h2 className="fw-bold mb-1" style={{ color: "#000000", letterSpacing: "-0.03em" }}>Website Pages</h2>
          <p className="text-muted mb-0">Control the static content and SEO metadata for your core website pages.</p>
        </div>

        <div className="row g-5">
          {orderedPages.map((page) => (
            <div className="col-12" key={page.key}>
              <div className="site-pages-card shadow-sm">
                <span className="site-page-key">{page.key}</span>
                <h5>
                  <i className={`fas ${pageIcons[page.key]} text-primary`}></i>
                  {pageLabels[page.key]}
                </h5>

                <form
                  className="site-pages-form mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    savePage(page);
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label>Page Header Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={page.title || ""}
                        onChange={(e) => updatePageState(page.key, { title: e.target.value })}
                        placeholder="Title shown on the page"
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Visibility Status</label>
                      <select
                        className="form-select"
                        value={page.status || "active"}
                        onChange={(e) => updatePageState(page.key, { status: e.target.value })}
                      >
                        <option value="active">Active (Public)</option>
                        <option value="draft">Draft (Hidden)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label>Main Page Content</label>
                      <CustomEditor
                        value={page.content || ""}
                        onChange={(value) => updatePageState(page.key, { content: value })}
                      />
                    </div>

                    <div className="col-12">
                      <hr className="my-3" />
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted">SEO & Search Discovery</h6>
                    </div>

                    <div className="col-md-6">
                      <label>Meta Title Tag</label>
                      <input
                        type="text"
                        className="form-control"
                        value={page.metaTitle || ""}
                        onChange={(e) => updatePageState(page.key, { metaTitle: e.target.value })}
                        placeholder="Browser tab title"
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Meta Keywords</label>
                      <input
                        type="text"
                        className="form-control"
                        value={page.metaKeywords || ""}
                        onChange={(e) => updatePageState(page.key, { metaKeywords: e.target.value })}
                        placeholder="keyword1, keyword2..."
                      />
                    </div>

                    <div className="col-12">
                      <label>Meta Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={page.metaDescription || ""}
                        onChange={(e) => updatePageState(page.key, { metaDescription: e.target.value })}
                        placeholder="Short summary for search engines"
                      />
                    </div>
                  </div>

                  <div className="site-pages-actions">
                    <div className="d-flex align-items-center gap-2">
                      {loadingKey === page.key ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      ) : (
                        <i className="fas fa-check-circle text-success small"></i>
                      )}
                      <span className="site-pages-status">
                        {loadingKey === page.key ? "Syncing changes..." : "All changes synced"}
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2"
                      disabled={loadingKey === page.key}
                    >
                      <i className="fas fa-save me-2"></i>
                      Save {pageLabels[page.key]}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
