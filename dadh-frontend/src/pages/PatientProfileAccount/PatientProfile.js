// // import React, { useState, useEffect } from "react";
// // import {
// //   Spinner, Table, Card, CardBody, Button, Container,
// //   Row, Col, CardTitle, Input
// // } from "reactstrap";
// // import { useNavigate, useLocation } from "react-router-dom";

// // const PatientProfile = () => {
// //   const [showFamilyIndex, setShowFamilyIndex] = useState(null);
// //   const [patientData, setPatientData] = useState({});
// //   const [editedPatient, setEditedPatient] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [familyMembers, setFamilyMembers] = useState([]);
// //   const [editedFamily, setEditedFamily] = useState({});
// //   const [error, setError] = useState(null);
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const BASE_URL = "http://localhost:5001/api";
// //   const passedId = location.state?.patientId;
// //   const [patientId, setPatientId] = useState(() => passedId || localStorage.getItem("PatientId"));
// //   const [showPatient, setShowPatient] = useState(false);
// //   const [editPatientMode, setEditPatientMode] = useState(false);
// //   const [editFamilyMode, setEditFamilyMode] = useState({});

// //   useEffect(() => {
// //     const handleStorageChange = () => {
// //       const newId = localStorage.getItem("PatientId");
// //       if (newId !== patientId) {
// //         setPatientId(newId);
// //       }
// //     };
// //     window.addEventListener("storage", handleStorageChange);
// //     return () => window.removeEventListener("storage", handleStorageChange);
// //   }, [patientId]);



// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (!patientId) {
// //         setError("Patient ID not found.");
// //         setLoading(false);
// //         return;
// //       }
// //       try {
// //         const res = await fetch(`${BASE_URL}/patient/auth/getOneById/${patientId}`);
// //         const json = await res.json();
// //         if (!json.state || !json.data) throw new Error("Failed to fetch patient data.");
// //         setPatientData(json.data);
// //         setEditedPatient(json.data);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error("Error fetching data:", err);
// //         setError(`Error fetching patient data: ${err.message || err}`);
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, [patientId]);

// //   useEffect(() => {
// //     const fetchFamilyMembers = async () => {
// //       try {
// //         const res = await fetch(`${BASE_URL}/patient/auth/getAllFamilyMembers`, {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ medicareNumber: patientData.medicareNumber })
// //         });
// //         const json = await res.json();
// //         if (!json.state || !json.data) throw new Error("Failed to fetch family members.");
// //         const members = json.data.filter(p => p._id !== patientId);
// //         setFamilyMembers(members);
// //         const initialEdits = {};
// //         members.forEach(m => initialEdits[m._id] = { ...m });
// //         setEditedFamily(initialEdits);
// //       } catch (err) {
// //         console.error("Error fetching family members:", err);
// //       }
// //     };
// //     if (patientData.medicareNumber) fetchFamilyMembers();
// //   }, [patientData]);

// //   const togglePatient = () => setShowPatient(prev => !prev);
// //   const toggleFamily = (index) => setShowFamilyIndex(prev => (prev === index ? null : index));

// //   const handleInputChange = (field, value) => {
// //     setEditedPatient(prev => ({ ...prev, [field]: value }));
// //   };

// //   const handleFamilyInputChange = (id, field, value) => {
// //     setEditedFamily(prev => ({
// //       ...prev,
// //       [id]: {
// //         ...prev[id],
// //         [field]: value,
// //       }
// //     }));
// //   };

// //   const handleSavePatient = () => {
// //     // TODO: Send editedPatient to backend
// //     setPatientData(editedPatient);
// //     setEditPatientMode(false);
// //   };

// //   const handleSaveFamily = (id) => {
// //     // TODO: Send editedFamily[id] to backend
// //     const updated = familyMembers.map(m => m._id === id ? editedFamily[id] : m);
// //     setFamilyMembers(updated);
// //     setEditFamilyMode(prev => ({ ...prev, [id]: false }));
// //   };

// //   if (loading) {
// //     return (
// //       <div className="text-center mt-5">
// //         <Spinner color="primary" />
// //         <p>Loading patient data...</p>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return <div className="text-center text-danger mt-5"><p>Error: {error}</p></div>;
// //   }

