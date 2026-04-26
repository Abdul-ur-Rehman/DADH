import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import TopCard from "./DoctorComponents/TopCard";
import SupportingInfoCard from "./DoctorComponents/SupportingInfoCard";
import PatientNotesCard from "./DoctorComponents/PatientNotesCard";
import IndividualChatComponent from "pages/IndividualChat/IndividualChatComponent";
import DoctorLoading from "common/DoctorLoading";

const DoctorComponents = () => {
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const consultationId = id;


  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;
  const doctorId = localStorage.getItem("sendBirdUserId");
  const docName = localStorage.getItem("sendBirdUserName");

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const storedData = JSON.parse(localStorage.getItem("data"));
      const consultationId = storedData?.data?.activeConsultationId;

      if (!consultationId) throw new Error("No active consultation found");

      const consultationRes = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/getOneById/${consultationId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!consultationRes.ok) throw new Error("Failed to fetch consultation");

      const consultationData = await consultationRes.json();
      const patientId = consultationData.data.patientId;

      if (!patientId) throw new Error("No patient ID found in consultation");

      const patientRes = await fetch(
        `${REACT_APP_BACKEND_URL}/patient/auth/getOneById/${patientId}`
      );

      if (!patientRes.ok) throw new Error("Failed to fetch patient data");

      const patientData = await patientRes.json();
      setPatient(patientData.data);
    } catch (err) {
      console.error("Error in data fetching:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getConsultation = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/getAll`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();
      console.log("all consultations ", result);

      if (response.ok) {
        const today = new Date().toISOString().split("T")[0];
        const patientMap = {};

        await Promise.all(
          result.data.map(async (consultation) => {
            const consultationDate = new Date(consultation.createdAt)
              .toISOString()
              .split("T")[0];

            // Only include today's consultations that are NOT completed
            if (consultationDate !== today || consultation.isCompleted === true) return;
            return;
          })
        );

        const sortedPatients = Object.values(patientMap).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setPatients(sortedPatients);
        console.log("sorted patients ", sortedPatients);
      } else {
        console.log("Error:", result.message);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    fetchPatientData();
    getConsultation();  // Fetch updated consultation data after requeue
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <DoctorLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh" }}>
        <p className="text-danger">{error}</p>
        <Button color="primary" onClick={() => navigate("/doctor")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh" }}>
        <p>No patient data available</p>
        <Button color="primary" onClick={() => navigate("/doctor")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
  <div>
    <Row className="mt-5 p-1">
      {/* Left Section - Cards */}
      <Col xs={12} md={12} lg={7}>
        <Row>
          <TopCard data={patient} />
        </Row>
        <Row className="mt-3">
          <Col xs={12} md={6}>
            <SupportingInfoCard patientId={patient._id} />
          </Col>
          <Col xs={12} md={6}>
            <PatientNotesCard patientId={patient._id} />
          </Col>
        </Row>
      </Col>

      {/* Right Section - Chat */}
      <Col xs={12} md={12} lg={5} className="pt-4 pt-lg-5">
        <IndividualChatComponent
          key={patient._id}
          recipientId={patient._id}
          recipientNickname={`${patient.name} (${patient.username})`}
          userId={doctorId}
          userNickname={docName}
        />
      </Col>

      {console.log("Doctor Side:", {
        userId: doctorId,
        recipientId: patient._id
      })}
    </Row>
  </div>
);

};

export default DoctorComponents;
