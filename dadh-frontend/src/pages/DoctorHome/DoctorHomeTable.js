// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Row, Col, Button } from "reactstrap";
// import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";
// import BasicTabs from "./ChatTabs";
// import { BsChevronRight } from "react-icons/bs";
// import { useAuth } from "store/auth";
// import "./DoctorHomeTable.css";

// const DoctorHomeTable = () => {
//   const [patients, setPatients] = useState([]);
//   const [referredPatients, setReferredPatients] = useState([]);
//   const [isConsulting, setIsConsulting] = useState(false);
//   const navigate = useNavigate();
//   const { userId } = useAuth();
//   const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

//   const getConsultation = async () => {
//     try {
//       const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/getAll`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });

//       const result = await response.json();
//       if (response.ok) {
//         const today = new Date().toISOString().split("T")[0];
//         const patientMap = {};

//         await Promise.all(
//           result.data.map(async (consultation) => {
//             const consultationDate = new Date(consultation.createdAt).toISOString().split("T")[0];
//             if (consultationDate !== today) return;

//             const patient = await getPatientById(consultation.patientId);
//             const categoryName = await getConsultationCategoryName(consultation.consultationCategory);
//             const patientKey = `${consultation.patientId}-${patient.name}-${patient.DOB}-${patient.gender}-${consultation.notes}`;

//             if (!patientMap[patientKey]) {
//               patientMap[patientKey] = {
//                 ...consultation,
//                 patientName: patient.name,
//                 patientAge: calculateAge(patient.DOB),
//                 patientGender: patient.gender,
//                 notes: consultation.notes,
//                 timeAgo: getTimeAgo(consultation.createdAt),
//                 type: consultation.type,
//                 consultationCategoryName: categoryName,
//                 consultationId: consultation._id,
//                 duplicateCount: 1,
//               };
//             } else {
//               patientMap[patientKey].duplicateCount += 1;
//             }
//           })
//         );

//         const sortedPatients = Object.values(patientMap).sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//         );

//         setPatients(sortedPatients);
//       } else {
//         console.log("Error:", result.message);
//       }
//     } catch (error) {
//       console.log("Error:", error);
//     }
//   };

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

//   const getPatientById = async (id) => {
//     try {
//       const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/getOneById/${id}`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });
//       const result = await response.json();
//       return response.ok ? result.data : {};
//     } catch (error) {
//       console.error("Error:", error);
//       return {};
//     }
//   };

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
//     else if (diffMinutes < 60) return `${diffMinutes} min ago`;
//     else return `${diffHours} hrs ago`;
//   };

//   const getIcon = (type, count = 1, age) => {
//     const iconColor = age <= 16 ? "#4CAF50" : "currentColor";
//     return (
//       <div className="icon-container">
//         {type === "videoCall" && <VideoIcon size={24} color={iconColor} />}
//         {type === "phoneCall" && <PhoneCallIcon size={24} color={iconColor} />}
//         {type === "textChat" && <MessageSquareIcon size={24} color={iconColor} />}
//         {count > 1 && <span className="count-badge">{count}</span>}
//       </div>
//     );
//   };

//   const getDoctorById = async () => {
//     try {
//       const res = await fetch(`${REACT_APP_BACKEND_URL}/doctor-requests/getOneById/${userId}`, {
//         method: "GET",
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setIsConsulting(data?.data?.isConsulting);
//       }
//     } catch (err) {
//       console.log("Error fetching doctor by ID:", err);
//     }
//   };

//   useEffect(() => {
//     getDoctorById();
//     getConsultation();
//     const interval = setInterval(() => {
//       getConsultation();
//     }, 10000);
//     return () => clearInterval(interval);
//   }, [userId]);

//   const storedData = JSON.parse(localStorage.getItem("data"));
//   const consultationId = storedData?.data?.activeConsultationId || null;

//   return (
//     <div className="container">
//       <Row className="main-row">
//         <Col lg={8}>
//           <div className="patient-list">
//             <h5>Patients Waiting</h5>

//             {isConsulting && consultationId && (
//               <div className="d-flex align-center justify-content-between">
//                 <p style={{ color: "red" }}>You are in consult</p>
//                 <Button
//                   color="primary"
//                   onClick={() =>
//                     navigate(`/doctor/startConsult/${consultationId}/details`)
//                   }
//                 >
//                   Return to Consult
//                 </Button>
//               </div>
//             )}