// //   return (
// //     <Container fluid style={{ paddingTop: "50px" }}>
// //       <Row>
// //         {/* Patient Info */}
// //         <Col md={6}>
// //           <div
// //             onClick={togglePatient}
// //             style={{
// //               cursor: "pointer",
// //               backgroundColor: "#007bff",
// //               color: "white",
// //               padding: "10px 15px",
// //               borderRadius: "5px",
// //               display: "flex",
// //               justifyContent: "space-between",
// //               alignItems: "center",
// //             }}
// //           >
// //             <h6 className="mb-0">{patientData.name || "N/A"} Patient Personal Info</h6>
// //             <span style={{ fontSize: "20px" }}>{showPatient ? "▾" : "▸"}</span>
// //           </div>

// //           {showPatient && (
// //             <Card className="mb-4">
// //               <CardBody bordered responsive className="mt-3" style={{ tableLayout: "fixed", width: "100%" }}>
// //                 <CardTitle tag="h5">Patient Personal Information</CardTitle>
// //                 <div style={{ marginTop: "-28px", textAlign: "right" }}>
// //                   <Button
// //                     color="primary"
// //                     onClick={() => setEditPatientMode(prev => !prev)}
// //                   >
// //                     {editPatientMode ? "Cancel" : "Edit"}
// //                   </Button>
// //                 </div>

// //                 <div style={{ overflowX: "auto" }}>
// //                   <Table>
// //                     <tbody>
// //                       {[
// //                         "name", "email", "phone", "gender", "DOB",
// //                         "medicareNumber", "city", "state", "zipCode", "address"
// //                       ].map((field) => (
// //                         <tr key={field}>
// //                           <td><strong>{field.toUpperCase()}</strong></td>
// //                           <td>
// //                             {editPatientMode ? (
// //                               <Input
// //                                 type={field === "DOB" ? "date" : "text"}
// //                                 style={{ width: "100%", minWidth: 0 }}
// //                                 value={
// //                                   field === "DOB"
// //                                     ? new Date(editedPatient.DOB).toISOString().split("T")[0]
// //                                     : editedPatient[field] || ""
// //                                 }
// //                                 onChange={(e) => handleInputChange(field, e.target.value)}
// //                               />
// //                             ) : (
// //                               field === "DOB"
// //                                 ? (patientData.DOB ? new Date(patientData.DOB).toLocaleDateString() : "N/A")
// //                                 : patientData[field] || "N/A"
// //                             )}
// //                           </td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                   </Table>
// //                 </div>

// //                 {editPatientMode && (
// //                   <div className="text-right">
// //                     <Button color="success" onClick={handleSavePatient}>Save</Button>
// //                   </div>
// //                 )}
// //               </CardBody>
// //             </Card>
// //           )}
// //         </Col>

// //         {/* Family Members */}
// //         <Col md={6}>
// //           {familyMembers.map((member, index) => (
// //             <div key={member._id || index} style={{ marginBottom: "20px" }}>
// //               <div
// //                 onClick={() => toggleFamily(index)}
// //                 style={{
// //                   cursor: "pointer",
// //                   backgroundColor: "#007bff",
// //                   color: "white",
// //                   padding: "10px 15px",
// //                   borderRadius: "5px",
// //                   display: "flex",
// //                   justifyContent: "space-between",
// //                   alignItems: "center",
// //                 }}
// //               >
// //                 <h6 className="mb-0">
// //                   {member.name || "N/A"} Patient Family Info
// //                 </h6>
// //                 <span style={{ fontSize: "20px" }}>
// //                   {showFamilyIndex === index ? "▾" : "▸"}
// //                 </span>
// //               </div>

// //               {showFamilyIndex === index && (
// //                 <Card className="mb-4">
// //                   <CardBody bordered responsive className="mt-3" style={{ tableLayout: "fixed", width: "100%" }}>
// //                     <CardTitle tag="h5">Patient Family Information</CardTitle>

