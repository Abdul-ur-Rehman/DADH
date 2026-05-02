
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import PatientDetailForm from "../Modals/PatientDetailForm";
import ReferModal from "../Modals/ReferModal";
import CertifyConsultModal from "../Modals/CertifyConsultModal";
import BillingConsultModal from "../Modals/BillingConsultModal";
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
  //   const doctorCallUrl = `${window.location.origin}/doctor/start-consult/${consultationId}/details/video`;
  //   const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  //   window.open(doctorCallUrl, "DoctorVideoCallWindow", windowFeatures);
  // };

  // const handleStartAudioCall = () => {
  //   const consultationId = getConsultationId();
  //   if (!consultationId) {
  //     alert("Consultation ID not found. Cannot start audio call.");
  //     return;
  //   }
  //   const doctorCallUrl = `${window.location.origin}/doctor/start-consult/${consultationId}/details/audio`;
  //   const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  //   window.open(doctorCallUrl, "AudioCallWindow", windowFeatures);
  // };

const handleStartVideoCall = () => {
  const consultationId = getConsultationId();
  if (!consultationId) {
    alert("Consultation ID not found. Cannot start video call.");
    return;
  }

  const doctorCallUrl = `${window.location.origin}/doctor/start-consult/${consultationId}/details/video`;
  const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  window.open(doctorCallUrl, "DoctorVideoCallWindow", windowFeatures);
};

const handleStartAudioCall = () => {
  const consultationId = getConsultationId();
  if (!consultationId) {
    alert("Consultation ID not found. Cannot start audio call.");
    return;
  }

  const doctorCallUrl = `${window.location.origin}/doctor/start-consult/${consultationId}/details/audio`;
  const windowFeatures = `width=${window.innerWidth * 0.8},height=${window.innerHeight * 0.8},left=${window.innerWidth * 0.1},top=${window.innerHeight * 0.1},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
  window.open(doctorCallUrl, "AudioCallWindow", windowFeatures);
};



  const pauseConsultation = async () => {
    const storedData = JSON.parse(localStorage.getItem("data"));
    const activeConsultationId = storedData?.data?.activeConsultationId;
    const patientId = patient?._id;

    if (!activeConsultationId) { alert("Missing consultation ID — cannot stop."); return; }
    if (!doctorId) { alert("Missing doctor ID — cannot stop."); return; }
    if (!patientId) { alert("Missing patient ID — cannot stop."); return; }

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
        localStorage.removeItem("patientId");
        localStorage.removeItem("consultPatientData");
        setIsConsultationCompleted(true);
      } else {
        alert("Could not stop consultation: " + (result.message || "Unknown error"));
        console.error("Consultation not ended properly", result.message);
      }
    } catch (err) {
      alert("Network error while stopping consultation: " + err.message);
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

        {isConsultationCompleted && (
          <div className="alert alert-success py-2 mb-2 text-center" style={{ fontSize: 13 }}>
            Consultation stopped. Please certify and/or bill before leaving.
          </div>
        )}

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
          {isConsultationCompleted && (
            <button
              className="btn btn-secondary btn-sm d-flex align-items-center"
              onClick={() => navigate("/doctor")}
            >
              <i className="fas fa-home me-1"></i>
              <span>Go to Dashboard</span>
            </button>
          )}
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
      {showCertifyModal && <CertifyConsultModal consultationId={getConsultationId()} patient={patient} onClose={() => setShowCertifyModal(false)} />}
      {showBillingModal && <BillingConsultModal consultationId={getConsultationId()} onClose={() => setShowBillingModal(false)} />}
      <InvestigateModal show={showInvestigateModal} handleClose={() => setShowInvestigateModal(false)} />
    </>
  );
};

export default TopCard;
