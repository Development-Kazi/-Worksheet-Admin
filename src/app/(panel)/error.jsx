"use client";

export default function Error() {
  return (
    <div className="container">
      <div className="page-inner px-5 mt-3">
        <div
          className="d-flex justify-content-center align-items-center flex-column gap-4 w-100"
          style={{ height: "60vh" }}
        >
          <h1 className="text-center">Something went wrong</h1>
          <button
            className="btn btn-secondary px-4 rounded-pill btn-lg"
            onClick={() => window.location.reload()}
          >
            {" "}
            Retry
            <i className="fas fa-redo ms-2 fs-6"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
