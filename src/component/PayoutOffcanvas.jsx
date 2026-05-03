"use client";
import { useEffect, useState } from "react";
import { DateFormate } from "./global";
import { APITemplate } from "./API/Template";

const PayoutsOffcanvas = ({ currentPayout }) => {
  return (
    <div
      style={{ minWidth: "35%" }}
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="offcanvasPayouts"
      aria-labelledby="offcanvasPayoutsLabel"
      aria-modal="true"
      role="dialog"
    >
      <div className="offcanvas-header justify-content-between p-4">
        <h2 className="offcanvas-title fw-semibold" id="timelineAmount">
          ₹ {currentPayout?.amount}
        </h2>
        <button
          type="button"
          className="btn btn-danger rounded-3 btn-sm fs-5 fw-semibold"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        >
          X
        </button>
      </div>
      <div className="offcanvas-body">
        <div className="timeline-payout">
          <ul className="sessions" id="payout_timeline">
            {currentPayout.timeline &&
              currentPayout?.timeline?.length > 0 &&
              currentPayout.timeline.map((state, index) => {
                return (
                  <li
                    key={index}
                    className={`
                    ${
                      state.status === "created"
                        ? "blue"
                        : state.status === "processing"
                        ? ""
                        : state.status === "failed"
                        ? "red"
                        : state.status === "cancelled"
                        ? "red"
                        : state.status === "reversed"
                        ? "purple"
                        : state.status === "completed"
                        ? "green"
                        : ""
                    } 
                  `}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2 gap-3 ">
                      <div>
                        <div className="time text-capitalize">
                          {state?.status}
                        </div>
                        <i className="text-dark">{state?.message}</i>
                      </div>
                      <div className="text-dark text-nowrap">
                        {DateFormate(state?.date)}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="mt-4 px-4">
          <h5>Payout Details</h5>
          <div className="d-flex gap-3 mt-2 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Client Name
            </div>
            <div style={{ color: "black" }} id="username">
              {currentPayout?.beneficiary?.name}
            </div>
          </div>
          {/* <div className="d-flex gap-3 mt-2 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              UTR Number
            </div>
            <div style={{ color: "black" }} id="utr_number">
              {currentPayout?.utr}
            </div>
          </div> */}
          <div className="d-flex gap-3 mt-2 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Invoice Initiated By
            </div>
            <div style={{ color: "black" }} id="payout_id">
              {currentPayout?.initiatedBy?.username}
            </div>
          </div>

          <div className="d-flex gap-3 mt-2 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Invoice No.
            </div>
            <div style={{ color: "black" }} id="ref_id">
              {currentPayout?.referenceId}
            </div>
          </div>
          <div className="d-flex gap-3 mt-1 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Amount
            </div>
            <div>
              ₹ <span id="amount"> {currentPayout?.amount}</span>
            </div>
          </div>
          {/* <div className="d-flex gap-3 mt-2 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Debit From
            </div>
            <div style={{ color: "black" }} id="debit_from">
              {currentPayout?.clientBankDetails?.accountNumber}
            </div>
          </div> */}

          <div className="d-flex gap-3 mt-2 text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Transfer Method
            </div>
            <div style={{ color: "black" }} id="transfer_mode">
              {currentPayout?.transferMode}
            </div>
          </div>
          <div className="d-flex gap-3 mt-2  text-dark">
            <div className="text-dark" style={{ width: "150px" }}>
              Narration
            </div>
            <div style={{ color: "black" }} id="narration">
              {currentPayout?.beneficiary?.narration}
            </div>
          </div>

          {/* <div className="mt-4">
            <h6>Gateway Commission</h6>
            <div className="d-flex gap-3 text-dark">
              <div style={{color:"black"}} id="payin_gatewayCommission-container">
                <table className="table table-striped text-dark">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Amount</th>
                      <th>Amount Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayout?.gatewayCommission &&
                      currentPayout?.gatewayCommission?.details?.length > 0 &&
                      currentPayout?.gatewayCommission?.details.map(
                        (details, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{details.min}</td>
                              <td>{details.max}</td>
                              <td>{details.type}</td>
                              <td>{details.amount}</td>
                            </tr>
                          );
                        }
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div> */}

          {/* <div className="mt-4">
            <h6>Panel Commission</h6>
            <div className="d-flex gap-3 text-dark">
              <div style={{color:"black"}} id="payin_gatewayCommission-container">
                <table className="table table-striped text-dark">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Amount</th>
                      <th>Amount Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayout?.panelCommission &&
                      currentPayout?.panelCommission?.details?.length > 0 &&
                      currentPayout?.panelCommission?.details.map(
                        (details, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{details.min}</td>
                              <td>{details.max}</td>
                              <td>{details.type}</td>
                              <td>{details.amount}</td>
                            </tr>
                          );
                        }
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div> */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center">
              <h5>Beneficiary Details</h5>
            </div>
            <div className="d-flex gap-3 mt-1 text-dark">
              <div className="text-dark" style={{ width: "150px" }}>
                Name
              </div>
              <div style={{ color: "black" }} id="off_beneficiary_name">
                {currentPayout?.beneficiary?.name}
              </div>
            </div>
            <div className="d-flex gap-3 mt-1 text-dark">
              <div className="text-dark" style={{ width: "150px" }}>
                Beneficiary Contact
              </div>
              <div style={{ color: "black" }} id="off_beneficiary_contact">
                {" "}
                {currentPayout?.beneficiary?.contact}
              </div>
            </div>
            <div className="d-flex gap-3 mt-2 text-dark">
              <div className="text-dark" style={{ width: "150px" }}>
                Bank Name
              </div>
              <div style={{ color: "black" }} id="bank_name">
                {currentPayout?.beneficiary?.bankName}
              </div>
            </div>
            <div className="d-flex gap-3 mt-2 text-dark">
              <div className="text-dark" style={{ width: "150px" }}>
                Account Number
              </div>
              <div style={{ color: "black" }} id="off_account_number">
                {currentPayout?.beneficiary?.account}
              </div>
            </div>
            <div className="d-flex gap-3 mt-2 text-dark">
              <div className="text-dark" style={{ width: "150px" }}>
                Account IFSC Code
              </div>
              <div style={{ color: "black" }} id="off_account_ifsc">
                {currentPayout?.beneficiary?.ifsc}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutsOffcanvas;
