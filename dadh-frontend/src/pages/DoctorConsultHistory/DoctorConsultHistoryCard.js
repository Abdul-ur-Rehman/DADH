// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Row, Col } from "reactstrap";
// import { Checkbox } from "@mui/material";
// import "./DoctorConsultHistoryCard.css";
// import CertifyModal from "../DoctorConsultDetails/Modals/CertifyModal";
// import BillingModal from "../DoctorConsultDetails/Modals/BillingModal";
// import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";

// const DoctorConsultHistoryCard = () => {
//   const [patients, setPatients] = useState([]);
//   const [billingIncomplete, setBillingIncomplete] = useState(false);
//   const [showLast7Days, setShowLast7Days] = useState(false);
//   const [consultationsToday, setConsultationsToday] = useState(0);
//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [showBillingModal, setShowBillingModal] = useState(false);
//   const [showCertifyModal, setShowCertifyModal] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState(null);

//   const navigate = useNavigate();
//   const REACT_APP_BACKEND_URL = "http://localhost:5001/api";
//   const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id;

//   const togglePatient = (index) => {
//     setExpandedIndex(prev => (prev === index ? null : index));
//   };

//   useEffect(() => {
//     getConsultation();
//     const interval = setInterval(() => {
//       getConsultation();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [billingIncomplete, showLast7Days]);

//   // const getConsultation = async () => {
//   //   try {
//   //     const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/incompleteBillings/${doctorId}`, {
//   //       method: "GET",
//   //       headers: { "Content-Type": "application/json" },
//   //     });
//   //     const result = await response.json();

//   //     if (response.ok) {
//   //       const updatedPatients = await Promise.all(
//   //         result.data.map(async (consultation) => {
//   //           const patient = await getPatientById(consultation.patientId);
//   //           const categoryName = await getConsultationCategoryName(consultation.consultationCategory);
//   //           return {
//   //             ...consultation,
//   //             patientName: patient.name,
//   //             patientAge: calculateAge(patient.DOB),
//   //             patientGender: patient.gender,
//   //             timeAgo: getTimeAgo(consultation.createdAt),
//   //             consultationCategoryName: categoryName,
//   //             date: consultation.createdAt,
//   //           };
//   //         })
//   //       );
//   //       setPatients(updatedPatients);
//   //       calculateConsultationsToday(updatedPatients);
//   //     } else {
//   //       console.log("Error:", result.message);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error:", error);
//   //   }
//   // };

// const getConsultation = async () => {
//   try {
//     const data = JSON.parse(localStorage.getItem("data") || "{}");
//     const doctorId = data?.userId;
//     const token = data?.token;
//     const clientId = data?.clientId;
//     const locationId = data?.locationId;

//     const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/incompleteBillings/${doctorId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         clientid: clientId,
//         locationid: locationId,
//       },
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       console.error("Error fetching consultations:", result.message);
//       return;
//     }

//     const updatedPatients = await Promise.all(
//       result.data.map(async (consultation) => {
//         if (!consultation?.patientId) {
//           console.warn("⚠️ Skipping consultation with missing patientId:", consultation);
//           return null;
//         }

//         const patient = await getPatientById(consultation.patientId);
//         const categoryName = await getConsultationCategoryName(consultation.consultationCategory);

//         return {
//           ...consultation,
//           patientName: patient?.name || "Unknown",
//           patientAge: calculateAge(patient?.DOB),
//           patientGender: patient?.gender || "N/A",
//           timeAgo: getTimeAgo(consultation.createdAt),
//           consultationCategoryName: categoryName,
//           date: consultation.createdAt,
//         };
//       })
//     );

//     const filtered = updatedPatients.filter(Boolean); // remove null entries
//     setPatients(filtered);
//     calculateConsultationsToday(filtered);
//   } catch (error) {
//     console.error("❌ Error in getConsultation:", error);
//   }
// };



//   const getConsultationCategoryName = async (categoryKey) => {
//     try {
//       const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/getOneByKey`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ key: categoryKey }),
//       });
//       const result = await response.json();
//       return response.ok ? result.data.category : categoryKey;
//     } catch (error) {
//       console.error("Error:", error);
//       return categoryKey;
//     }
//   };