// //                     <div style={{ marginTop: "-28px", textAlign: "right" }}>
// //                       <Button
// //                         color="primary"
// //                         onClick={() => setEditFamilyMode(prev => !prev)}
// //                       >
// //                         {editPatientMode ? "Cancel" : "Edit"}
// //                       </Button>
// //                     </div>
// //                     <div style={{ overflowX: "auto", marginBottom: "15px" }}>
// //                       <Table>
// //                         <tbody>
// //                           {[
// //                             "name", "email", "phone", "gender", "DOB",
// //                             "medicareNumber", "city", "state", "zipCode", "address"
// //                           ].map((field) => (
// //                             <tr key={field}>
// //                               <td style={{ width: "30%" }}>
// //                                 <strong>{field.toUpperCase()}</strong>
// //                               </td>
// //                               <td>
// //                                 {editFamilyMode[member._id] ? (
// //                                   <Input
// //                                     type={field === "DOB" ? "date" : "text"}
// //                                     style={{ width: "100%", minWidth: 0 }}
// //                                     value={
// //                                       field === "DOB"
// //                                         ? new Date(editedFamily[member._id][field]).toISOString().split("T")[0]
// //                                         : editedFamily[member._id][field] || ""
// //                                     }
// //                                     onChange={(e) =>
// //                                       handleFamilyInputChange(member._id, field, e.target.value)
// //                                     }
// //                                   />
// //                                 ) : (
// //                                   field === "DOB"
// //                                     ? (member.DOB ? new Date(member.DOB).toLocaleDateString() : "N/A")
// //                                     : member[field] || "N/A"
// //                                 )}
// //                               </td>
// //                             </tr>
// //                           ))}
// //                         </tbody>
// //                       </Table>
// //                     </div>

// //                     {editFamilyMode[member._id] && (
// //                       <div className="text-right">
// //                         <Button
// //                           color="success"
// //                           onClick={() => handleSaveFamily(member._id)}
// //                         >
// //                           Save
// //                         </Button>
// //                       </div>
// //                     )}
// //                   </CardBody>
// //                 </Card>
// //               )}
// //             </div>
// //           ))}
// //         </Col>

// //       </Row>
// //     </Container>
// //   );

// // };

// // export default PatientProfile;


// import React, { useState, useEffect } from "react";
// import {
//   Spinner, Card, CardBody, Button, Container,
//   FormGroup, Label, Input
// } from "reactstrap";
// import { useNavigate, useLocation } from "react-router-dom";

// const PatientProfile = () => {
//   const [patientData, setPatientData] = useState({});
//   const [editedPatient, setEditedPatient] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [familyMembers, setFamilyMembers] = useState([]);
//   const [editedFamily, setEditedFamily] = useState({});
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const BASE_URL = "http://localhost:5001/api";
//   const passedId = location.state?.patientId;
//   const [patientId, setPatientId] = useState(() => passedId || localStorage.getItem("PatientId"));
//   const [editPatientMode, setEditPatientMode] = useState(false);
//   const [editFamilyMode, setEditFamilyMode] = useState({});
//   const [expandedSections, setExpandedSections] = useState({
//     patient: false,
//     family: {}
//   });

//   useEffect(() => {
//     const handleStorageChange = () => {
//       const newId = localStorage.getItem("PatientId");
//       if (newId !== patientId) {
//         setPatientId(newId);
//       }
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, [patientId]);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!patientId) {
//         setError("Patient ID not found.");
//         setLoading(false);
//         return;
//       }
//       try {
//         const res = await fetch(`${BASE_URL}/patient/auth/getOneById/${patientId}`);
//         const json = await res.json();
//         if (!json.state || !json.data) throw new Error("Failed to fetch patient data.");
//         setPatientData(json.data);
//         setEditedPatient(json.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(`Error fetching patient data: ${err.message || err}`);
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [patientId]);

//   useEffect(() => {
//     const fetchFamilyMembers = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/patient/auth/getAllFamilyMembers`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ medicareNumber: patientData.medicareNumber })
//         });
//         const json = await res.json();
//         if (!json.state || !json.data) throw new Error("Failed to fetch family members.");
//         const members = json.data.filter(p => p._id !== patientId);
//         setFamilyMembers(members);
//         const initialEdits = {};
//         members.forEach(m => initialEdits[m._id] = { ...m });
//         setEditedFamily(initialEdits);
//       } catch (err) {
//         console.error("Error fetching family members:", err);
//       }
//     };
//     if (patientData.medicareNumber) fetchFamilyMembers();
//   }, [patientData, patientId]);