//             {patients.length > 0 ? (
//               patients.filter(patient =>
//                 !patient.doctorId ||
//                 patient.doctorId === "" ||
//                 patient.doctorId === null ||
//                 patient.doctorId === undefined ||
//                 patient.doctorId === "null"
//               ).length > 0 ? (
//                 patients
//                   .filter(patient =>
//                     !patient.doctorId ||
//                     patient.doctorId === "" ||
//                     patient.doctorId === null ||
//                     patient.doctorId === undefined ||
//                     patient.doctorId === "null"
//                   )
//                   .map((patient, index) => (
//                     <div
//                       key={`${patient.consultationId}-${index}`}
//                       className="patient"
//                       style={{
//                         cursor: isConsulting ? "not-allowed" : "pointer",
//                         transition: "all 0.3s ease",
//                         boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
//                         borderRadius: "10px",
//                         background: "#fff",
//                         width: "100%",
//                         opacity: isConsulting ? 0.6 : 1,
//                         pointerEvents: isConsulting ? "none" : "auto",
//                       }}
//                       onClick={() => {
//                         if (!isConsulting) {
//                           navigate(
//                             `/doctor/startConsult/${patient.consultationId}`
//                           );
//                         }
//                       }}
//                     >
//                       <div className="icon-wrapper">
//                         {getIcon(
//                           patient?.type,
//                           patient.duplicateCount,
//                           patient.patientAge
//                         )}
//                       </div>

//                       <div className="patient-pinfo">
//                         <div className="patient-details flex align-items-start">
//                           <Row className="align-items-start">
//                             <Col>
//                               <span className="patient-name">
//                                 {patient?.patientName || "Unknown Patient"},{" "}
//                                 {patient?.patientAge || "N/A"},{" "}
//                                 {patient?.patientGender || "N/A"}
//                               </span>
//                             </Col>
//                             <Col xs="auto">
//                               {patient?.consultationCategory ===
//                                 "medicalCertificate" ? (
//                                 <span
//                                   style={{
//                                     fontSize: "11px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     backgroundColor: "#007bff",
//                                     color: "#fff",
//                                     padding: "1px 10px",
//                                     borderRadius: "12px",
//                                     fontWeight: "500",
//                                   }}
//                                 >
//                                   Express
//                                 </span>
//                               ) : null}
//                             </Col>
//                           </Row>
//                         </div>
//                         <span className="consultation-category">
//                           {patient.consultationCategoryName ||
//                             "General Consultation"}
//                         </span>{" "}
//                         <span className="patient-dnotes">
//                           {patient.notes && patient.notes.length > 50
//                             ? `${patient.notes.substring(0, 50)}...`
//                             : patient.notes || "No notes available"}
//                         </span>
//                       </div>

//                       <div className="time-ago">
//                         {patient.timeAgo || "Just now"}
//                       </div>
//                       <div className="arrow-icon">
//                         <BsChevronRight className="icon-arrow" />
//                       </div>
//                     </div>
//                   ))
//               ) : (
//                 <div className="text-center no-patients">
//                   <p>All patients are currently in consultation</p>
//                   <small>Please check back later</small>
//                 </div>
//               )
//             ) : (
//               <div className="text-center loading-patients">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//                 <p>Loading patients...</p>
//               </div>
//             )}
//           </div>
//         </Col>
//         <Col lg={4} md={12} className="d-flex flex-column mt-4">
//           <BasicTabs />
//         </Col>
//       </Row>
//     </div>
//   );
// };
// export default DoctorHomeTable;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";
import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";
import BasicTabs from "./ChatTabs";
import { BsChevronRight } from "react-icons/bs";
import { useAuth } from "store/auth";
import "./DoctorHomeTable.css";