//   // const getPatientById = async (id) => {
//   //   try {
//   //     const response = await fetch(`http://localhost:5001/api/patient/auth/getOneById/${id}`, {
//   //       method: "GET",
//   //       headers: { "Content-Type": "application/json" },
//   //     });
//   //     const result = await response.json();
//   //     return response.ok ? result.data : {};
//   //   } catch (error) {
//   //     console.error("Error:", error);
//   //     return {};
//   //   }
//   // };

// const getPatientById = async (id) => {
//   const data = JSON.parse(localStorage.getItem("data") || "{}");
//   const token = data?.token;
//   const clientId = data?.clientId;
//   const locationId = data?.locationId;

//   try {
//     const response = await fetch(`http://localhost:5001/api/patient/auth/getOneById/${id}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         clientid: clientId,
//         locationid: locationId,
//       },
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       console.error("getPatientById API Error:", result.message || result);
//       return {};
//     }

//     return result.data || {};
//   } catch (error) {
//     console.error("Network or fetch error in getPatientById:", error);
//     return {};
//   }
// };



//   const calculateAge = (DOB) => {
//     if (!DOB) return "N/A";
//     const birthDate = new Date(DOB);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const getTimeAgo = (date) => {
//     const diffMs = Math.abs(new Date() - new Date(date));
//     const diffSeconds = Math.floor(diffMs / 1000);
//     const diffMinutes = Math.floor(diffMs / (1000 * 60));
//     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//     if (diffSeconds < 60) return `${diffSeconds} sec ago`;
//     if (diffMinutes < 60) return `${diffMinutes} min ago`;
//     if (diffHours < 24) return `${diffHours} hrs ago`;
//     const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//     return `${days} days ago`;
//   };

//   const calculateConsultationsToday = (consultations) => {
//     const today = new Date().setHours(0, 0, 0, 0);
//     const consultationsToday = consultations.filter(
//       (consultation) => new Date(consultation.date).setHours(0, 0, 0, 0) === today
//     ).length;
//     setConsultationsToday(consultationsToday);
//   };

//   const filteredPatients = patients.filter((p) => {
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//     const consultationDate = new Date(p.date);

//     const billingFilter = billingIncomplete
//       ? (!p.billCodes || p.billCodes.length === 0)
//       : true;

//     const last7DaysFilter = showLast7Days
//       ? consultationDate >= sevenDaysAgo
//       : true;

//     return billingFilter && last7DaysFilter;
//   });

//   const formatDate = (date) => {
//     const newDate = new Date(date);
//     return newDate.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "numeric",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getIcon = (type) => {
//     switch (type) {
//       case "videoCall": return <VideoIcon size={24} />;
//       case "phoneCall": return <PhoneCallIcon size={24} />;
//       case "textChat": return <MessageSquareIcon size={24} />;
//       default: return null;
//     }
//   };

//   return (
//     <div className="consult-history-container">
//       <Row className="content-section">
//         <Col lg={8}>
//           <h4>Consult History</h4>
//           <div className="consultations-header">
//             <div className="consultations-today">
//               <strong>
//                 Number of Consultations Today (Midnight to Midnight):{" "}
//                 {consultationsToday.toLocaleString()}
//               </strong>
//             </div>
//             <div className="filter-section">
//               <label className="filter-label">
//                 <Checkbox
//                   checked={billingIncomplete}
//                   onChange={(e) => setBillingIncomplete(e.target.checked)}
//                 />
//                 Billing Incomplete Only
//               </label>
//               <label className="filter-label">
//                 <Checkbox
//                   checked={showLast7Days}
//                   onChange={(e) => setShowLast7Days(e.target.checked)}
//                 />
//                 Show Last 7 Days
//               </label>
//             </div>
//           </div>

