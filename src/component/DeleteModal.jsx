import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { APITemplate } from "./API/Template";

const DeleteModal = ({ title, isOpen, onClose, endpoint }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await APITemplate(`${endpoint}`, "DELETE");
    onClose();
    setLoading(false);
    window.location.reload();
  };

  return (
    <Modal show={isOpen == "open"} onHide={onClose} data-bs-theme="dark">
      <Modal.Body className="modal-body">
        <div className="p-4 text-white">
          <h4 className="text-success text-center ">Delete {title}?</h4>

          <div className="d-flex gap-3 text-center mt-4">
            <button
              className="btn btn-label-danger w-100 btn-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="btn btn-label-success w-100 btn-lg"
              onClick={handleDelete}
            >
              <div>
                {loading && (
                  <div className="spinner-border spinner-border-sm me-2"></div>
                )}
                <div>Delete</div>
              </div>
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteModal;
