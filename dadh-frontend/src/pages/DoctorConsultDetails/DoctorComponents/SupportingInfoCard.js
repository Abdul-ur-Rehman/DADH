import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import "./SupportingInfoCard.css";

const SupportingInfoCard = () => {
  const { id: consultationIdParam } = useParams();
  const storeData = JSON.parse(localStorage.getItem("data"));
  const doctorId = storeData?.data?._id || "";
  const doctorName = storeData?.data?.name || "";

  const [medicationData, setMedicationData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    mode: "add",
    index: null,
    data: {
      medicineName: "",
      dosage: "",
      condition: "",
    },
  });

  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

  const getTimeAgo = (dateString) => {
    const inputDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - inputDate;
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value,
      },
    }));
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const consultationId = consultationIdParam;
      if (!consultationId) throw new Error("No consultation ID found");

      const consultationRes = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/getOneById/${consultationId}`
      );
      const consultationData = await consultationRes.json();

      const data = consultationData.data;
      setNotes(data?.notes || "No notes available.");
      setPatientId(data?.patientId || "");
      setMedicationData(data?.medications || []);
      setConditionData(data?.conditions || []);
    } catch (err) {
      console.error("Error in data fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [consultationIdParam]);

  const openAddModal = (type) => {
    setModalState({
      isOpen: true,
      type,
      mode: "add",
      index: null,
      data: { medicineName: "", dosage: "", condition: "" },
    });
  };

  const openEditModal = (type, index, creatorId) => {
    if (creatorId !== doctorId) {
      alert("You are not authorized to edit this record.");
      return;
    }

    const item =
      type === "medication" ? medicationData[index] : conditionData[index];

    setModalState({
      isOpen: true,
      type,
      mode: "edit",
      index,
      data: {
        medicineName: item?.medicineName || "",
        dosage: item?.dosage || "",
        condition: item?.condition || item?.conditionName || "",
      },
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const saveMedication = async () => {
    const endpoint =
      modalState.mode === "add"
        ? `${REACT_APP_BACKEND_URL}/consultations/medication/add`
        : `${REACT_APP_BACKEND_URL}/consultations/medication/update/${modalState.index}`;

    try {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...modalState.data,
          doctorId,
          consultationId: consultationIdParam,
          doctorName,
        }),
      });
      await fetchPatientData();
      closeModal();
    } catch (error) {
      console.error("Error saving medication:", error);
    }
  };

  const saveCondition = async () => {
    const endpoint =
      modalState.mode === "add"
        ? `${REACT_APP_BACKEND_URL}/consultations/condition/add`
        : `${REACT_APP_BACKEND_URL}/consultations/condition/update/${modalState.index}`;

    try {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition: modalState.data.condition,
          doctorId,
          consultationId: consultationIdParam,
          doctorName,
          patientId,
        }),
      });
      await fetchPatientData();
      closeModal();
    } catch (error) {
      console.error("Error saving condition:", error);
    }
  };

  const deleteMedication = async (index) => {
    try {
      await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/medication/delete/${index}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultationId: consultationIdParam }),
        }
      );
      await fetchPatientData();
    } catch (err) {
      console.error("Error deleting medication:", err);
    }
  };

  const deleteCondition = async (index) => {
    try {
      await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/condition/delete/${index}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultationId: consultationIdParam }),
        }
      );
      await fetchPatientData();
    } catch (err) {
      console.error("Error deleting condition:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    modalState.type === "medication" ? saveMedication() : saveCondition();
  };

  return (
    <div className="supporting-info-card">
      <h5 className="mb-3 text-left text-lg font-semibold">
        Supporting Information
      </h5>

      {notes && (
        <div className="alert alert-info mb-3">
          <strong>Patient Notes:</strong> {notes}
        </div>
      )}

      {/* Medications */}
      <div className="section-header mt-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <h6 className="mb-0">Medications</h6>
          <span className="badge bg-secondary ms-2 text-black">
            {medicationData.length}
          </span>
        </div>
        <div
          className="d-flex align-items-center gap-2 text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => openAddModal("medication")}
        >
          <FaPlusCircle />
          <span>Add New</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-3">Loading medications...</div>
      ) : medicationData.length > 0 ? (
        medicationData.map((med, index) => (
          <div
            key={med._id || index}
            className="mb-1 d-flex justify-content-between align-items-center small border rounded p-1"
            onClick={() => openEditModal("medication", index, med.doctorId)}
          >
            <div className="d-flex flex-column flex-sm-row gap-1">
              <span className="fw-semibold rounded px-2">
                {med.medicineName}
              </span>
              <span className="text-muted rounded px-2">{med.dosage}</span>
            </div>
            <div className="text-end">
              <div className="text-muted rounded px-2">{med.doctorName}</div>
              {med.time && (
                <div className="text-muted small">{getTimeAgo(med.time)}</div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-muted small py-2">No medications added</div>
      )}

      {/* Conditions */}
      <div className="section-header mt-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <h6 className="mb-0">Conditions</h6>
          <span className="badge bg-secondary ms-2 text-black">
            {conditionData.length}
          </span>
        </div>
        <div
          className="d-flex align-items-center gap-2 text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => openAddModal("condition")}
        >
          <FaPlusCircle />
          <span>Add New</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-3">Loading conditions...</div>
      ) : conditionData.length > 0 ? (
        conditionData.map((cond, index) => (
          <div
            key={cond._id || index}
            className="mb-1 d-flex justify-content-between align-items-center small border rounded p-1"
            onClick={() => openEditModal("condition", index, cond.doctorId)}
          >
            <div className="d-flex flex-column flex-sm-row gap-1">
              <span className="fw-semibold rounded px-2">
                {cond.condition || cond.conditionName}
              </span>
            </div>
            <div className="text-end">
              <div className="text-muted rounded px-2">{cond.doctorName}</div>
              {cond.time && (
                <div className="text-muted small">{getTimeAgo(cond.time)}</div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-muted small py-2">No conditions added</div>
      )}

      {/* Modal */}
      <Modal isOpen={modalState.isOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>
          {modalState.mode === "add" ? "Add" : "Edit"} {modalState.type}
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                {modalState.type === "medication"
                  ? "Medication Name"
                  : "Condition Name"}
              </label>
              <input
                type="text"
                className="form-control"
                name={
                  modalState.type === "medication"
                    ? "medicineName"
                    : "condition"
                }
                value={
                  modalState.type === "medication"
                    ? modalState.data.medicineName
                    : modalState.data.condition
                }
                onChange={handleInputChange}
                required
              />
            </div>

            {modalState.type === "medication" && (
              <div className="form-group mt-3">
                <label>Dosage</label>
                <input
                  type="text"
                  className="form-control"
                  name="dosage"
                  value={modalState.data.dosage}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="modal-footer d-flex justify-content-between mt-3">
              <Button
                color="danger"
                outline
                onClick={() => {
                  modalState.type === "medication"
                    ? deleteMedication(modalState.index)
                    : deleteCondition(modalState.index);
                  closeModal();
                }}
              >
                Delete Record
              </Button>
              <Button color="primary" type="submit">
                {modalState.mode === "add" ? "Add" : "Update"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default SupportingInfoCard;