//           <div className="patient-list">
//             {filteredPatients.length ? (
//               filteredPatients.map((patient, index) => (
//                 <div key={index} className="patient-toggle-card">
//                   <div
//                     className="toggle-header"
//                     onClick={() => togglePatient(index)}
//                     style={{
//                       cursor: "pointer",
//                       backgroundColor: "#007bff",
//                       color: "white",
//                       padding: "10px",
//                       border: "1px solid #ddd",
//                       marginBottom: "10px",
//                       borderRadius: "5px"
//                     }}
//                   >
//                     <div style={{ display: "flex", justifyContent: "space-between" }}>
//                       <div>
//                         {getIcon(patient?.type)}{" "}
//                         <strong>{patient?.patientName}</strong> - {patient?.consultationCategoryName}
//                       </div>
//                       <div>{expandedIndex === index ? "▲" : "▼"}</div>
//                     </div>
//                   </div>

//                   {expandedIndex === index && (
//                     <div
//                       className="toggle-body"
//                       style={{
//                         backgroundColor: "#fafafa",
//                         padding: "10px 15px",
//                         border: "1px solid #ddd",
//                         borderTop: "none",
//                         marginBottom: "10px",
//                         borderRadius: "0 0 5px 5px"
//                       }}
//                     >
//                       <p><strong>Age / Gender:</strong> {patient?.patientAge}, {patient?.patientGender}</p>
//                       <p><strong>Date:</strong> {formatDate(patient.date)}</p>
//                       <p><strong>Notes:</strong> {patient.notes}</p>

//                       {patient.isCompleted && (
//                         <div className="d-flex gap-2 mt-2">
//                           {(!patient.certificates || patient.certificates.length === 0) && (
//                             <button
//                               className="btn btn-success btn-sm"
//                               onClick={() => {
//                                 localStorage.setItem("consultationId", patient._id); // <-- Save ID
//                                 setSelectedPatient(patient);
//                                 setShowCertifyModal(true);
//                               }}
//                             >
//                               <i className="fas fa-check-circle me-1"></i>
//                               Certify
//                             </button>
//                           )}

//                           {(!patient.billCodes || patient.billCodes.length === 0) && (
//                             <button
//                               className="btn btn-primary btn-sm"
//                               onClick={() => {
//                                 localStorage.setItem("consultationId", patient._id); // <-- Save ID
//                                 setSelectedPatient(patient);
//                                 setShowBillingModal(true);
//                               }}
//                             >
//                               <i className="fas fa-dollar-sign me-1"></i>
//                               Bill
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="text-center">No consultations found.</div>
//             )}
//           </div>
//         </Col>
//       </Row>

//       {/* Modals */}
//       <CertifyModal
//         show={showCertifyModal}
//         handleClose={() => setShowCertifyModal(false)}
//         patient={selectedPatient}
//       />
//       <BillingModal
//         show={showBillingModal}
//         handleClose={() => setShowBillingModal(false)}
//         patient={selectedPatient}
//       />
//     </div>
//   );
// };

// export default DoctorConsultHistoryCard;




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { Checkbox } from "@mui/material";
import "./DoctorConsultHistoryCard.css";
import CertifyModal from "../DoctorConsultDetails/Modals/CertifyModal";
import BillingModal from "../DoctorConsultDetails/Modals/BillingModal";
import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";

