"use client";
import React, { useEffect, useRef } from "react";
import { Tooltip } from "react-tooltip";

const EntryFrom = ({ entryFrom }) => {
  let buttonIcon;
  let tooltipTitle;

  if (entryFrom === "web") {
    buttonIcon = <i className="fa-solid fa-globe"></i>;
    tooltipTitle = "Website";
  } else if (entryFrom === "android") {
    buttonIcon = <i className="fa-brands fa-android"></i>;
    tooltipTitle = "Android";
  } else {
    buttonIcon = <i className="fa-solid fa-mobile-screen-button"></i>;
    tooltipTitle = "IOS";
  }
  let tooltipId = Math.random().toString(36).slice(2);
  return (
    <>
      <Tooltip id={"my-tooltip-" + tooltipId} />

      <button
        type="button"
        className="btn btn-label-info"
        data-tooltip-id={"my-tooltip-" + tooltipId}
        data-tooltip-content={tooltipTitle}
      >
        {buttonIcon}
      </button>
    </>
  );
};

export default EntryFrom;
