import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
// import "./PatientConsultHistory.css";
import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";

const PatientConsultHistory = () => {
  const [consultations, setConsultations] = useState([]);
  // const [consultationsToday, setConsultationsToday] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const togglePatient = (index) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";
  const patient = JSON.parse(localStorage.getItem("patientData"))?.data;
  const patientId = patient?._id;

  useEffect(() => {
    getConsultation();
    const interval = setInterval(() => {
      getConsultation();
    }, 30000);
    return () => clearInterval(interval);
  }, []);


  const getConsultation = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/getConsulationByPatient/${patientId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (response.ok) {
        const updatedConsultations = await Promise.all(
          result.data.map(async (consultation) => {
            const categoryName = await getConsultationCategoryName(
              consultation.consultationCategory
            );

            const updatedConsultation = {
              ...consultation,
              patientName: patient.name,
              patientAge: calculateAge(patient.DOB),
              patientGender: patient.gender,
              notes: consultation.notes,
              timeAgo: getTimeAgo(consultation.createdAt),
              type: consultation.type,
              consultationCategoryName: categoryName,
              date: consultation.createdAt,
            };



            // 👇 Save to localStorage if isCompleted is false
            if (!consultation.isCompleted) {
              localStorage.setItem("incompleteConsultation", JSON.stringify(updatedConsultation.isCompleted));
            }

            return updatedConsultation;
          })
        );

        setConsultations(updatedConsultations);
      } else {
        console.log("Error:", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const getConsultationCategoryName = async (categoryKey) => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/getOneByKey`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: categoryKey }),
        }
      );
      const result = await response.json();
      return response.ok ? result.data.category : categoryKey;
    } catch (error) {
      console.error("Error:", error);
      return categoryKey;
    }
  };

  const calculateAge = (DOB) => {
    if (!DOB) return "N/A";
    const birthDate = new Date(DOB);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getTimeAgo = (date) => {
    const diffMs = Math.abs(new Date() - new Date(date));
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffSeconds < 60) return `${diffSeconds} sec ago`;
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hrs ago`;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };



  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "videoCall":
        return <VideoIcon size={24} />;
      case "phoneCall":
        return <PhoneCallIcon size={24} />;
      case "textChat":
        return <MessageSquareIcon size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="consult-history-container">
      <Row className="content-section">
        <Col lg={8}>
          <div className="patient-list">
            {consultations.length ? (
              consultations.map((consultation, index) => (
                <div key={index} className="patient-toggle-card">
                  <div
                    className="toggle-header"
                    onClick={() => togglePatient(index)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "10px 15px",
                      borderRadius: "5px",
                      marginBottom: "5px",
                      borderRadius: "5px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                      <div>
                        {getIcon(consultation?.type)}{" "}
                        <strong>{consultation?.patientName}</strong> - {consultation?.consultationCategoryName}
                      </div>
                      <span style={{ fontSize: "15px" }}>{expandedIndex === index ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedIndex === index && (
                    <div
                      className="toggle-body"
                      style={{
                        backgroundColor: "#fafafa",
                        padding: "10px 15px",
                        border: "1px solid #ddd",
                        borderTop: "none",
                        marginBottom: "10px",
                        borderRadius: "0 0 5px 5px"
                      }}
                    >
                      <p>
                        <strong>Age / Gender:</strong> {consultation?.patientAge}, {consultation?.patientGender}
                      </p>
                      <p>
                        <strong>Date:</strong> {formatDate(consultation.date)}
                      </p>
                      <p>
                        <strong>Notes:</strong> {consultation.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center">No consultations found.</div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default PatientConsultHistory;
