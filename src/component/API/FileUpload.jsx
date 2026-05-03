import { useState } from "react";

const FileUpload = ({ label, fieldName, setFieldValue, formikError }) => {
  const [filePreview, setFilePreview] = useState("");

  return (
    <div className="form-group">
      <h6 htmlFor={fieldName}>{label}</h6>
      <div className="d-flex gap-3">
        {!filePreview ? (
          <>
            <label
              htmlFor={fieldName}
              className="btn rounded-3 w-100 p-0 m-0"
              style={{
                border: "1px dashed #a5a5a5",
              }}
            >
              <div className="d-flex flex-column align-items-center gap-1 pt-2">
                <div>
                  <i className="fa-solid fa-file-arrow-up fa-xl text-light"></i>
                </div>
                <p className="mb-0 lh-base">Upload file</p>
              </div>
            </label>
            <input
              type="file"
              id={fieldName}
              name={fieldName}
              className="form-control d-none"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const objectUrl = URL.createObjectURL(file);
                  setFilePreview(objectUrl);
                  setFieldValue((fieldName, value) => {
                    const updatedSubImages = [
                      ...formData.aboutSection.subImages,
                    ];
                    updatedSubImages[index] = value;
                    setFormData({
                      ...formData,
                      aboutSection: {
                        ...formData.aboutSection,
                        subImages: updatedSubImages,
                      },
                    });
                  });
                }
              }}
            />
          </>
        ) : (
          <div className="d-flex align-items-center gap-3">
            <img
              src={filePreview}
              alt="Document Preview"
              style={{
                width: "200px",
                height: "100px",
                objectFit: "contain",
                border: "1px solid #ddd",
                padding: "5px",
              }}
            />
            <button
              className="btn bg-danger py-3 px-1"
              onClick={() => {
                setFieldValue(fieldName, null);

                setFilePreview("");
              }}
            >
              <i className="fa-solid fa-trash fa-lg text-white p-2"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