//   const togglePatientSection = () => {
//     setExpandedSections(prev => ({
//       ...prev,
//       patient: !prev.patient
//     }));
//   };

//   const toggleFamilySection = (memberId) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       family: {
//         ...prev.family,
//         [memberId]: !prev.family[memberId]
//       }
//     }));
//   };

//   const handleInputChange = (field, value) => {
//     setEditedPatient(prev => ({ ...prev, [field]: value }));
//   };

//   const handleFamilyInputChange = (id, field, value) => {
//     setEditedFamily(prev => ({
//       ...prev,
//       [id]: {
//         ...prev[id],
//         [field]: value,
//       }
//     }));
//   };

//   const handleSavePatient = async () => {
//     try {
//       // TODO: Send editedPatient to backend
//       setPatientData(editedPatient);
//       setEditPatientMode(false);
//       console.log("Patient data saved:", editedPatient);
//     } catch (err) {
//       console.error("Error saving patient data:", err);
//     }
//   };

//   const handleSaveFamily = async (id) => {
//     try {
//       // TODO: Send editedFamily[id] to backend
//       const updated = familyMembers.map(m => m._id === id ? editedFamily[id] : m);
//       setFamilyMembers(updated);
//       setEditFamilyMode(prev => ({ ...prev, [id]: false }));
//       console.log("Family member data saved:", editedFamily[id]);
//     } catch (err) {
//       console.error("Error saving family member data:", err);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return "N/A";
//     }
//   };

//   const formatDateForInput = (dateString) => {
//     if (!dateString) return "";
//     try {
//       return new Date(dateString).toISOString().split("T")[0];
//     } catch {
//       return "";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center bg-gray-50 min-h-screen">
//         <div className="text-center">
//           <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
//           <p className="mt-3">Loading patient data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="d-flex justify-content-center align-items-center bg-gray-50 min-h-screen">
//         <div className="text-center text-danger">
//           <h4>Error</h4>
//           <p>{error}</p>
//           <Button color="primary" onClick={() => navigate("/")}>
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
//       <Container fluid style={{ maxWidth: 1200, marginTop: 50, marginBottom: 80 }}>
//         <div className="row">
//           {/* Patient Personal Information */}
//           <div className="col-md-6 mb-4">
//             <div className="bg-white shadow-lg rounded-3 p-4">
//               {/* Header */}
//               <div
//                 onClick={togglePatientSection}
//                 className="d-flex justify-content-between align-items-center p-3 mb-3"
//                 style={{
//                   cursor: "pointer",
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <h5 className="mb-0 fw-semibold">
//                   {patientData.name || "N/A"} - Patient Personal Info
//                 </h5>
//                 <span style={{ fontSize: "20px", fontWeight: "bold" }}>
//                   {expandedSections.patient ? "▾" : "▸"}
//                 </span>
//               </div>

//               {/* Content */}
//               {expandedSections.patient && (
//                 <Card>
//                   <CardBody>
//                     <div className="d-flex justify-content-between align-items-center mb-4">
//                       <h4 className="text-2xl fw-semibold mb-0">Patient Information</h4>
//                       <Button
//                         color={editPatientMode ? "secondary" : "primary"}
//                         onClick={() => setEditPatientMode(prev => !prev)}
//                       >
//                         {editPatientMode ? "Cancel" : "Edit"}
//                       </Button>
//                     </div>

//                     {/* Name */}
//                     <FormGroup>
//                       <Label for="name">Name</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="name"
//                           value={editedPatient.name || ""}
//                           onChange={(e) => handleInputChange("name", e.target.value)}
//                         />
//                       ) : (
//                         <Input value={patientData.name || "N/A"} disabled />
//                       )}
//                     </FormGroup>

//                     {/* Email */}
//                     <FormGroup>
//                       <Label for="email">Email</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="email"
//                           type="email"
//                           value={editedPatient.email || ""}
//                           onChange={(e) => handleInputChange("email", e.target.value)}
//                         />
//                       ) : (
//                         <Input value={patientData.email || "N/A"} disabled />
//                       )}
//                     </FormGroup>

