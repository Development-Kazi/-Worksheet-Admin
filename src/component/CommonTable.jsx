"use client";
import { useEffect, useState } from "react";
import { APITemplate } from "./API/Template";
import { enqueueSnackbar, SnackbarProvider } from "notistack";

const CommonTable = ({
  apiUrl,
  headers,
  children,
  startdate = "",
  enddate = "",
  status = "",
  setData,
  formData = [""],
  customQuery = "",
  pageHidden = false,
  initialLength = 100,
  setSeries,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialLength);
  const [currentPages, setCurrentPages] = useState();

  const fetchData = async (
    page,
    pageSize,
    key = "createdAt",
    direction = "desc"
  ) => {
    const query = `&startDate=${startdate}&endDate=${enddate}&status=${status}&${customQuery}`;
    const response = await APITemplate(
      `${apiUrl}?_sort=${key}&_order=${direction}&_page=${page}&_limit=${pageSize}${query}`,
      "POST",
      formData
    );
    if (response.success == true) {
      setData(response.data);
      setTotalCount(response.data.totalCount);
      setTimeout(() => {}, 500);
    } else {
      enqueueSnackbar(
        response.message,
        { variant: "error" },
        { autoHideDuration: 500 }
      );
    }
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    const nextPage = Math.max(page, 1);
    setCurrentPage(nextPage);
  };

  const handlePageSizeChange = (size) => {
    const newSize = Math.max(size, 1);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (apiUrl != "") {
      fetchData(currentPage, pageSize, sortConfig.key, sortConfig.direction);
    }
  }, [sortConfig, currentPage, pageSize, apiUrl]);

  useEffect(() => {
    setCurrentPage(1);
    setPageSize(initialLength);
    setSortConfig({ key: "createdAt", direction: "desc" });
  }, [startdate, enddate, status, customQuery]);

  const totalPages = Math.ceil(totalCount / pageSize);
  useEffect(() => {
    const pageNumbers = Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );

    let displayPages = [];

    if (currentPage <= 3) {
      displayPages = pageNumbers.slice(0, 4);
      if (pageNumbers?.length > 4) {
        displayPages = [...displayPages, "...", totalPages];
      }
    } else if (currentPage >= totalPages - 2) {
      displayPages = pageNumbers.slice(totalPages - 4);
    } else {
      displayPages = pageNumbers.filter(
        (pageNumber) =>
          pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1
      );
      displayPages = [...displayPages, "...", totalPages];
    }

    setCurrentPages(displayPages);
    setSeries({ currentPageNumber: currentPage, currentPageSize: pageSize });
  }, [totalCount, pageSize, currentPage]);

  return (
    <div
      className="card-body py-4 rounded-4"
      style={{ backgroundColor: "#d5e4ff" }}
    >
      <SnackbarProvider />
      <div className="table-responsive">
        <table className="display table-select table table-striped table-hover">
          <thead>
            <tr>
              <th className="text-nowrap">Sr. No.</th>
              {headers.map((header) => (
                <th
                  key={header.key}
                  onClick={() => handleSort(header.key)}
                  style={{ cursor: "pointer" }}
                  className="text-nowrap"
                >
                  {header.label}
                  {sortConfig.key === header.key
                    ? sortConfig.direction === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {!pageHidden && (
        <>
          {totalCount > 0 && (
            <div className="d-flex justify-content-between align-items-center pt-4">
              <div className="d-flex justify-content-end align-items-center">
                <label htmlFor="pageSizeSelect" className="me-2 text-muted">
                  Items per page:
                </label>
                <select
                  id="pageSizeSelect"
                  className="form-select w-auto"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  {[initialLength, 300, 500].map((size) => (
                    <option key={size} value={size}>
                      {size} items per page
                    </option>
                  ))}
                </select>
              </div>
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end m-0">
                  <li
                    className={`page-item ${
                      currentPage <= 1 ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(Math.max(currentPage - 1, 1));
                      }}
                      tabIndex="-1"
                      aria-disabled={currentPage <= 1 ? "true" : "false"}
                    >
                      Previous
                    </a>
                  </li>

                  {currentPage >= 4 && totalPages > 4 && (
                    <>
                      <li className={`page-item`}>
                        <a
                          className="page-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                          }}
                        >
                          1
                        </a>
                      </li>
                      <li className={`page-item`}>
                        <a
                          className="page-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 3);
                          }}
                        >
                          ...
                        </a>
                      </li>
                    </>
                  )}

                  {currentPages?.length &&
                    currentPages.map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          currentPage === pageNumber ? "active" : ""
                        }`}
                      >
                        <a
                          className="page-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(
                              pageNumber == "..." ? currentPage + 3 : pageNumber
                            );
                          }}
                        >
                          {pageNumber}
                        </a>
                      </li>
                    ))}

                  <li
                    className={`page-item ${
                      currentPage >= Math.ceil(totalCount / pageSize)
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(
                          Math.min(
                            currentPage + 1,
                            Math.ceil(totalCount / pageSize)
                          )
                        );
                      }}
                    >
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommonTable;
