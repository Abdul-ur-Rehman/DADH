
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import PatientDetailForm from "../Modals/PatientDetailForm";
import ReferModal from "../Modals/ReferModal";
import CertifyModal from "../Modals/CertifyModal";
import BillingModal from "../Modals/BillingModal";
import InvestigateModal from "../Modals/InvestigateModal";
import AddFamilyModal from "../Modals/AddFamilyModal";
import { Divider } from "@mui/material";

const TopCard = ({ data }) => {
  const [showPatientDetailForm, setShowPatientDetailForm] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showInvestigateModal, setShowInvestigateModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);

  const [patient, setPatient] = useState(data);
  const [loading, setLoading] = useState(true);
  const [isConsultationCompleted, setIsConsultationCompleted] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const consultationId = id;
  const doctorId = localStorage.getItem("sendBirdUserId");
  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

  const getConsultationId = () => {
    try {
      const storedData = JSON.parse(localStorage.getItem("data"));
      return storedData?.data?.activeConsultationId || null;
    } catch {
      return null;
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPatient(data);
  }, [data]);

  useEffect(() => {
    fetchPatientData();
  }, []);

  // const handleStartVideoCall = () => {
  //   const consultationId = getConsultationId();
  //   if (!consultationId) {
  //     alert("Consultation ID not found. Cannot start video call.");
  //     return;
  //   }
  //   const doctorCallUrl = `${window.location.origin}/doctor/startConsult/${consultationId}/details/video`;
  //   const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  //   window.open(doctorCallUrl, "DoctorVideoCallWindow", windowFeatures);
  // };

  // const handleStartAudioCall = () => {
  //   const consultationId = getConsultationId();
  //   if (!consultationId) {
  //     alert("Consultation ID not found. Cannot start audio call.");
  //     return;
  //   }
  //   const doctorCallUrl = `${window.location.origin}/doctor/startConsult/${consultationId}/details/Audio`;
  //   const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  //   window.open(doctorCallUrl, "AudioCallWindow", windowFeatures);
  // };

const handleStartVideoCall = () => {
  const consultationId = getConsultationId();
  if (!consultationId) {
    alert("Consultation ID not found. Cannot start video call.");
    return;
  }

  const doctorCallUrl = `${window.location.origin}/doctor/startConsult/${consultationId}/details/video`;
  const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  window.open(doctorCallUrl, "DoctorVideoCallWindow", windowFeatures);
};