const DoctorHomeTable = () => {
  const [patients, setPatients] = useState([]);
  const [referredPatients, setReferredPatients] = useState([]);
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

  const getConsultation = async () => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (response.ok) {
        const patientMap = {};

        await Promise.all(
          result.data.map(async (consultation) => {
            const patient = await getPatientById(consultation.patientId);
            const categoryName = await getConsultationCategoryName(consultation.consultationCategory);
            const patientKey = `${consultation.patientId}-${patient.name}-${patient.DOB}-${patient.gender}-${consultation.notes}`;

            if (!patientMap[patientKey]) {
              patientMap[patientKey] = {
                ...consultation,
                patientName: patient.name,
                patientAge: calculateAge(patient.DOB),
                patientGender: patient.gender,
                notes: consultation.notes,
                timeAgo: getTimeAgo(consultation.createdAt),
                type: consultation.type,
                consultationCategoryName: categoryName,
                consultationId: consultation._id,
                duplicateCount: 1,
              };
            } else {
              patientMap[patientKey].duplicateCount += 1;
            }
          })
        );

        const sortedPatients = Object.values(patientMap)
          .filter((consultation) => {
            const isReferredToMe = Array.isArray(consultation.refer)
              ? consultation.refer.some((ref) => ref.doctorId === userId)
              : false;

            // referredPatients will be shown in referred box, not here
            return !isReferredToMe;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPatients((prev) => {
          const isSame = JSON.stringify(prev) === JSON.stringify(sortedPatients);
          return isSame ? prev : sortedPatients;
        });

        return result.data;
      } else {
        console.log("Error:", result.message);
        return [];
      }
    } catch (error) {
      console.log("Error:", error);
      return [];
    }
  };

  const getReferredConsultations = async () => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        const enrichedPatients = await Promise.all(
          result.data
            .filter(
              (consultation) =>
                Array.isArray(consultation.refer) &&
                consultation.refer.some((ref) => ref.doctorId === userId)
            )
            .map(async (consultation) => {
              const patient = await getPatientById(consultation.patientId);
              const categoryName = await getConsultationCategoryName(consultation.consultationCategory);

              return {
                ...consultation,
                patientName: patient.name,
                patientAge: calculateAge(patient.DOB),
                patientGender: patient.gender,
                notes: consultation.notes,
                timeAgo: getTimeAgo(consultation.createdAt),
                type: consultation.type,
                consultationCategoryName: categoryName,
                consultationId: consultation._id,
                duplicateCount: 1,
              };
            })
        );

        setReferredPatients(enrichedPatients);
      } else {
        console.log("Referral fetch error:", result.message);
      }
    } catch (error) {
      console.error("Referral fetch error:", error);
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
      const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/getOneById/${id}`, {
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
    else if (diffMinutes < 60) return `${diffMinutes} min ago`;
    else return `${diffHours} hrs ago`;
  };

  const getIcon = (type, count = 1, age) => {
    const iconColor = age <= 16 ? "#4CAF50" : "currentColor";
    return (
      <div className="icon-container">
        {type === "videoCall" && <VideoIcon size={24} color={iconColor} />}
        {type === "phoneCall" && <PhoneCallIcon size={24} color={iconColor} />}
        {type === "textChat" && <MessageSquareIcon size={24} color={iconColor} />}
        {count > 1 && <span className="count-badge">{count}</span>}
      </div>
    );
  };

  const getDoctorById = async () => {
    try {
      const res = await fetch(`${REACT_APP_BACKEND_URL}/doctor-requests/getOneById/${userId}`, {
        method: "GET",
      });
      if (res.ok) {
        const data = await res.json();
        setIsConsulting(data?.data?.isConsulting);
      }
    } catch (err) {
      console.log("Error fetching doctor by ID:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      await getDoctorById();
      const consultations = await getConsultation();
      await getReferredConsultations();

      const activeConsult = consultations.find(
        (c) => c.doctorId === userId && !c.isCompleted
      );

      if (isMounted) {
        if (activeConsult) {
          setConsultationId(activeConsult._id);
          const stored = JSON.parse(localStorage.getItem("data")) || {};
          stored.data = stored.data || {};
          stored.data.activeConsultationId = activeConsult._id;
          localStorage.setItem("data", JSON.stringify(stored));
        } else {
          setConsultationId(null);
        }
      }
    };

    fetchData();

    const interval = setInterval(() => {
      if (isMounted) fetchData();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

const handleReturnToConsult = async () => {
  try {
    const res = await fetch(`http://localhost:5001/api/consultations/getOneById/${consultationId}`, {
      method: "GET",
    });

    if (!res.ok) {
      console.error("Failed to fetch consultation data. Status:", res.status);
      return;
    }

    const result = await res.json();
    const data = result.data;

    localStorage.setItem("consultationId", data._id);
    localStorage.setItem("patientId", data.patientId);
    localStorage.setItem("doctorId", data.doctorId);

    // Fetch and store patient data so TopCard and call pages have it
    try {
      const patRes = await fetch(
        `http://localhost:5001/api/patient/auth/getOneById/${data.patientId}`,
        { method: "GET" }
      );
      if (patRes.ok) {
        const patResult = await patRes.json();
        localStorage.setItem("consultPatientData", JSON.stringify(patResult.data));
      }
    } catch (e) {
      console.error("Failed to fetch patient for consultPatientData:", e);
    }

    navigate(`/doctor/startConsult/${consultationId}/details`);
  } catch (error) {
    console.error("Failed to fetch consultation data:", error);
  }
};

  return (
    <div className="container">
      <Row className="main-row">
        <Col lg={8}>
          <div className="patient-list">
            <h5>Patients Waiting</h5>

            {consultationId && (
              <div className="d-flex align-center justify-content-between mb-2 p-2"
                style={{ background: "#fff3cd", borderRadius: 8, border: "1px solid #ffc107" }}>
                <p style={{ color: "#856404", margin: 0, fontWeight: 500 }}>
                  You have an active consultation
                </p>
                <Button color="primary" onClick={handleReturnToConsult}>
                  Return to Consult
                </Button>
              </div>
            )}

            {patients.filter((p) => !p.doctorId || p.doctorId === "").length === 0 && !consultationId && (
              <div className="text-center no-patients py-4">
                <p className="text-muted mb-1">No patients waiting</p>
                <small className="text-muted">New consultations will appear here automatically</small>
              </div>
            )}

            {patients
              .filter((p) => !p.doctorId || p.doctorId === "")
              .map((patient, index) => (
                <div
                  key={`${patient.consultationId}-${index}`}
                  className="patient"
                  style={{
                    cursor: isConsulting ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "10px",
                    background: "#fff",
                    opacity: isConsulting ? 0.6 : 1,
                    pointerEvents: isConsulting ? "none" : "auto",
                  }}
                  onClick={() => {
                    if (!isConsulting) {
                      navigate(`/doctor/startConsult/${patient.consultationId}`);
                    }
                  }}
                >
                  <div className="icon-wrapper">
                    {getIcon(patient?.type, patient.duplicateCount, patient.patientAge)}
                  </div>
                  <div className="patient-pinfo">
                    <span className="patient-name">
                      {patient?.patientName || "Unknown Patient"},{" "}
                      {patient?.patientAge}, {patient?.patientGender}
                    </span>
                    <span className="consultation-category">
                      {patient.consultationCategoryName || "General Consultation"}
                    </span>
                    <span className="patient-dnotes">
                      {patient.notes && patient.notes.length > 50
                        ? `${patient.notes.substring(0, 50)}...`
                        : patient.notes || "No notes available"}
                    </span>
                  </div>
                  <div className="time-ago">{patient.timeAgo || "Just now"}</div>
                  <div className="arrow-icon">
                    <BsChevronRight className="icon-arrow" />
                  </div>
                </div>
              ))}

            {/* Referred Patients Section */}
            {referredPatients.length > 0 && (
              <div
                className="referred-box mt-5 p-3"
                style={{
                  backgroundColor: "#f0f8ff",
                  border: "2px dashed #1890ff",
                  borderRadius: "12px",
                }}
              >
                <h5 style={{ color: "#1890ff" }}>Doctor Referred to You</h5>

                {referredPatients.map((patient, index) => (
                  <div
                    key={`${patient.consultationId}-ref-${index}`}
                    className="patient mt-3"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      borderRadius: "10px",
                      background: "#ffffff",
                    }}
                    onClick={() =>
                      navigate(`/doctor/startConsult/${patient.consultationId}`)
                    }
                  >
                    <div className="icon-wrapper">
                      {getIcon(patient?.type, patient.duplicateCount, patient.patientAge)}
                    </div>
                    <div className="patient-pinfo">
                      <span className="patient-name">
                        {patient?.patientName || "Unknown Patient"},{" "}
                        {patient?.patientAge}, {patient?.patientGender}
                      </span>
                      <span className="consultation-category">
                        {patient.consultationCategoryName || "General Consultation"}
                      </span>
                      <span className="patient-dnotes">
                        {patient.notes && patient.notes.length > 50
                          ? `${patient.notes.substring(0, 50)}...`
                          : patient.notes || "No notes"}
                      </span>
                    </div>
                    <div className="time-ago">{patient.timeAgo || "Just now"}</div>
                    <div className="arrow-icon">
                      <BsChevronRight className="icon-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        <Col lg={4} md={12} className="d-flex flex-column mt-4">
          <BasicTabs />
        </Col>
      </Row>
    </div>
  );
};

export default DoctorHomeTable;

