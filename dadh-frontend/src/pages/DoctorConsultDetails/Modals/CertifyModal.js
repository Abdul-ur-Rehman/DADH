import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
// import { logo } from "../../../assets/images/users/logo.png"
import logo from "../../../assets/images/users/logo.png";


const CertifyModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    certificationType: "",
    startDate: "",
    endDate: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [doctorData, setDoctorData] = useState({
    name: "",
    providerNumber: "",
    qualification: "",
    signature: "",
  });
  const [patient, setPatient] = useState({
    name: "",
    DOB: "",
  });

  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;
  const consultationId = localStorage.getItem("consultationId");
  const DocId = localStorage.getItem("sendBirdUserId");
  const patientId = localStorage.getItem("patientId");
  const [isLoading, setLoading] = useState(true);
  const api = `http://localhost:5001/api/doctor-requests/`;

  // Fetch doctor data
  const fetchDoctorData = async () => {
    try {
      const response = await fetch(`${api}getOneById/${DocId}`);
      if (response.ok) {
        const res_data = await response.json();
        setDoctorData({
          ...res_data.data,
          preferences: res_data.data.preferences || [],
        });

        // If signature exists, load it into the canvas:
        if (res_data.data.signature && signatureRef.current) {
          const img = new Image();
          img.src = `data:image/png;base64,${res_data.data.signature}`;
          img.onload = () => {
            signatureRef.current.clear();
            signatureRef.current.getCanvas().getContext("2d").drawImage(img, 0, 0);
          };
        }
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);


  useEffect(() => {
    if (!patientId) return;

    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patient/auth/getOneById/${patientId}`);
        const data = await res.json();
        if (data?.data) {
          setPatient({
            name: data.data.name || "N/A",
            DOB: data.data.DOB || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setPatient({ name: "N/A", DOB: "" });
      }
    };

    fetchPatient();
  }, [patientId]);

  // Helper to convert image URL to base64 (for logo)
  const loadImageAsBase64 = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
    });
  };

  const handleIssue = async () => {
    if (
      !formData.certificationType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.note
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/certification/add`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, consultationId }),
        }
      );

      if (!response.ok) throw new Error("Network error");

      const doc = new jsPDF();
      const today = new Date().toISOString().split("T")[0];
      const logoBase64 = await loadImageAsBase64(logo);

      // Header
      doc.addImage(logoBase64, "PNG", 20, 5, 40, 16); // x: 160 moves it right, y: 5 for top

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("DADH", 200, 10, { align: "right" });
      doc.text("Fax: (07) 3835 1012", 200, 16, { align: "right" });
      doc.text("DHB-5AN", 200, 22, { align: "right" });
      doc.text(today, 200, 30, { align: "right" });

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(formData.certificationType, 105, 50, { align: "center" });

      // Patient Info
      const formattedDOB = patient.DOB
        ? new Date(patient.DOB).toLocaleDateString("en-AU")
        : "N/A";

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Re:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`${patient.name}, ${formattedDOB}`, 30, 70);

      // Note
      doc.setFontSize(12);
      doc.text(formData.note, 20, 78, { maxWidth: 170 });

      // Doctor Signature - check if signature is base64 without prefix
      if (doctorData.signature) {
        let signatureBase64 = doctorData.signature;
        if (doctorData.signature.startsWith("data:image")) {
          // Remove prefix if present
          signatureBase64 = doctorData.signature.split(",")[1];
        }
        doc.addImage(
          `data:image/png;base64,${signatureBase64}`,
          "PNG",
          20,
          100,
          40,
          20
        );
      }

      doc.setFontSize(12);
      doc.text(`Dr ${doctorData.name}`, 20, 130);
      doc.text(`Qualification: ${doctorData.qualification}`, 20, 137);
      doc.text(`Provider No: ${doctorData.providerNumber}`, 20, 144);

      doc.save("Medical_Certificate.pdf");

      // Send SMS (Update +92 with real number if needed)
      // await fetch(`http://localhost:5001/notification/sms`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     to: "+923460329743", // Replace with actual number
      //     body: `📄 Certificate Issued by Dr. ${doctorData.name}\nType: ${formData.certificationType}\nDuration: ${formData.startDate} to ${formData.endDate}`,
      //   }),
      // });

      handleClear();
    } catch (err) {
      console.error(err);
      setError("Failed to issue certificate. Please try again.");
    }
  };

  const handleClear = () => {
    setFormData({
      certificationType: "",
      startDate: "",
      endDate: "",
      note: "",
    });
    setError("");
    handleClose();
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        const { startDate, endDate } = updatedForm;
        if (startDate && endDate) {
          updatedForm.note = `Certification is valid from ${startDate} to ${endDate}.`;
        }
      }
      return updatedForm;
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Certify</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Certificate Type</Form.Label>
            <Form.Select
              value={formData.certificationType}
              onChange={handleInput}
              name="certificationType"
            >
              <option value="">Select Type</option>
              <option>Medical Certificate - School</option>
              <option>Medical Certificate - Work</option>
              <option>Medical Certificate - University</option>
              <option>Medical Certificate - Unfit</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start & End Date</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInput}
              />
              <Form.Control
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInput}
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Note</Form.Label>
            <Form.Control
              name="note"
              as="textarea"
              rows={3}
              value={formData.note}
              onChange={handleInput}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="primary" onClick={handleIssue}>
          Issue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CertifyModal;