const DoctorConsultHistoryCard = () => {
  const [patients, setPatients] = useState([]);
  const [billingIncomplete, setBillingIncomplete] = useState(false);
  const [showLast7Days, setShowLast7Days] = useState(false);
  const [consultationsToday, setConsultationsToday] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const navigate = useNavigate();
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id;

  const togglePatient = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    getConsultation();
    const interval = setInterval(() => {
      getConsultation();
    }, 30000);
    return () => clearInterval(interval);
  }, [billingIncomplete, showLast7Days]);

  const getConsultation = async () => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/incompleteBillings/${doctorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (response.ok) {
        const updatedPatients = await Promise.all(
          result.data.map(async (consultation) => {
            const patient = await getPatientById(consultation.patientId);
            const categoryName = await getConsultationCategoryName(consultation.consultationCategory);
            return {
              ...consultation,
              patientName: patient.name,
              patientAge: calculateAge(patient.DOB),
              patientGender: patient.gender,
              timeAgo: getTimeAgo(consultation.createdAt),
              consultationCategoryName: categoryName,
              date: consultation.createdAt,
            };
          })
        );
        setPatients(updatedPatients);
        calculateConsultationsToday(updatedPatients);
      } else {
        console.log("Error:", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getConsultationCategoryName = async (categoryKey) => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/getOneByKey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: categoryKey }),
      });
      const result = await response.json();
      return response.ok ? result.data.category : categoryKey;
    } catch (error) {
      console.error("Error:", error);
      return categoryKey;
    }
  };

  const getPatientById = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/patient/auth/getOneById/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      return response.ok ? result.data : {};
    } catch (error) {
      console.error("Error:", error);
      return {};
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

  const calculateConsultationsToday = (consultations) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const consultationsToday = consultations.filter(
      (consultation) => new Date(consultation.date).setHours(0, 0, 0, 0) === today
    ).length;
    setConsultationsToday(consultationsToday);
  };

  const filteredPatients = patients.filter((p) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const consultationDate = new Date(p.date);

    const billingFilter = billingIncomplete
      ? (!p.billCodes || p.billCodes.length === 0)
      : true;

    const last7DaysFilter = showLast7Days
      ? consultationDate >= sevenDaysAgo
      : true;

    return billingFilter && last7DaysFilter;
  });

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
      case "videoCall": return <VideoIcon size={24} />;
      case "phoneCall": return <PhoneCallIcon size={24} />;
      case "textChat": return <MessageSquareIcon size={24} />;
      default: return null;
    }
  };

  return (
    <div className="consult-history-container">
      <Row className="content-section">
        <Col lg={8}>
          <h4>Consult History</h4>
          <div className="consultations-header">
            <div className="consultations-today">
              <strong>
                Number of Consultations Today (Midnight to Midnight):{" "}
                {consultationsToday.toLocaleString()}
              </strong>
            </div>
            <div className="filter-section">
              <label className="filter-label">
                <Checkbox
                  checked={billingIncomplete}
                  onChange={(e) => setBillingIncomplete(e.target.checked)}
                />
                Billing Incomplete Only
              </label>
              <label className="filter-label">
                <Checkbox
                  checked={showLast7Days}
                  onChange={(e) => setShowLast7Days(e.target.checked)}
                />
                Show Last 7 Days
              </label>
            </div>
          </div>

          <div className="patient-list">
            {filteredPatients.length ? (
              filteredPatients.map((patient, index) => (
                <div key={index} className="patient-toggle-card">
                  <div
                    className="toggle-header"
                    onClick={() => togglePatient(index)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "10px",
                      borderRadius: "5px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        {getIcon(patient?.type)}{" "}
                        <strong>{patient?.patientName}</strong> - {patient?.consultationCategoryName}
                      </div>
                      <div>{expandedIndex === index ? "▲" : "▼"}</div>
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
                      <p><strong>Age / Gender:</strong> {patient?.patientAge}, {patient?.patientGender}</p>
                      <p><strong>Date:</strong> {formatDate(patient.date)}</p>
                      <p><strong>Notes:</strong> {patient.notes}</p>

                      {patient.isCompleted && (
                        <div className="d-flex gap-2 mt-2">
                          {(!patient.certificates || patient.certificates.length === 0) && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                localStorage.setItem("consultationId", patient._id); // <-- Save ID
                                setSelectedPatient(patient);
                                setShowCertifyModal(true);
                              }}
                            >
                              <i className="fas fa-check-circle me-1"></i>
                              Certify
                            </button>
                          )}

                          {(!patient.billCodes || patient.billCodes.length === 0) && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                localStorage.setItem("consultationId", patient._id); // <-- Save ID
                                setSelectedPatient(patient);
                                setShowBillingModal(true);
                              }}
                            >
                              <i className="fas fa-dollar-sign me-1"></i>
                              Bill
                            </button>
                          )}
                        </div>
                      )}
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

      {/* Modals */}
      <CertifyModal
        show={showCertifyModal}
        handleClose={() => setShowCertifyModal(false)}
        patient={selectedPatient}
      />
      <BillingModal
        show={showBillingModal}
        handleClose={() => setShowBillingModal(false)}
        patient={selectedPatient}
      />
    </div>
  );
};

export default DoctorConsultHistoryCard;