//                     {/* Phone */}
//                     <FormGroup>
//                       <Label for="phone">Phone</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="phone"
//                           value={editedPatient.phone || ""}
//                           onChange={(e) => handleInputChange("phone", e.target.value)}
//                         />
//                       ) : (
//                         <Input value={patientData.phone || "N/A"} disabled />
//                       )}
//                     </FormGroup>

//                     {/* Gender */}
//                     <FormGroup>
//                       <Label for="gender">Gender</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="gender"
//                           type="select"
//                           value={editedPatient.gender || ""}
//                           onChange={(e) => handleInputChange("gender", e.target.value)}
//                         >
//                           <option value="">Select Gender</option>
//                           <option value="Male">Male</option>
//                           <option value="Female">Female</option>
//                           <option value="Other">Other</option>
//                         </Input>
//                       ) : (
//                         <Input value={patientData.gender || "N/A"} disabled />
//                       )}
//                     </FormGroup>

//                     {/* Date of Birth */}
//                     <FormGroup>
//                       <Label for="dob">Date of Birth</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="dob"
//                           type="date"
//                           value={formatDateForInput(editedPatient.DOB)}
//                           onChange={(e) => handleInputChange("DOB", e.target.value)}
//                         />
//                       ) : (
//                         <Input value={formatDate(patientData.DOB)} disabled />
//                       )}
//                     </FormGroup>

//                     {/* Medicare Number */}
//                     <FormGroup>
//                       <Label for="medicare">Medicare Number</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="medicare"
//                           value={editedPatient.medicareNumber || ""}
//                           onChange={(e) => handleInputChange("medicareNumber", e.target.value)}
//                         />
//                       ) : (
//                         <Input value={patientData.medicareNumber || "N/A"} disabled />
//                       )}
//                     </FormGroup>

//                     {/* Address */}
//                     <FormGroup>
//                       <Label for="address">Address</Label>
//                       {editPatientMode ? (
//                         <Input
//                           id="address"
//                           value={editedPatient.address || ""}
//                           onChange={(e) => handleInputChange("address", e.target.value)}
//                         />
//                       ) : (
//                         <Input value={patientData.address || "N/A"} disabled />
//                       )}
//                     </FormGroup>

//                     {/* City, State, Zip Code Row */}
//                     <div className="row">
//                       <div className="col-md-4">
//                         <FormGroup>
//                           <Label for="city">City</Label>
//                           {editPatientMode ? (
//                             <Input
//                               id="city"
//                               value={editedPatient.city || ""}
//                               onChange={(e) => handleInputChange("city", e.target.value)}
//                             />
//                           ) : (
//                             <Input value={patientData.city || "N/A"} disabled />
//                           )}
//                         </FormGroup>
//                       </div>
//                       <div className="col-md-4">
//                         <FormGroup>
//                           <Label for="state">State</Label>
//                           {editPatientMode ? (
//                             <Input
//                               id="state"
//                               value={editedPatient.state || ""}
//                               onChange={(e) => handleInputChange("state", e.target.value)}
//                             />
//                           ) : (
//                             <Input value={patientData.state || "N/A"} disabled />
//                           )}
//                         </FormGroup>
//                       </div>
//                       <div className="col-md-4">
//                         <FormGroup>
//                           <Label for="zipCode">Zip Code</Label>
//                           {editPatientMode ? (
//                             <Input
//                               id="zipCode"
//                               value={editedPatient.zipCode || ""}
//                               onChange={(e) => handleInputChange("zipCode", e.target.value)}
//                             />
//                           ) : (
//                             <Input value={patientData.zipCode || "N/A"} disabled />
//                           )}
//                         </FormGroup>
//                       </div>
//                     </div>

//                     {/* Save Button */}
//                     {editPatientMode && (
//                       <div className="text-start mt-3">
//                         <Button color="success" onClick={handleSavePatient}>
//                           Save Changes
//                         </Button>
//                       </div>
//                     )}
//                   </CardBody>
//                 </Card>
//               )}
//             </div>
//           </div>

//           {/* Family Members */}
//           <div className="col-md-6">
//             {familyMembers.length > 0 ? (
//               familyMembers.map((member) => (
//                 <div key={member._id} className="mb-4">
//                   <div className="bg-white shadow-lg rounded-3 p-4">
//                     {/* Header */}
//                     <div
//                       onClick={() => toggleFamilySection(member._id)}
//                       className="d-flex justify-content-between align-items-center p-3 mb-3"
//                       style={{
//                         cursor: "pointer",
//                         backgroundColor: "#28a745",
//                         color: "white",
//                         borderRadius: "8px",
//                       }}
//                     >
//                       <h5 className="mb-0 fw-semibold">
//                         {member.name || "N/A"} - Family Member Info
//                       </h5>
//                       <span style={{ fontSize: "20px", fontWeight: "bold" }}>
//                         {expandedSections.family[member._id] ? "▾" : "▸"}
//                       </span>
//                     </div>

//                     {/* Content */}
//                     {expandedSections.family[member._id] && (
//                       <Card>
//                         <CardBody>
//                           <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h4 className="text-2xl fw-semibold mb-0">Family Member Information</h4>
//                             <Button
//                               color={editFamilyMode[member._id] ? "secondary" : "primary"}
//                               onClick={() => setEditFamilyMode(prev => ({
//                                 ...prev,
//                                 [member._id]: !prev[member._id]
//                               }))}
//                             >
//                               {editFamilyMode[member._id] ? "Cancel" : "Edit"}
//                             </Button>
//                           </div>

//                           {/* Name */}
//                           <FormGroup>
//                             <Label for={`family-name-${member._id}`}>Name</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-name-${member._id}`}
//                                 value={editedFamily[member._id]?.name || ""}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "name", e.target.value)}
//                               />
//                             ) : (
//                               <Input value={member.name || "N/A"} disabled />
//                             )}
//                           </FormGroup>

//                           {/* Email */}
//                           <FormGroup>
//                             <Label for={`family-email-${member._id}`}>Email</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-email-${member._id}`}
//                                 type="email"
//                                 value={editedFamily[member._id]?.email || ""}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "email", e.target.value)}
//                               />
//                             ) : (
//                               <Input value={member.email || "N/A"} disabled />
//                             )}
//                           </FormGroup>

//                           {/* Phone */}
//                           <FormGroup>
//                             <Label for={`family-phone-${member._id}`}>Phone</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-phone-${member._id}`}
//                                 value={editedFamily[member._id]?.phone || ""}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "phone", e.target.value)}
//                               />
//                             ) : (
//                               <Input value={member.phone || "N/A"} disabled />
//                             )}
//                           </FormGroup>

//                           {/* Gender */}
//                           <FormGroup>
//                             <Label for={`family-gender-${member._id}`}>Gender</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-gender-${member._id}`}
//                                 type="select"
//                                 value={editedFamily[member._id]?.gender || ""}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "gender", e.target.value)}
//                               >
//                                 <option value="">Select Gender</option>
//                                 <option value="Male">Male</option>
//                                 <option value="Female">Female</option>
//                                 <option value="Other">Other</option>
//                               </Input>
//                             ) : (
//                               <Input value={member.gender || "N/A"} disabled />
//                             )}
//                           </FormGroup>

//                           {/* Date of Birth */}
//                           <FormGroup>
//                             <Label for={`family-dob-${member._id}`}>Date of Birth</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-dob-${member._id}`}
//                                 type="date"
//                                 value={formatDateForInput(editedFamily[member._id]?.DOB)}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "DOB", e.target.value)}
//                               />
//                             ) : (
//                               <Input value={formatDate(member.DOB)} disabled />
//                             )}
//                           </FormGroup>

//                           {/* Medicare Number */}
//                           <FormGroup>
//                             <Label for={`family-medicare-${member._id}`}>Medicare Number</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-medicare-${member._id}`}
//                                 value={editedFamily[member._id]?.medicareNumber || ""}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "medicareNumber", e.target.value)}
//                               />
//                             ) : (
//                               <Input value={member.medicareNumber || "N/A"} disabled />
//                             )}
//                           </FormGroup>

//                           {/* Address */}
//                           <FormGroup>
//                             <Label for={`family-address-${member._id}`}>Address</Label>
//                             {editFamilyMode[member._id] ? (
//                               <Input
//                                 id={`family-address-${member._id}`}
//                                 value={editedFamily[member._id]?.address || ""}
//                                 onChange={(e) => handleFamilyInputChange(member._id, "address", e.target.value)}
//                               />
//                             ) : (
//                               <Input value={member.address || "N/A"} disabled />
//                             )}
//                           </FormGroup>

//                           {/* City, State, Zip Code Row */}
//                           <div className="row">
//                             <div className="col-md-4">
//                               <FormGroup>
//                                 <Label for={`family-city-${member._id}`}>City</Label>
//                                 {editFamilyMode[member._id] ? (
//                                   <Input
//                                     id={`family-city-${member._id}`}
//                                     value={editedFamily[member._id]?.city || ""}
//                                     onChange={(e) => handleFamilyInputChange(member._id, "city", e.target.value)}
//                                   />
//                                 ) : (
//                                   <Input value={member.city || "N/A"} disabled />
//                                 )}
//                               </FormGroup>
//                             </div>
//                             <div className="col-md-4">
//                               <FormGroup>
//                                 <Label for={`family-state-${member._id}`}>State</Label>
//                                 {editFamilyMode[member._id] ? (
//                                   <Input
//                                     id={`family-state-${member._id}`}
//                                     value={editedFamily[member._id]?.state || ""}
//                                     onChange={(e) => handleFamilyInputChange(member._id, "state", e.target.value)}
//                                   />
//                                 ) : (
//                                   <Input value={member.state || "N/A"} disabled />
//                                 )}
//                               </FormGroup>
//                             </div>
//                             <div className="col-md-4">
//                               <FormGroup>
//                                 <Label for={`family-zipCode-${member._id}`}>Zip Code</Label>
//                                 {editFamilyMode[member._id] ? (
//                                   <Input
//                                     id={`family-zipCode-${member._id}`}
//                                     value={editedFamily[member._id]?.zipCode || ""}
//                                     onChange={(e) => handleFamilyInputChange(member._id, "zipCode", e.target.value)}
//                                   />
//                                 ) : (
//                                   <Input value={member.zipCode || "N/A"} disabled />
//                                 )}
//                               </FormGroup>
//                             </div>
//                           </div>

//                           {/* Save Button */}
//                           {editFamilyMode[member._id] && (
//                             <div className="text-start mt-3">
//                               <Button color="success" onClick={() => handleSaveFamily(member._id)}>
//                                 Save Changes
//                               </Button>
//                             </div>
//                           )}
//                         </CardBody>
//                       </Card>
//                     )}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="bg-white shadow-lg rounded-3 p-4 text-center">
//                 <h5>No Family Members Found</h5>
//                 <p className="text-muted">No family members are associated with this patient.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </Container>
//     </div>
//   );
// };

// export default PatientProfile;

import React, { useState, useEffect } from "react";
import {
  Spinner, Card, CardBody, Button, Container,
  FormGroup, Label, Input
} from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";

const PatientProfile = () => {
  const [patientData, setPatientData] = useState({});
  const [editedPatient, setEditedPatient] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPatientMode, setEditPatientMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = "http://localhost:5001/api";
  const passedId = location.state?.patientId;
  const [patientId, setPatientId] = useState(() => passedId || localStorage.getItem("PatientId"));

  useEffect(() => {
    const handleStorageChange = () => {
      const newId = localStorage.getItem("PatientId");
      if (newId !== patientId) {
        setPatientId(newId);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [patientId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) {
        setError("Patient ID not found.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/patient/auth/getOneById/${patientId}`);
        const json = await res.json();
        if (!json.state || !json.data) throw new Error("Failed to fetch patient data.");
        setPatientData(json.data);
        setEditedPatient(json.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Error fetching patient data: ${err.message || err}`);
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleInputChange = (field, value) => {
    setEditedPatient(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePatient = async () => {
    try {
      // TODO: Send editedPatient to backend
      setPatientData(editedPatient);
      setEditPatientMode(false);
      console.log("Patient data saved:", editedPatient);
    } catch (err) {
      console.error("Error saving patient data:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-gray-50 min-h-screen">
        <div className="text-center text-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button color="primary" onClick={() => navigate("/")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <Container fluid style={{ maxWidth: 1200, marginTop: 50, marginBottom: 80 }}>
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="bg-white shadow-lg rounded-3 p-4">
              <h5 className="mb-4 fw-semibold text-primary">
                {patientData.name || "N/A"} - Patient Personal Info
              </h5>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-2xl fw-semibold mb-0">Patient Information</h4>
                    <Button
                      color={editPatientMode ? "secondary" : "primary"}
                      onClick={() => setEditPatientMode(prev => !prev)}
                    >
                      {editPatientMode ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  {/* Name */}
                  <FormGroup>
                    <Label for="name">Name</Label>
                    {editPatientMode ? (
                      <Input
                        id="name"
                        value={editedPatient.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    ) : (
                      <Input value={patientData.name || "N/A"} disabled />
                    )}
                  </FormGroup>

                  {/* Email */}
                  <FormGroup>
                    <Label for="email">Email</Label>
                    {editPatientMode ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedPatient.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    ) : (
                      <Input value={patientData.email || "N/A"} disabled />
                    )}
                  </FormGroup>

                  {/* Phone */}
                  <FormGroup>
                    <Label for="phone">Phone</Label>
                    {editPatientMode ? (
                      <Input
                        id="phone"
                        value={editedPatient.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    ) : (
                      <Input value={patientData.phone || "N/A"} disabled />
                    )}
                  </FormGroup>

                  {/* Gender */}
                  <FormGroup>
                    <Label for="gender">Gender</Label>
                    {editPatientMode ? (
                      <Input
                        id="gender"
                        value={editedPatient.gender || ""}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                      />
                    ) : (
                      <Input value={patientData.gender || "N/A"} disabled />
                    )}
                  </FormGroup>

                  {/* DOB */}
                  <FormGroup>
                    <Label for="dob">Date of Birth</Label>
                    {editPatientMode ? (
                      <Input
                        id="dob"
                        type="date"
                        value={formatDateForInput(editedPatient.DOB)}
                        onChange={(e) => handleInputChange("DOB", e.target.value)}
                      />
                    ) : (
                      <Input value={formatDate(patientData.DOB)} disabled />
                    )}
                  </FormGroup>

                  {/* Medicare Number */}
                  <FormGroup>
                    <Label for="medicare">Medicare Number</Label>
                    {editPatientMode ? (
                      <Input
                        id="medicare"
                        value={editedPatient.medicareNumber || ""}
                        onChange={(e) => handleInputChange("medicareNumber", e.target.value)}
                      />
                    ) : (
                      <Input value={patientData.medicareNumber || "N/A"} disabled />
                    )}
                  </FormGroup>

                  {/* Address */}
                  <FormGroup>
                    <Label for="address">Address</Label>
                    {editPatientMode ? (
                      <Input
                        id="address"
                        value={editedPatient.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    ) : (
                      <Input value={patientData.address || "N/A"} disabled />
                    )}
                  </FormGroup>

                  <div className="row">
                    <div className="col-md-4">
                      <FormGroup>
                        <Label for="city">City</Label>
                        {editPatientMode ? (
                          <Input
                            id="city"
                            value={editedPatient.city || ""}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                          />
                        ) : (
                          <Input value={patientData.city || "N/A"} disabled />
                        )}
                      </FormGroup>
                    </div>
                    <div className="col-md-4">
                      <FormGroup>
                        <Label for="state">State</Label>
                        {editPatientMode ? (
                          <Input
                            id="state"
                            value={editedPatient.state || ""}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                          />
                        ) : (
                          <Input value={patientData.state || "N/A"} disabled />
                        )}
                      </FormGroup>
                    </div>
                    <div className="col-md-4">
                      <FormGroup>
                        <Label for="zipCode">Zip Code</Label>
                        {editPatientMode ? (
                          <Input
                            id="zipCode"
                            value={editedPatient.zipCode || ""}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          />
                        ) : (
                          <Input value={patientData.zipCode || "N/A"} disabled />
                        )}
                      </FormGroup>
                    </div>
                  </div>

                  {editPatientMode && (
                    <div className="text-start mt-3">
                      <Button color="success" onClick={handleSavePatient}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PatientProfile;
  