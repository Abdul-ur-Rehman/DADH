import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";

const InvestigateModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    investigationType: "",
    investigation: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;
  const consultationId = localStorage.getItem("consultationId");
  const doctorName = localStorage.getItem("doctorName") || "Doctor";

  const validateForm = () => {
    let newErrors = {};

    if (!formData.investigationType)
      newErrors.investigationType = "Investigation Type is required.";
    if (!formData.investigation.trim())
      newErrors.investigation = "Investigation details are required.";
    if (!formData.note.trim()) newErrors.note = "Note is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    const response = await fetch(
      `${REACT_APP_BACKEND_URL}/consultations/investigation/add`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, consultationId }),
      }
    );

    if (!response.ok) throw new Error("Failed to order investigation");

    // ✅ Send SMS with investigation details
    await fetch(`http://localhost:5001/notification/sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "+923460329743", // ✅ E.164 format
        body: `🧪 Investigation Ordered by ${doctorName}:\n\nType: ${formData.investigationType}\nInvestigation: ${formData.investigation}\nNote: ${formData.note}`,
      }),
    });

    handleClose();
    handleClear();
  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    setLoading(false);
  }
};


  const handleClear = () => {
    setInvestigationType("");
    setInvestigation("");
    setNote("");
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("formData", formData);
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Investigation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Investigation Type</Form.Label>
            <Form.Select
              value={formData.investigationType}
              name="investigationType"
              onChange={handleInputChange}
              isInvalid={!!errors.investigationType}
            >
              <option value="">Select...</option>
              <option value="Radiology">Radiology</option>
              <option value="Pathology">Pathology</option>
            </Form.Select>
            {errors.investigationType && (
              <Form.Control.Feedback type="invalid">
                {errors.investigationType}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="note"
                  placeholder="Enter note details"
                  value={formData.note}
                  onChange={handleInputChange}
                  isInvalid={!!errors.note}
                />
                {errors.note && (
                  <Form.Control.Feedback type="invalid">
                    {errors.note}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Investigation</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="investigation"
                  placeholder="Enter investigation details"
                  value={formData.investigation}
                  onChange={handleInputChange}
                  isInvalid={!!errors.investigation}
                />
                {errors.investigation && (
                  <Form.Control.Feedback type="invalid">
                    {errors.investigation}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Form>

        {Object.keys(errors).length > 0 && (
          <Alert variant="danger">Please fix the errors before ordering.</Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleOrder} disabled={loading}>
          {loading ? "Ordering..." : "Order"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvestigateModal;
