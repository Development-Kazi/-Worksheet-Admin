"use client";
import { createContext, useContext, useEffect, useState } from "react";

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [loader, setLoader] = useState(false);

  return (
    <LoaderContext.Provider value={{ loader, setLoader }}>
      {loader == true && (
        <div className="position-fixed top-0 start-0 w-100 vh-100 loader-glass z-999">
          <div className="position-absolute top-50 start-50 z-999 translate-middle">
            <div
              className="spinner-border text-primary"
              style={{ width: "100px", height: "100px" }}
            ></div>
          </div>
        </div>
      )}
      {children}
    </LoaderContext.Provider>
  );
};
