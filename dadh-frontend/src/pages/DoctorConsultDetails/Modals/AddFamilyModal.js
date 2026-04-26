import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";

const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

const categories = [
  { value: "Medical Certificate Only", label: "Medical Certificate Only" },
  { value: "Urgent Repeat Scripts Only", label: "Urgent Repeat Scripts Only" },
  { value: "Respiratory Related", label: "Respiratory Related" },
  { value: "Skin Related", label: "Skin Related" },
  { value: "Gut Related", label: "Gut Related" },
  { value: "Mental Health / Sleep / Headache", label: "Mental Health / Sleep / Headache" },
  { value: "Musculoskeletal", label: "Musculoskeletal" },
  { value: "Women's Health", label: "Women's Health" },
  { value: "Men's Health", label: "Men's Health" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "disclosed", label: "Disclosed" },
];

const typeOptions = [
  { value: "videoCall", label: "Video Call" },
  { value: "textChat", label: "Text Chat" },
  { value: "phoneCall", label: "Phone Call" },
];

const AddFamilyModal = ({ show, handleClose, patientData }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [familyMembers, setFamilyMembers] = useState([]);
  const patientId = location.state?.patientId;
  const [patient, setPatient] = useState({
    ...patientData,
  });
  const [familyMemberData, setFamilyMemberData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    DOB: "",
    // IRN: "",
    medicareNumber: "",
    address: "",
    zipCode: "",
    gender: ""
  });
  const storedData = JSON.parse(localStorage.getItem("data") || "{}");
  const consultationId = localStorage.getItem("consultationId");
  useEffect(() => {
    if (patientData) {
      setPatient({
        medicareNumber: patientData.medicareNumber || "",
      });
    }
  }, [patientData]);

  useEffect(() => {
    if (patientId && !patientData) {
      const fetchPatientById = async () => {
        try {
          const res = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/${patientId}`);
          if (res.ok) {
            const { data } = await res.json();

            setPatient(data); // Save whole patient data
            setFamilyMemberData(prev => ({
              ...prev,
              phone: data.phone || "",
              city: data.city || "",
              state: data.state || "",
              // IRN: (Number(data.IRN) + 1).toString() || "1",
              medicareNumber: (Number(patientData.medicareNumber) + 1).toString() || "1",
              address: data.address || "",
              zipCode: data.zipCode || "",
            }));
          } else {
            console.error("Failed to fetch patient data.");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      };

      fetchPatientById();
    }
  }, [patientId, patientData]);


  useEffect(() => {
    if (patientId) fetchPatientData();
  }, [patientId]);

  const getOneConsultationData = async () => {
    try {
      const res = await fetch(`${REACT_APP_BACKEND_URL}/consultations/getOneById/${consultationId}`);
      if (res.ok) {
        const data = await res.json();
        setPatientId(data.data.patientId);
      }
    } catch (err) {
      console.error("Error fetching consultation data", err);
    }
  };

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        const patient = data.data;
        setFamilyMemberData(prev => ({
          ...prev,
          phone: patient.phone || "",
          city: patient.city || "",
          state: patient.state || "",
          // IRN: String(patient.IRN || 0) + 1,
          medicareNumber: String(patient.medicareNumber || 0) + 1,
          address: patient.address || "",
          zipCode: patient.zipCode || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching patient data", err);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFamilyMemberData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFamilyMemberData(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };


  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      name: familyMemberData.name,
      email: familyMemberData.email,
      phone: familyMemberData.phone,
      city: familyMemberData.city,
      state: familyMemberData.state,
      DOB: familyMemberData.DOB,
      // IRN: familyMemberData.IRN,
      medicareNumber: familyMemberData.medicareNumber,
      address: familyMemberData.address,
      zipCode: familyMemberData.zipCode,
      gender: familyMemberData.gender,
    };

    try {
      const res = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();

        // ✅ Add directly to table
        setFamilyMembers(prev => [...prev, data.data]);

        // ✅ Reset form
        setFamilyMemberData({
          name: "",
          email: "",
          phone: "",
          city: "",
          state: "",
          DOB: "",
          // IRN: "",
          medicareNumber: "",
          address: "",
          zipCode: "",
          gender: ""
        });

        // ✅ Send SMS notification
        // await fetch(`http://localhost:5001/notification/sms`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     to: payload.phone, // 📲 Family member's phone number
        //     body: `👨‍👩‍👧‍👦 New Family Member Added:\nName: ${payload.name}\nDOB: ${payload.DOB}\nMedicare #: ${payload.medicareNumber}`,
        //   }),
        // });

      } else {
        const errorData = await res.json();
        console.error("Registration failed:", errorData);
      }
    } catch (err) {
      console.error("Error registering family member:", err);
    }
  }


  const addConsultationForMember = async id => {
    try {
      const payload = {
        patientId: id,
        doctorId: storedData?.data?._id,
        consultationCategory: familyMemberData.consultationCategory,
        notes: familyMemberData.notes?.trim() || "No notes provided",
        type: familyMemberData.type,
      };

      console.log("Sending consultation payload:", payload);

      const res = await fetch(`${REACT_APP_BACKEND_URL}/consultations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("Consultation added.");
        handleClose();
        setIsCategoryModalOpen(false);
      } else {
        const err = await res.json();
        console.error("Consultation failed:", err);
      }
    } catch (err) {
      console.error("Error adding consultation", err);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Telehealth Consultation</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>No categories found</p>
          <Button variant="primary" onClick={() => setIsCategoryModalOpen(true)}>
            + Add Family Members
          </Button>
        </Modal.Body>
      </Modal>

      {/* Add Family Member Modal */}
      <Modal show={isCategoryModalOpen} onHide={() => setIsCategoryModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">New Telehealth Consultation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={familyMemberData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="email"
                    value={familyMemberData.email}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Consultation Category</Form.Label>
                  <Select
                    name="consultationCategory"
                    options={categories}
                    value={categories.find(opt => opt.value === familyMemberData.consultationCategory)}
                    onChange={handleSelectChange}
                    placeholder="Select Category"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>medicareNumber</Form.Label>
                  <Form.Control
                    type="number"
                    name="medicareNumber"
                    value={patient?.medicareNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="number"
                    name="phone"
                    value={familyMemberData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={familyMemberData.city}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="DOB"
                    value={familyMemberData.DOB}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              {/* <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>IRN</Form.Label>
                  <Form.Control
                    type="number"
                    name="IRN"
                    value={familyMemberData.IRN}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col> */}
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={familyMemberData.address}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={familyMemberData.state}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zip Code</Form.Label>
                  <Form.Control
                    type="number"
                    name="zipCode"
                    value={familyMemberData.zipCode}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Select
                    name="gender"
                    options={genderOptions}
                    value={genderOptions.find(opt => opt.value === familyMemberData.gender)}
                    onChange={handleSelectChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Consultation Type</Form.Label>
                  <Select
                    name="type"
                    options={typeOptions}
                    value={typeOptions.find(opt => opt.value === familyMemberData.type)}
                    onChange={handleSelectChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center">
              <Button type="submit" variant="success">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddFamilyModal;