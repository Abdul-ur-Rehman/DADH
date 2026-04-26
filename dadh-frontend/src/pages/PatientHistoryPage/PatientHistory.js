import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { Spinner, Alert, Table, Card, CardBody, Container, Row, Col, Button, } from "reactstrap";
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

const PatientHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState({ name: "", dob: "" });
  const [openConsultationIds, setOpenConsultationIds] = useState([]);
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
  const patientData = JSON.parse(localStorage.getItem("patientData") || "{}");
  const patientId = patientData?.data?._id;
  const patientName = patientData?.data?.name || patient.name || "Patient";
  const patientDOB = patientData?.data?.dob || patient.dob || "N/A";

  useEffect(() => {
    if (!patientId) return;
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patient/auth/getOneById/${patientId}`);
        const data = await res.json();
        if (data?.data) {
          setPatient({
            name: data.data.name || "N/A",
            dob: data.data.dob || data.data.DOB || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setPatient({ name: "N/A", dob: "" });
      }
    };
    fetchPatient();
  }, [patientId]);

  const fetchMedicineName = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/medicines/getById/${id}`);
      const data = await res.json();
      if (data?.state) return data.data?.name || id;
    } catch {
      return id;
    }
  };

  const toggleConsultation = (id) => {
    setOpenConsultationIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // useEffect(() => {
  //   const fetchConsultations = async () => {
  //     try {
  //       setLoading(true);
  //       if (!patientId) throw new Error("Patient ID not found");

  //       const response = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`);
  //       const result = await response.json();
  //       const consultationList = result.data || [];

  //       const updatedConsults = await Promise.all(
  //         consultationList.map(async (consultation) => {
  //           let doctorInfo = {
  //             name: "Unknown",
  //             qualification: "",
  //             prescriberNumber: "",
  //             signature: "",
  //           };

  //           // Fetch doctor info
  //           if (consultation.doctorId) {
  //             try {
  //               const docRes = await fetch(`${BASE_URL}/doctor-requests/getOneById/${consultation.doctorId}`);
  //               const docJson = await docRes.json();
  //               if (docJson.state) {
  //                 const { name, qualification, prescriberNumber, signature } = docJson.data;
  //                 doctorInfo = { name, qualification, prescriberNumber, signature };
  //                 const alertShown = localStorage.getItem(`alertShown_${consultation._id}`);
  //                 if (!alertShown) {
  //                   Swal.fire({
  //                     icon: "success",
  //                     title: "Doctor Assigned",
  //                     text: `Dr. ${name} has been assigned to your consultation.`,
  //                     timer: 3000,
  //                     showConfirmButton: false,
  //                   });
  //                   localStorage.setItem(`alertShown_${consultation._id}`, "true");
  //                 }
  //               }
  //             } catch {
  //               console.warn("Failed to fetch doctor info");
  //             }
  //           }

  //           // Fetch medicine names
  //           const medicinesWithNames = await Promise.all(
  //             (consultation.medicines || []).map(async (med) => {
  //               const name = await fetchMedicineName(med.medicine_id);
  //               return { ...med, medicineName: name };
  //             })
  //           );

  //           // Fetch total invoice amount
  //           let totalAmount = 0;
  //           if (consultation.billCodes?.length > 0) {
  //             for (const billCode of consultation.billCodes) {
  //               try {
  //                 const invoiceRes = await fetch(`${BASE_URL}/billing/getOneById/${billCode}`);
  //                 const invoiceData = await invoiceRes.json();
  //                 if (invoiceData?.state && invoiceData.total_amount) {
  //                   totalAmount += parseFloat(invoiceData.total_amount);
  //                 }
  //               } catch {
  //                 console.warn(`Invoice fetch failed for billCode: ${billCode}`);
  //               }
  //             }
  //           }

  //           return {
  //             ...consultation,
  //             doctorInfo,
  //             medicines: medicinesWithNames,
  //             doctorName: doctorInfo.name,
  //             total_amount: totalAmount.toFixed(2),
  //           };
  //         })
  //       );

  //       setConsultations(updatedConsults);
  //       localStorage.setItem("patientConsultations", JSON.stringify(updatedConsults));
  //     } catch (err) {
  //       console.error("Error fetching consultations:", err);
  //       setError(err.message || "Something went wrong");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchConsultations();
  // }, [patientId]);


// Inside PatientHistory component's useEffect
useEffect(() => {
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      if (!patientId) throw new Error("Patient ID not found");

      const response = await fetch(`${BASE_URL}/consultations/getConsulationByPatient/${patientId}`);
      const result = await response.json();
      const consultationList = result.data || [];

      const updatedConsults = await Promise.all(
        consultationList.map(async (consultation) => {
          let doctorInfo = {
            name: "Unknown",
            qualification: "",
            prescriberNumber: "",
            signature: "",
          };

          // Fetch doctor info
          if (consultation.doctorId) {
            try {
              const docRes = await fetch(`${BASE_URL}/doctor-requests/getOneById/${consultation.doctorId}`);
              const docJson = await docRes.json();
              if (docJson.state) {
                const { name, qualification, prescriberNumber, signature } = docJson.data;
                doctorInfo = { name, qualification, prescriberNumber, signature };
                const alertShown = localStorage.getItem(`alertShown_${consultation._id}`);
                if (!alertShown) {
                  Swal.fire({
                    icon: "success",
                    title: "Doctor Assigned",
                    text: `Dr. ${name} has been assigned to your consultation.`,
                    timer: 3000,
                    showConfirmButton: false,
                  });
                  localStorage.setItem(`alertShown_${consultation._id}`, "true");
                }
              }
            } catch {
              console.warn("Failed to fetch doctor info");
            }
          }

          // Fetch medicine names
          const medicinesWithNames = await Promise.all(
            (consultation.medicines || []).map(async (med) => {
              const name = await fetchMedicineName(med.medicine_id);
              return { ...med, medicineName: name };
            })
          );

          // Fetch total invoice amount from billCodes
          let totalAmount = 0;
          if (consultation.billCodes?.length > 0) {
            for (const billCode of consultation.billCodes) {
              try {
                const invoiceRes = await fetch(`${BASE_URL}/billing/getOneById/${billCode}`);
                const invoiceData = await invoiceRes.json();
                if (invoiceData?.state && invoiceData.data?.amount) {
                  totalAmount += parseFloat(invoiceData.data.amount);
                }
              } catch {
                console.warn(`Invoice fetch failed for billCode: ${billCode}`);
              }
            }
          }

          return {
            ...consultation,
            doctorInfo,
            medicines: medicinesWithNames,
            doctorName: doctorInfo.name,
            total_amount: totalAmount.toFixed(2),
          };
        })
      );

      setConsultations(updatedConsults);
      localStorage.setItem("patientConsultations", JSON.stringify(updatedConsults));
    } catch (err) {
      console.error("Error fetching consultations:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  fetchConsultations();
}, [patientId]);


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

  if (error)
    return (
      <div className="mt-3">
        <Alert color="danger">Error: {error}</Alert>
      </div>
    );

  return (
    <Container fluid style={{ paddingTop: "50px" }}>
      <Row>
        <Col md={6}>
          {consultations.length > 0 ? (
            consultations.map((consult) => (
              <div key={consult._id} className="mb-3">
                <div
                  onClick={() => toggleConsultation(consult._id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h6 className="mb-0">Doctor: {consult.doctorName || "Unknown"}</h6>
                  <span style={{ fontSize: "20px" }}>
                    {openConsultationIds.includes(consult._id) ? "▾" : "▸"}
                  </span>
                </div>

                {openConsultationIds.includes(consult._id) && (
                  <Card className="mb-4">
                    <CardBody bordered responsive style={{ tableLayout: "fixed", width: "100%" }}>
                      <div style={{ overflowX: "auto" }}>
                        <Table>
                          <tbody>
                            {[
                              { label: "DOCTOR", value: consult.doctorName },
                              { label: "NOTES", value: consult.notes || "N/A" },
                              {
                                label: "CONSULTATION DATE",
                                value: new Date(consult.createdAt).toLocaleString(),
                              },
                              { label: "TYPE", value: consult.type },
                              {
                                label: "REFER",
                                value: consult.refer?.length > 0
                                  ? consult.refer.map((ref, idx) => (
                                      <div key={idx} style={{ marginBottom: "8px" }}>
                                        <strong>Doctor Name:</strong> {ref.name}<br />
                                        <strong>Message:</strong> {ref.message}
                                      </div>
                                    ))
                                  : "N/A",
                              },
                              {
                                label: "INVESTIGATIONS",
                                value: consult.investigations?.length > 0
                                  ? consult.investigations.map((inv, idx) => (
                                      <div key={idx} style={{ marginBottom: "8px" }}>
                                        <strong>Type:</strong> {inv.investigationType}<br />
                                        <strong>Investigation:</strong> {inv.investigation}<br />
                                        <strong>Note:</strong> {inv.note}
                                      </div>
                                    ))
                                  : "N/A",
                              },
                              {
                                label: "CONDITIONS",
                                value: consult.conditions?.length > 0
                                  ? consult.conditions.map((cond, idx) => (
                                      <div key={idx} style={{ marginBottom: "8px" }}>
                                        <strong>Condition:</strong> {cond.condition}<br />
                                        <strong>Time:</strong> {cond.time}
                                      </div>
                                    ))
                                  : "N/A",
                              },
                              {
                                label: "MEDICATIONS",
                                value: consult.medications?.length > 0
                                  ? consult.medications.map((med, idx) => (
                                      <div key={idx} style={{ marginBottom: "8px" }}>
                                        <strong>Medicine:</strong> {med.medicineName}<br />
                                        <strong>Dosage:</strong> {med.dosage}<br />
                                        <strong>Time:</strong> {med.time}
                                      </div>
                                    ))
                                  : "N/A",
                              },
                              {
                                label: "BILLINGS",
                                value: consult.isCompleted && consult.total_amount
                                  ? `${consult.total_amount}`
                                  : "In Progress",
                              },
                              {
                                label: "CERTIFICATE",
                                value: consult.certificates?.length > 0
                                  ? consult.certificates.map((cert, idx) => (
                                      <div key={idx} style={{ marginBottom: "8px" }}>
                                        <strong>Type:</strong> {cert.certificationType}<br />
                                        <strong>Duration:</strong> {cert.startDate} - {cert.endDate}<br />
                                        <strong>Note:</strong> {cert.note}<br />
                                        <Button
                                          color="primary"
                                          size="sm"
                                          onClick={() => openCertificateModal(cert, consult.doctorInfo)}
                                          style={{ marginTop: 5 }}
                                        >
                                          View Certificate
                                        </Button>
                                      </div>
                                    ))
                                  : "N/A",
                              },
                            ].map((row, index) => (
                              <tr key={index}>
                                <td><strong>{row.label}</strong></td>
                                <td>{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            ))
          ) : (
            <p>No consultation history available.</p>
          )}
        </Col>
      </Row>
      <CertificateModal {...modalData} onClose={closeCertificateModal} />
    </Container>
  );
};

export default PatientHistory;

