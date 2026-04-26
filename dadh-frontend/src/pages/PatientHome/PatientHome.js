import React, { useEffect, useState, useRef } from "react";
import Swal from 'sweetalert2';
import PatientCallPage from "pages/PatientCall/PatientCallPage";
import { PhoneCallIcon, VideoIcon, MessageSquareIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import { Spinner, Alert, Table, Modal, Card, CardBody, Container, Row, Col, Button, } from "reactstrap";

const CertificateModal = ({ show, onClose, certificate, doctorName, qualification, prescriberNumber, patientName, patientDOB, signature }) => {
  if (!show) return null;

  const printCertificate = () => {
    const printContents = document.getElementById("certificate-print-section").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const today = new Date().toISOString().split("T")[0];
  const formattedDOB = patientDOB
    ? new Date(patientDOB).toLocaleDateString("en-AU")
    : "N/A";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        id="certificate-print-section"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          width: "800px",
          maxWidth: "95%",
          borderRadius: "10px",
          fontFamily: "Arial, sans-serif",
          color: "#000",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <img src="" alt="DADH Logo" style={{ height: "80px" }} />
          <div style={{ textAlign: "right", fontSize: "14px" }}>
            <div><strong>DADH</strong></div>
            <div>Fax: (07) 3835 1012</div>
            <div>DHB-5AN</div>
            <div>{today}</div>
          </div>
        </div>
        <h2 style={{ textAlign: "center", marginTop: "40px", marginBottom: "30px" }}>{certificate.certificationType}</h2>
        <div style={{ fontSize: "16px", lineHeight: "1.8" }}>
          <p><strong>Re:</strong> {patientName || "N/A"}, {formattedDOB}</p>
          {certificate.note && (<p><strong>Note:</strong> {certificate.note}</p>)}
        </div>
        <div style={{ marginTop: "60px" }}>
          <img
            src={`data:image/png;base64,${signature || ""}`}
            alt="signature"
            style={{ width: "150px", height: "auto" }}
          />
          <div>Dr {doctorName}</div>
          <div>Qualification: {qualification}</div>
          <div>Prescriber No: {prescriberNumber}</div>
        </div>
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={printCertificate} style={{ padding: "10px 20px", fontSize: 16, backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}>Print</button>
          <button onClick={onClose} style={{ padding: "10px 20px", fontSize: 16, backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

const PatientHome = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState({
    show: false,
    certificate: null,
    doctorName: "",
    qualification: "",
    prescriberNumber: "",
    patientName: "",
    patientDOB: "",
    signature: "",
  });
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Enhanced call state management
  const [callState, setCallState] = useState({
    isReceivingCall: false,
    callingDoctor: null,
    callConsultationId: null,
    callType: null
  });

  // Persistent tracking for alerts - use localStorage with timestamp expiry
  const shownAlertsRef = useRef(new Set());

  // Initialize shown alerts from localStorage on mount
  useEffect(() => {
    const loadShownAlerts = () => {
      try {
        const alertsData = localStorage.getItem('patientAlertHistory');
        if (alertsData) {
          const parsedData = JSON.parse(alertsData);
          const now = Date.now();
          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

          // Filter out alerts older than 24 hours
          const validAlerts = Object.keys(parsedData).filter(alertId => {
            const alertTime = parsedData[alertId];
            return (now - alertTime) < TWENTY_FOUR_HOURS;
          });

          // Update localStorage with valid alerts only
          const filteredData = {};
          validAlerts.forEach(alertId => {
            filteredData[alertId] = parsedData[alertId];
          });

          localStorage.setItem('patientAlertHistory', JSON.stringify(filteredData));
          shownAlertsRef.current = new Set(validAlerts);

          console.log('📋 Loaded alert history:', validAlerts.length, 'valid alerts');
        }
      } catch (error) {
        console.error('Error loading alert history:', error);
        localStorage.removeItem('patientAlertHistory');
        shownAlertsRef.current = new Set();
      }
    };

    loadShownAlerts();
  }, []);

  const BASE_URL = "http://localhost:5001/api";
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

  const patient = JSON.parse(localStorage.getItem("patientData"))?.data || {};
  const patientId = patient?._id;
  const patientName = patient?.name || "N/A";
  const patientDOB = patient?.DOB || patient?.dob || "N/A";
  const patientGender = patient?.gender || "N/A";
  const patientAge = patient?.DOB
    ? new Date().getFullYear() - new Date(patient.DOB).getFullYear()
    : "N/A";

  const openCallModal = () => {
    console.log('📞 Opening call modal');
    setCallModalOpen(true);
    // Clear call state when answering
    setCallState(prev => ({ ...prev, isReceivingCall: false }));
  };


  const getConsultationId = () => {
    try {
      return localStorage.getItem("consultationId") || null;
    } catch {
      return null;
    }
  };


  const closeCallModal = async () => {

    const consultationId = getConsultationId();
    if (!consultationId) {
      console.warn("Consultation ID not found. Cannot update call status.");
      return;
    }

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/update/${consultationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCalling: false,
        }),
      });

      if (response.ok) {
        // ✅ API success, now close the modal
        setCallModalOpen(false);
      } else {
        console.error("❌ API responded with error:", await response.text());
      }
    } catch (error) {
      console.error("Failed to update consultation on call close:", error);
    }
  };


  // const closeCallModal = () => {
  //   console.log('📞 Closing call modal');
  //   setCallModalOpen(false);
  // };

  // Enhanced fetch with retry logic
  const fetchWithRetry = async (url, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.warn(`Fetch attempt ${i + 1} failed:`, error);
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  // Clear old session-based alerts on component mount - run only once
  useEffect(() => {
    const clearOldSessionAlerts = () => {
      // Clear old session-based alerts that might cause conflicts
      sessionStorage.removeItem('shownAlerts');

      // Clear old localStorage keys that used different format
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('doctorAssignedAlert_') ||
          key.startsWith('callAlert_') ||
          key.startsWith('consultationEndAlert_')) {
          localStorage.removeItem(key);
        }
      });
    };

    clearOldSessionAlerts();
  }, []);

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Tab became visible, checking for updates');
        // Tab became visible, check for updates but don't trigger repeated alerts
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Helper function to add alert to persistent storage
  const addShownAlert = (alertId) => {
    const now = Date.now();
    shownAlertsRef.current.add(alertId);

    try {
      const existingAlerts = JSON.parse(localStorage.getItem('patientAlertHistory') || '{}');
      existingAlerts[alertId] = now;
      localStorage.setItem('patientAlertHistory', JSON.stringify(existingAlerts));
      console.log('✅ Alert stored:', alertId);
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "videoCall":
        return <VideoIcon size={18} />;
      case "phoneCall":
        return <PhoneCallIcon size={18} />;
      case "textChat":
        return <MessageSquareIcon size={18} />;
      default:
        return null;
    }
  };

  const getConsultationCategoryName = async (categoryKey) => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/getOneByKey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: categoryKey }),
      });
      const data = await response.json();
      return data.state ? data.data.category : categoryKey;
    } catch (error) {
      console.error("Error fetching category:", error);
      return categoryKey;
    }
  };

  // Enhanced call notification with better UX and proper tracking
  // const showCallNotification = (doctorName, consultationId, callType) => {
  //   const callAlertId = `call_${consultationId}`;

  //   // Check if this call alert was shown recently (within 30 seconds)
  //   const lastCallTime = sessionStorage.getItem(`lastCall_${consultationId}`);
  //   const now = Date.now();
  //   if (lastCallTime && (now - parseInt(lastCallTime)) < 30000) {
  //     console.log('📞 Call alert recently shown, skipping...');
  //     return;
  //   }

  //   console.log(`📞 Showing call notification for Dr. ${doctorName}`);

  //   // Store the time this call alert was shown
  //   sessionStorage.setItem(`lastCall_${consultationId}`, now.toString());

  //   // Play notification sound (if available)
  //   try {
  //     const audio = new Audio('/notification-sound.mp3');
  //     audio.play().catch(e => console.log('Could not play notification sound:', e));
  //   } catch (e) {
  //     console.log('No notification sound available');
  //   }

  //   Swal.fire({
  //     icon: "info",
  //     title: "📞 Incoming Call",
  //     text: `Dr. ${doctorName} is calling you now.`,
  //     showCancelButton: true,
  //     confirmButtonText: "Answer Call",
  //     cancelButtonText: "Decline",
  //     allowOutsideClick: false,
  //     allowEscapeKey: false,
  //     timer: 45000, // 45 seconds timeout
  //     timerProgressBar: true,
  //     customClass: {
  //       popup: 'call-notification-popup',
  //       confirmButton: 'btn-answer-call',
  //       cancelButton: 'btn-decline-call'
  //     },
  //     willOpen: () => {
  //       // Add blinking effect
  //       const popup = Swal.getPopup();
  //       popup.style.animation = 'pulse 1s infinite';
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       console.log('📞 Call answered by patient');
  //       openCallModal();
  //     } else {
  //       console.log('📞 Call declined by patient');
  //       setCallState(prev => ({ ...prev, isReceivingCall: false }));
  //     }
  //   });
  // };

  const fetchData = async () => {
    try {
      if (!patientId) return;

      console.log('🔄 Fetching consultation data...');

      // Only show loader on initial load, not on subsequent API calls
      if (isInitialLoad) {
        setLoading(true);
      }

      const response = await fetchWithRetry(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`);
      const consultationList = response.data || [];

      console.log(`📋 Found ${consultationList.length} consultations`);

      const updatedConsults = await Promise.all(
        consultationList.map(async (consultation) => {
          let doctorInfo = {
            name: "Unknown",
            qualification: "",
            prescriberNumber: "",
            signature: "",
          };

          if (consultation.doctorId) {
            try {
              const docRes = await fetchWithRetry(`${BASE_URL}/doctor-requests/getOneById/${consultation.doctorId}`);

              if (docRes.state) {
                const { name, qualification, prescriberNumber, signature } = docRes.data;
                doctorInfo = { name, qualification, prescriberNumber, signature };

                // Enhanced call detection logic
                const isActiveCall = consultation.isCalling === true &&
                  (consultation.type === "videoCall" || consultation.type === "phoneCall") &&
                  !consultation.isCompleted;

                console.log(`📞 Call check for consultation ${consultation._id}:`, {
                  isCalling: consultation.isCalling,
                  type: consultation.type,
                  isCompleted: consultation.isCompleted,
                  doctorName: name,
                  isActiveCall
                });

                if (Boolean(consultation.isCalling)) {
                  // Update call state
                  setCallState(prev => {
                    if (prev.callConsultationId !== consultation._id) {
                      console.log('📞 New incoming call detected!');
                      return {
                        isReceivingCall: true,
                        callingDoctor: name,
                        callConsultationId: consultation._id,
                        callType: consultation.type
                      };
                    }
                    return prev;
                  });

                  // Show call notification with proper throttling
                  showCallNotification(name, consultation._id, consultation.type);
                } else if (callState.callConsultationId === consultation._id && !consultation.isCalling) {
                  // Call ended
                  console.log('📞 Call ended');
                  setCallState({
                    isReceivingCall: false,
                    callingDoctor: null,
                    callConsultationId: null,
                    callType: null
                  });
                }

                // Check if consultation is recent (within 2 hours) for other alerts
                const now = new Date();
                const consultationDate = new Date(consultation.createdAt);
                const hoursDiff = (now - consultationDate) / (1000 * 60 * 60);
                const isRecentConsultation = hoursDiff <= 2; // Reduced from 24 to 2 hours for better UX

                // Doctor Assigned Alert - show only once per consultation
                const assignedAlertId = `doctorAssigned_${consultation._id}`;
                if (isRecentConsultation &&
                  consultation.doctorId &&
                  !consultation.isCompleted &&
                  !shownAlertsRef.current.has(assignedAlertId)) {

                  console.log('🩺 Showing doctor assigned alert for:', name);
                  Swal.fire({
                    icon: "success",
                    title: "Doctor Assigned",
                    text: `Dr. ${name} has been assigned to your consultation.`,
                    timer: 4000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    timerProgressBar: true,
                  });
                  addShownAlert(assignedAlertId);
                }

                // Consultation Ended Alert - show only once per consultation
                const endAlertId = `consultationEnd_${consultation._id}`;
                if (consultation.isCompleted === true &&
                  isRecentConsultation &&
                  !shownAlertsRef.current.has(endAlertId)) {

                  console.log('✅ Showing consultation ended alert for:', name);
                  Swal.fire({
                    icon: "info",
                    title: "Consultation Ended",
                    text: `Your consultation with Dr. ${name} has ended.`,
                    timer: 4000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    timerProgressBar: true,
                  });
                  addShownAlert(endAlertId);
                }
              }
            } catch (err) {
              console.warn("Failed to fetch doctor info", err);
            }
          }

          let totalAmount = 0;
          for (const billCode of consultation.billCodes || []) {
            try {
              const res = await fetchWithRetry(`${BASE_URL}/billing/getOneById/${billCode}`);
              if (res?.state && res.data?.amount)
                totalAmount += parseFloat(res.data.amount);
            } catch (err) {
              console.warn("Failed to fetch billing info", err);
            }
          }

          const categoryName = await getConsultationCategoryName(consultation.consultationCategory);

          return {
            ...consultation,
            doctorInfo,
            consultationCategoryName: categoryName,
            doctorName: doctorInfo.name,
            total_amount: totalAmount.toFixed(2),
          };
        }));

      setConsultations(updatedConsults);
      localStorage.setItem("patientConsultations", JSON.stringify(updatedConsults));

      console.log('✅ Data fetch completed successfully');
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      // Only show error on initial load, not on background updates
      if (isInitialLoad) {
        setError("Something went wrong.");
      }
    } finally {
      // Only update loading state on initial load
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    let intervalId;

    // Determine polling frequency based on call state
    const hasActiveCalls = consultations.some(c =>
      c.isCalling === true && !c.isCompleted
    );

    console.log('📊 Polling setup:', { hasActiveCalls, consultationsCount: consultations.length });

    fetchData();

    // Use shorter interval if there are active calls or call state is active
    const pollInterval = (hasActiveCalls || callState.isReceivingCall) ? 3000 : 10000; // 3s vs 10s
    console.log(`⏱️ Setting poll interval to ${pollInterval}ms`);

    intervalId = setInterval(fetchData, pollInterval);

    return () => {
      console.log('🧹 Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [patientId, isInitialLoad, callState.isReceivingCall]);

  const openCertificateModal = (certificate, doctorInfo) => {
    setModalData({
      show: true,
      certificate,
      doctorName: doctorInfo.name,
      qualification: doctorInfo.qualification,
      prescriberNumber: doctorInfo.prescriberNumber,
      signature: doctorInfo.signature,
      patientName,
      patientDOB,
    });
  };

  const closeCertificateModal = () => {
    setModalData({
      show: false,
      certificate: null,
      doctorName: "",
      qualification: "",
      prescriberNumber: "",
      patientName: "",
      patientDOB: "",
      signature: "",
    });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner color="primary" />
        <p>Loading...</p>
      </div>
    );

  if (error) return <Alert color="danger">{error}</Alert>;

  return (
    <>
      {/* Add custom styles for call notifications */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .call-notification-popup {
          border: 3px solid #28a745 !important;
        }
        
        .btn-answer-call {
          background-color: #28a745 !important;
          animation: pulse 1s infinite !important;
        }
        
        .btn-decline-call {
          background-color: #dc3545 !important;
        }
        
        .incoming-call-banner {
          animation: pulse 1s infinite;
        }
      `}</style>

      {/* Persistent Call Notification Banner */}
      {callState.isReceivingCall && !callModalOpen && (
        <div
          className="incoming-call-banner"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px',
            textAlign: 'center',
            zIndex: 10000,
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          📞 Incoming {callState.callType === 'videoCall' ? 'Video' : 'Phone'} Call from Dr. {callState.callingDoctor}
          <div style={{ marginTop: '10px' }}>
            <Button
              color="light"
              size="sm"
              className="mr-2"
              onClick={openCallModal}
              style={{ fontWeight: 'bold' }}
            >
              📹 Answer
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={() => {
                setCallState(prev => ({ ...prev, isReceivingCall: false }));
                closeCallModal(); // 👈 Trigger backend update
              }}
            >
              📵 Decline
            </Button>

          </div>
        </div>
      )}

      <Container fluid className="py-4 mt-5" style={{ marginTop: callState.isReceivingCall ? '120px' : '0' }}>
        <h3 className="mb-4" style={{ marginTop: "20px" }}>My Consultation Records</h3>

        <Table bordered responsive hover className="table-sm align-middle">
          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Dr. Name</th>
              <th>P. Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Conditions</th>
              <th>Medications</th>
              <th>Referrals</th>
              <th>Billing</th>
              <th>Certificates</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consult, index) => (
              <tr key={consult._id || index} style={{
                backgroundColor: consult.isCalling && !consult.isCompleted ? '#e8f5e8' : 'transparent'
              }}>
                <td>{index + 1}</td>
                <td><strong>{consult.doctorInfo.name}</strong></td>
                <td><strong>{patientName}</strong></td>
                <td><strong>{patientAge}</strong></td>
                <td><strong>{patientGender}</strong></td>
                <td>{new Date(consult.createdAt).toLocaleString()}</td>
                <td>{getIcon(consult.type)} {consult.type}</td>
                <td>{consult.consultationCategoryName || "N/A"}</td>
                <td>
                  {consult.isCalling && !consult.isCompleted ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                      <PhoneCallIcon size={18} /> Calling...
                    </span>
                  ) : consult.isCompleted ? (
                    <span style={{ color: '#6c757d' }}>
                      <CheckCircleIcon size={18} /> Completed
                    </span>
                  ) : (
                    <span style={{ color: '#ffc107' }}>
                      <ClockIcon size={18} /> In Progress
                    </span>
                  )}
                </td>
                <td>{consult.notes || "N/A"}</td>

                {/* Conditions Column */}
                <td>
                  {consult.conditions?.length > 0
                    ? consult.conditions.map((c, j) => (
                      <div key={j} className="mb-1" style={{ fontSize: '0.85em' }}>
                        • {c.condition}
                      </div>
                    ))
                    : "N/A"}
                </td>

                {/* Medications Column */}
                <td>
                  {consult.medications?.length > 0
                    ? consult.medications.map((m, j) => (
                      <div key={j} className="mb-1" style={{ fontSize: '0.85em' }}>
                        • {m.medicineName} - {m.dosage}
                      </div>
                    ))
                    : "N/A"}
                </td>

                {/* Referrals Column */}
                <td>
                  {consult.refer?.length > 0
                    ? consult.refer.map((r, j) => (
                      <div key={j} className="mb-1" style={{ fontSize: '0.85em' }}>
                        • {r.name}: {r.message}
                      </div>
                    ))
                    : "N/A"}
                </td>

                {/* Billing Column */}
                <td className="text-center">
                  <div style={{ fontSize: '1em', fontWeight: 'bold' }}>
                    {consult.total_amount > 0 ? (
                      <span style={{ color: '#28a745' }}>
                        ${consult.total_amount}
                      </span>
                    ) : (
                      <span style={{ color: '#ffc107' }}>
                        In Progress
                      </span>
                    )}
                  </div>
                  {consult.billCodes?.length > 0 && (
                    <div style={{ fontSize: '0.75em', color: '#6c757d' }}>
                      {consult.billCodes.length} bill code(s)
                    </div>
                  )}
                </td>

                {/* Certificates Column */}
                <td>
                  {consult.certificates?.length > 0
                    ? consult.certificates.map((cert, j) => (
                      <div key={j} className="mb-1">
                        <Button
                          size="sm"
                          color="primary"
                          className="mt-1"
                          onClick={() =>
                            openCertificateModal(cert, consult.doctorInfo)
                          }
                          style={{ fontSize: '0.75em' }}
                        >
                          <span style={{ fontSize: '1em' }}>📄</span> {cert.certificationType || 'Certificate'}
                        </Button>
                      </div>
                    ))
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <CertificateModal {...modalData} onClose={closeCertificateModal} />

        <Modal isOpen={callModalOpen} toggle={closeCallModal} centered size="xl">
          <div className="p-3" style={{ height: '80vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Live Call with Dr. {callState.callingDoctor}</h5>
              <Button color="danger" size="sm" onClick={closeCallModal}>
                End Call
              </Button>
            </div>
            <div style={{ height: '100%', overflow: 'auto' }}>
              <PatientCallPage />
            </div>
          </div>
        </Modal>


        {/* Call Popup Modal */}
        {/* <Modal isOpen={callModalOpen} toggle={closeCallModal} centered size="lg">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Live Call with Dr. {callState.callingDoctor}</h5>
              <Button color="danger" size="sm" onClick={closeCallModal}>
                End Call
              </Button>
            </div>
            <PatientCallPage />
          </div>
        </Modal> */}
      </Container>
    </>
  );
};

export default PatientHome;

