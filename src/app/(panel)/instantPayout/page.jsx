"use client";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import jsonexport from "jsonexport/dist";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import PayoutsOffcanvas from "@/component/PayoutOffcanvas";
import { APITemplate } from "@/component/API/Template";
import CommonTable from "@/component/CommonTable";
import { DateFormate } from "@/component/global";

const Page = () => {
  const router = useRouter();

  const [clientData, setClientData] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [client, setClient] = useState("");
  const [enddate, setEndDate] = useState("");
  const [startdate, setStartDate] = useState("");
  const [selectedPayout, setSelectedPayout] = useState({});
  const [balanceModalOpen, setBalanceModalOpen] = useState("none");
  const [series, setSeries] = useState({
    currentPageNumber: 1,
    currentPageSize: 0,
  });
  const apiUrl = "payout/getPayouts";

  const headers = [
    { key: "client", label: "Vender Id" },
    { key: "beneficiary.ifsc", label: "Vender Name" },
    { key: "referenceId", label: "Invoice No." },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "initiatedBy.username", label: "Initiated By" },
    { key: "createdAt", label: "Date" },
  ];

  const getNestedValue = (obj, key) => {
    return key.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const downloadCsv = () => {
    const filteredData =
      payouts.data?.length > 0 &&
      payouts.data?.map((item) => {
        const filteredItem = {};
        headers.forEach((header) => {
          const value = getNestedValue(item, header.key);
          if (value !== undefined) {
            filteredItem[header.label] =
              header.key === "createdAt" ? DateFormate(value) : value;
          }
        });
        return filteredItem;
      });

    // Export the filtered data using jsonexport
    if (filteredData && filteredData.length > 0) {
      jsonexport(filteredData, (err, csv) => {
        if (err) {
          console.error("Error converting to CSV:", err);
          return;
        }

        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `instantPayouts.csv`;
        link.click();
      });
    } else {
      enqueueSnackbar("No Payouts found", {
        variant: "error",
      });
    }
  };

  const handleCloseBalanceModal = () => {
    setBalanceModalOpen("none");
  };

  const getClientData = async () => {
    const response = await APITemplate("client/getAll", "GET");
    if (response?.data?.length > 0) {
      let client = response.data.map((client) => ({
        clientId: client._id,
        name: client.username,
      }));

      setClientData(client);
    }
  };

  useEffect(() => {
    const getData = async () => {
      await getClientData();
    };

    getData();

    import("bootstrap/js/src/offcanvas.js");
  }, []);
  return (
    <div className="container">
      <SnackbarProvider />
      <PayoutsOffcanvas currentPayout={selectedPayout} />

      <div className="page-inner px-5">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold text-dark">Payouts</h2>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control form-control-lg"
                placeholder="Enter Input"
                value={startdate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  paddingRight: "80px",
                  fontSize: "16px",
                }}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control form-control-lg"
                placeholder="Enter Input"
                value={enddate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Vendor</label>
              <select
                name="client"
                className="form-control form-control-lg"
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">All Vender</option>
                {clientData?.length > 0 &&
                  clientData.map((client) => (
                    <option key={client.clientId} value={client.clientId}>
                      {client.name}
                    </option>
                  ))}
              </select>
            </div>
            <a onClick={downloadCsv} className="btn btn-success mt-4">
              Export to Excel
            </a>
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={() => setBalanceModalOpen("open")}
          >
            Make Instant Payout
          </button>
          <AddPayout
            open={balanceModalOpen}
            onClose={handleCloseBalanceModal}
            client={clientData.find((c) => c.clientId === client)}
          />
        </div>
        <div className="my-4">
          <div
            className="card-body p-4 rounded-4"
            style={{ backgroundColor: "#d5e4ff" }}
          >
            <CommonTable
              apiUrl={apiUrl}
              headers={headers}
              enddate={enddate}
              startdate={startdate}
              setData={setPayouts}
              setSeries={setSeries}
              customQuery={`client=${client}`}
            >
              {payouts.data?.length > 0 ? (
                payouts.data.map((payout, index) => {
                  const serialNumber =
                    (series.currentPageNumber - 1) * series.currentPageSize +
                    index +
                    1;
                  return (
                    <tr
                      key={index}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasPayouts"
                      aria-controls="offcanvasPayouts"
                      onClick={() => setSelectedPayout(payout)}
                    >
                      <td>{serialNumber}</td>
                      <td>{payout?.client}</td>
                      <td>
                        {payout?.beneficiary?.name
                          ? payout?.beneficiary?.name
                          : "-"}
                      </td>
                      <td>{payout.referenceId}</td>
                      <td>{payout?.amount ? payout?.amount : "-"}</td>
                      <td>
                        <div
                          className={`badge border-0 text-uppercase ${
                            payout.status === "completed"
                              ? "bg-success"
                              : payout.status === "cancelled"
                                ? "bg-danger"
                                : payout.status === "failed"
                                  ? "bg-danger"
                                  : payout.status === "reversed"
                                    ? "bg-secondary"
                                    : "bg-secondary"
                          } `}
                        >
                          {payout.status === "created"
                            ? "processing"
                            : payout.status}
                        </div>
                      </td>
                      <td className="text-nowrap">
                        {payout?.initiatedBy?.username}
                      </td>
                      <td className="text-nowrap">
                        {DateFormate(payout.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Data Found
                  </td>
                </tr>
              )}
            </CommonTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

const AddPayout = ({ open, onClose, client }) => {
  const validationSchema = Yup.object({
    amount: Yup.string()
      .required("Amount is required")
      .min(1, "Amount must be greater than or equal to 1"),
    accountNumber: Yup.string().required("Account number is required"),
    accountIfsc: Yup.string().required("accountIfsc number is required"),
    bankName: Yup.string().required("Bank name is required"),
    requestType: Yup.string().required("Payment mode is required"),
    beneficiaryName: Yup.string().required("Beneficiary name is required"),
    beneficiaryContact: Yup.string().required("Contact is required"),
    narration: Yup.string().required("Narration is required"),
    TPIN: Yup.string().required("TPIN is required"),
  });

  const formik = useFormik({
    initialValues: {
      accountNumber: "",
      accountIfsc: "",
      amount: 0,
      TPIN: "",
      requestType: "IMPS",
      referenceId: "Panel",
      bankName: "",
      beneficiaryName: "",
      beneficiaryContact: "",
      narration: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      if (!client?.TPIN) {
        enqueueSnackbar(
          "Set TPIN before making payout",
          { variant: "error" },
          { autoHideDuration: 500 },
        );
        setSubmitting(false);
        return;
      }

      if (client?.TPIN && client?.TPIN == parseInt(formik.values.TPIN)) {
        const requestBody = {
          amount: values.amount,
          accountNumber: values.accountNumber,
          accountIfsc: values.accountIfsc,
          referenceId: values.referenceId,
          requestType: values.requestType,
          TPIN: values.TPIN,
          otherDetails: {
            bankName: values.bankName,
            name: values.beneficiaryName,
            contact: values.beneficiaryContact,
            narration: values.narration,
          },
        };

        const response = await APITemplate(
          "api/payout/create",
          "POST",
          requestBody,
          {
            clientId: client?.payout?.clientId,
            clientSecret: client?.payout?.clientSecret,
            mode: "panel",
          },
        );

        if (response.success == true) {
          enqueueSnackbar(response.message, {
            variant: "success",
          });

          setTimeout(() => {
            onClose();
            formik.resetForm();
            window.location.reload();
            setSubmitting(false);
          }, 500);
        } else {
          enqueueSnackbar(response.message, {
            variant: "error",
          });
        }
        setSubmitting(false);
      } else {
        enqueueSnackbar(
          "Entered TPIN not matched",
          { variant: "error" },
          { autoHideDuration: 500 },
        );
        setSubmitting(false);
        return;
      }
    },
  });

  return (
    <>
      <Modal
        show={open == "open"}
        onHide={onClose}
        tabIndex="-1"
        aria-labelledby="AddBalanceLabel"
        aria-modal="true"
        role="dialog"
        centered
        size="lg"
        style={{ display: "block", paddingLeft: 0 }}
      >
        <form>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content ">
              <div className="modal-header border-0 justify-content-between py-0">
                <h1 className="modal-title fs-5 fw-semibold">
                  Make Instant Payout
                </h1>
                <button
                  type="button"
                  className="btn fs-5 fw-semibold"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={onClose}
                >
                  X
                </button>
              </div>

              <div className="modal-body">
                <div className="d-flex">
                  <div className="form-group w-100 ">
                    <label
                      htmlFor="accountNumber"
                      className={` ${
                        formik.errors.accountNumber
                          ? "text-danger"
                          : "text-dark"
                      }`}
                    >
                      Account Number
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="accountNumber"
                      name="accountNumber"
                      title="Please enter a Account Number"
                      onChange={formik.handleChange}
                      value={formik.values.accountNumber}
                    />
                  </div>

                  <div className="form-group w-100 ">
                    <label
                      htmlFor="accountIfsc"
                      className={` ${
                        formik.errors.accountIfsc ? "text-danger" : "text-dark"
                      }`}
                    >
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="accountIfsc"
                      name="accountIfsc"
                      title="Please enter a account IFSC Code"
                      onChange={formik.handleChange}
                      value={formik.values.accountIfsc}
                    />
                  </div>
                </div>

                <div className="d-flex">
                  <div className="form-group w-100 ">
                    <label
                      htmlFor="bankName"
                      className={` ${
                        formik.errors.bankName ? "text-danger" : "text-dark"
                      }`}
                    >
                      Bank Name
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="bankName"
                      name="bankName"
                      title="Please enter a Bank Name"
                      onChange={formik.handleChange}
                      value={formik.values.bankName}
                    />
                  </div>

                  <div className="form-group w-100 ">
                    <label
                      htmlFor="requestType"
                      className={` ${
                        formik.errors.requestType ? "text-danger" : "text-dark"
                      }`}
                    >
                      Transfer Mode
                    </label>
                    <select
                      name="requestType"
                      className="form-select form-select-lg"
                      onChange={formik.handleChange}
                      value={formik.values.requestType}
                    >
                      <option value="IMPS">IMPS</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex">
                  <div className="form-group w-100">
                    <label
                      htmlFor="amount"
                      className={` ${
                        formik.errors.amount ? "text-danger" : "text-dark"
                      }`}
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      required=""
                      className="form-control"
                      id="amount"
                      placeholder="₹ 100"
                      name="amount"
                      pattern="[0-9]*[.,]?[0-9]+"
                      title="Please enter a valid amount"
                      inputMode="decimal"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                    />
                  </div>

                  <div className="form-group w-100">
                    <label
                      htmlFor="narration"
                      className={` ${
                        formik.errors.narration ? "text-danger" : "text-dark"
                      }`}
                    >
                      Narration
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="narration"
                      name="narration"
                      value={formik.values.narration}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex">
                  <div className="form-group w-100 ">
                    <label
                      htmlFor="beneficiaryName"
                      className={` ${
                        formik.errors.beneficiaryName
                          ? "text-danger"
                          : "text-dark"
                      }`}
                    >
                      Beneficiary Name
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="beneficiaryName"
                      name="beneficiaryName"
                      title="Please enter a Beneficiary Name"
                      value={formik.values.beneficiaryName}
                      onChange={formik.handleChange}
                    />
                  </div>

                  <div className="form-group w-100 ">
                    <label
                      htmlFor="beneficiaryContact"
                      className={` ${
                        formik.errors.beneficiaryContact
                          ? "text-danger"
                          : "text-dark"
                      }`}
                    >
                      Beneficiary Contact
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="beneficiaryContact"
                      name="beneficiaryContact"
                      title="Please enter a Beneficiary Contact"
                      value={formik.values.beneficiaryContact}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-end">
                  <div className="form-group w-100 ">
                    <label
                      htmlFor="TPIN"
                      className={` ${
                        formik.errors.TPIN ? "text-danger" : "text-dark"
                      }`}
                    >
                      TPIN
                    </label>
                    <input
                      type="text"
                      required=""
                      className="form-control"
                      id="TPIN"
                      name="TPIN"
                      title="Please enter a TPIN"
                      value={formik.values.TPIN}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div className="form-group w-100">
                    <button
                      type="button"
                      className="btn btn-primary w-100 "
                      onClick={formik.handleSubmit}
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting && (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      )}
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
