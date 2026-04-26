
import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { PhoneCallIcon, VideoIcon, MessageSquareIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import {
  Spinner,
  Alert,
  Table,
  Modal,
  Container,
  Button,
} from "reactstrap";

// Certificate Modal Component
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
  const formattedDOB = patientDOB ? new Date(patientDOB).toLocaleDateString("en-AU") : "N/A";

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
      role="dialog"
      aria-modal="true"
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

const BillingDetails = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Certificate modal state
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

  const BASE_URL = "http://localhost:5001/api";

  const fetchWithRetry = async (url, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  const getConsultationCategoryName = async (categoryKey) => {
    try {
      const response = await fetch(`${BASE_URL}/consultationCategory/getOneByKey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: categoryKey }),
      });
      const data = await response.json();
      return data.state ? data.data.category : categoryKey;
    } catch (error) {
      return categoryKey;
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/patient/auth/getOneById/${patientId}`);
      if (response.state && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching patient details:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isInitialLoad) setLoading(true);

        const response = await fetchWithRetry(`${BASE_URL}/consultations/getConsultations`);
        const consultationList = response.data || [];

        const updatedConsults = await Promise.all(
          consultationList.map(async (consultation) => {
            let patientInfo = {
              name: "N/A",
              DOB: "N/A",
              dob: "N/A", 
              gender: "N/A"
            };

            if (consultation.patientId) {
              if (typeof consultation.patientId === 'object' && consultation.patientId._id) {
                patientInfo = consultation.patientId;
              } else if (typeof consultation.patientId === 'string') {
                const fetchedPatient = await fetchPatientDetails(consultation.patientId);
                if (fetchedPatient) {
                  patientInfo = fetchedPatient;
                }
              }
            }

            const patientName = patientInfo.name || "N/A";
            const patientDOB = patientInfo.DOB || patientInfo.dob || "N/A";
            const patientGender = patientInfo.gender || "N/A";
            const patientAge = patientDOB !== "N/A"
              ? new Date().getFullYear() - new Date(patientDOB).getFullYear()
              : "N/A";

            let doctorInfo = {
              name: "Unknown",
              qualification: "",
              prescriberNumber: "",
              signature: "",
            };

            if (consultation.doctorId) {
              try {
                const docRes = await fetchWithRetry(`${BASE_URL}/doctor-requests/getOneById/${consultation.doctorId}`);
                if (docRes.state) doctorInfo = docRes.data;
              } catch (err) {
                console.error("Error fetching doctor info:", err);
              }
            }

            let totalAmount = 0;
            for (const billCode of consultation.billCodes || []) {
              try {
                const res = await fetchWithRetry(`${BASE_URL}/billing/getOneById/${billCode}`);
                if (res?.state && res.data?.amount)
                  totalAmount += parseFloat(res.data.amount);
              } catch (err) {
                console.error("Error fetching billing info:", err);
              }
            }

            const categoryName = await getConsultationCategoryName(consultation.consultationCategory);

            return {
              ...consultation,
              doctorInfo,
              consultationCategoryName: categoryName,
              doctorName: doctorInfo.name,
              total_amount: totalAmount.toFixed(2),
              patientName,
              patientDOB,
              patientGender,
              patientAge,
              patientInfo,
            };
          })
        );

        setConsultations(updatedConsults);
      } catch (err) {
        console.error("Error in fetchData:", err);
        if (isInitialLoad) setError("Something went wrong.");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    fetchData();
  }, [isInitialLoad]);

  const getIcon = (type) => {
    switch (type) {
      case "videoCall": return <VideoIcon size={18} />;
      case "phoneCall": return <PhoneCallIcon size={18} />;
      case "textChat": return <MessageSquareIcon size={18} />;
      default: return null;
    }
  };

  const openCertificateModal = (certificate, doctorInfo, patientName, patientDOB) => {
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
    <Container fluid className="py-4 mt-5">
      <h3 className="mb-4" style={{ marginTop: "20px" }}>Billing Details & Consultation Records</h3>
      
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
            <tr key={consult._id || index}>
              <td>{index + 1}</td>
              <td><strong>{consult.doctorName}</strong></td>
              <td><strong>{consult.patientName}</strong></td>
              <td><strong>{consult.patientAge}</strong></td>
              <td><strong>{consult.patientGender}</strong></td>
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
                          openCertificateModal(cert, consult.doctorInfo, consult.patientName, consult.patientDOB)
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

      {/* Certificate Modal */}
      <CertificateModal {...modalData} onClose={closeCertificateModal} />
    </Container>
  );
};

export default BillingDetails;