const handleStartAudioCall = () => {
  const consultationId = getConsultationId();
  if (!consultationId) {
    alert("Consultation ID not found. Cannot start audio call.");
    return;
  }

  const doctorCallUrl = `${window.location.origin}/doctor/startConsult/${consultationId}/details/Audio`;
  const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  window.open(doctorCallUrl, "AudioCallWindow", windowFeatures);
};



  const pauseConsultation = async () => {
    const storedData = JSON.parse(localStorage.getItem("data"));
    const activeConsultationId = storedData?.data?.activeConsultationId;
    const patientId = patient?._id;

    if (!activeConsultationId || !doctorId || !patientId) return;

    try {
      const res = await fetch(
        `${REACT_APP_BACKEND_URL}/billing/end/consultation/${activeConsultationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctor_id: doctorId, patientId: patientId }),
        }
      );
      const result = await res.json();

      if (result.state) {
        // Optional: fetch updated consultations
        localStorage.removeItem("patientId");
        localStorage.removeItem("patientData");
        setIsConsultationCompleted(true); // ✅ show certify + bill buttons
      } else {
        console.error("Consultation not ended properly", result.message);
      }
    } catch (err) {
      console.error("Error ending consultation:", err);
    }
  };

  const requeuePatient = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/requeuePatient`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationId: consultationId,
            doctorId: doctorId,
            patientId: patient._id,
            requeue: true,
          }),
        }
      );

      if (response.ok) {
        navigate("/doctor");
      } else {
        const errorData = await response.json();
        alert("Error requeuing patient: " + errorData.message);
      }
    } catch (err) {
      console.log("Error requeuing patient:", err);
    }
  };

  const calculateAge = (DOB) => {
    if (!DOB) return "N/A";
    const birthDate = new Date(DOB);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // const baseButtons = [
  //   { label: "Refer", icon: "fa-file-alt", action: () => setShowReferModal(true) },
  //   { label: "Add Family", icon: "fa-plus-circle", action: () => setShowAddFamilyModal(true) },
  //   { label: "Requeue", icon: "fa-undo", action: requeuePatient },
  //   { label: "Stop", icon: "fa-stop-circle", action: pauseConsultation, danger: true },
  // ];


  const baseButtons = [
    { label: "Refer", icon: "fa-file-alt", action: () => setShowReferModal(true) },
    { label: "Add Family", icon: "fa-plus-circle", action: () => setShowAddFamilyModal(true) },
    { label: "Requeue", icon: "fa-undo", action: requeuePatient },
    ...(!isConsultationCompleted
      ? [{ label: "Stop", icon: "fa-stop-circle", action: pauseConsultation, danger: true }]
      : []),
  ];


  const postStopButtons = isConsultationCompleted
    ? [
      { label: "Certify", icon: "fa-check-circle", action: () => setShowCertifyModal(true) },
      { label: "Bill", icon: "fa-dollar-sign", action: () => setShowBillingModal(true) },
    ]
    : [];

  const allButtons = [...baseButtons, ...postStopButtons];

  if (loading) return <p>Loading patient data...</p>;

  return (
    <>
      <Card
        style={{
          marginTop: 10,
          marginLeft: 50,
          padding: 15,
          borderRadius: 10,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "100%",
        }}
      >
        <div className="mb-2">
          {patient ? (
            <div className="d-flex flex-wrap gap-3">
              <p>
                <span
                  style={{ cursor: "pointer", color: "black", textDecoration: "underline" }}
                  onClick={() => setShowPatientDetailForm(true)}
                >
                  {patient?.name} {patient?.surname}
                </span>
              </p>
              <div className="d-flex flex-wrap gap-2" style={{ cursor: "pointer" }}>
                <p>{calculateAge(patient?.DOB)},</p>
                <p>{patient?.gender},</p>
                <p>{patient?.phone}</p>
                <p style={{ wordBreak: "break-word" }}>{patient?.address}</p>
              </div>
            </div>
          ) : (
            <p>Patient data not found.</p>
          )}
        </div>

        <Divider style={{ margin: "10px 0" }} />

        <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
          {allButtons.map((button, index) => (
            <button
              key={index}
              className={`btn btn-${button.danger ? "danger" : "primary"} d-flex align-items-center btn-sm`}
              onClick={button.action}
            >
              <i className={`fas ${button.icon} me-1`}></i>
              <span>{button.label}</span>
            </button>
          ))}
        </div>

        <div className="d-flex justify-content-center gap-3 mb-3">
          <button className="btn btn-outline-success btn-sm" onClick={handleStartAudioCall}>
            <i className="fas fa-phone me-1"></i> Audio Call
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={handleStartVideoCall}>
            <i className="fas fa-video me-1"></i> Video Call
          </button>
        </div>
      </Card>

      {/* Modals */}
      <PatientDetailForm open={showPatientDetailForm} patientData={patient} handleClose={() => setShowPatientDetailForm(false)} />
      <ReferModal show={showReferModal} handleClose={() => setShowReferModal(false)} />
      <AddFamilyModal show={showAddFamilyModal} handleClose={() => setShowAddFamilyModal(false)} />
      <CertifyModal show={showCertifyModal} handleClose={() => setShowCertifyModal(false)} />
      <BillingModal show={showBillingModal} handleClose={() => setShowBillingModal(false)} />
      <InvestigateModal show={showInvestigateModal} handleClose={() => setShowInvestigateModal(false)} />
    </>
  );
};

export default TopCard;
