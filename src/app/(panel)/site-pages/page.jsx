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

export default function SitePagesPage() {
  const [pages, setPages] = useState([]);
  const [loadingKey, setLoadingKey] = useState("");

  const fetchPages = async () => {
    const response = await APITemplate("site-page/all", "GET");
    if (response?.success) {
      setPages(Array.isArray(response.data) ? response.data : []);
    } else {
      enqueueSnackbar(response?.message || "Failed to fetch site pages", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const orderedPages = useMemo(() => {
    const map = new Map(pages.map((page) => [page.key, page]));
    return pageOrder
      .map((key) => map.get(key))
      .filter(Boolean);
  }, [pages]);

  const updatePageState = (key, updater) => {
    setPages((prev) =>
      prev.map((page) => (page.key === key ? { ...page, ...updater } : page)),
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
      enqueueSnackbar(response?.message || `Failed to update ${pageLabels[page.key]}`, {
        variant: "error",
      });
    }
  };

  return (
    <div className="container">
      <SnackbarProvider />
      <div className="page-inner px-5 mt-4 site-pages-page">
        <div className="site-pages-header">
          <h2>Website Pages</h2>
          <p>Manage About Us, Contact Us, and Privacy Policy content from one place.</p>
        </div>

        <div className="row g-4">
          {orderedPages.map((page) => (
            <div className="col-12" key={page.key}>
              <div className="site-pages-card">
                <h5>{pageLabels[page.key]}</h5>
                <span className="site-page-key">{page.key}</span>

                <form
                  className="site-pages-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    savePage(page);
                  }}
                >
                  <div>
                    <label>Page Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={page.title || ""}
                      onChange={(e) =>
                        updatePageState(page.key, { title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Content</label>
                    <CustomEditor
                      value={page.content || ""}
                      onChange={(value) => updatePageState(page.key, { content: value })}
                    />
                  </div>

                  <div>
                    <label>Meta Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={page.metaTitle || ""}
                      onChange={(e) =>
                        updatePageState(page.key, { metaTitle: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Meta Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={page.metaDescription || ""}
                      onChange={(e) =>
                        updatePageState(page.key, { metaDescription: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Meta Keywords (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={page.metaKeywords || ""}
                      onChange={(e) =>
                        updatePageState(page.key, { metaKeywords: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Status</label>
                    <select
                      className="form-select"
                      value={page.status || "active"}
                      onChange={(e) =>
                        updatePageState(page.key, { status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="site-pages-actions">
                    <span className="site-pages-status">
                      {loadingKey === page.key ? "Saving..." : "Ready"}
                    </span>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loadingKey === page.key}
                    >
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
