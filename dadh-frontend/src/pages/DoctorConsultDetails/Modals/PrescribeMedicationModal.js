// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, ListGroup, Row, Col } from "react-bootstrap";
// import jsPDF from "jspdf";

// const PrescribeMedicationModal = ({ isOpen, onClose, consultationId }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [medicines, setMedicines] = useState([]);
//   const [filteredMeds, setFilteredMeds] = useState([]);
//   const [selectedMedication, setSelectedMedication] = useState(null);
//   const [dose, setDose] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [frequency, setFrequency] = useState("");
//   const [duration, setDuration] = useState("");
//   const [instructions, setInstructions] = useState("");

//   const consultation_Id = localStorage.getItem("consultationId");
//   const doctorId = localStorage.getItem("sendBirdUserId");
//   const doctorName = localStorage.getItem("doctorName") || "Doctor";

//   useEffect(() => {
//     const getMedicines = async () => {
//       if (!isOpen) return;
//       try {
//         const response = await fetch(`http://localhost:5001/api/medicines/getAll`);
//         const data = await response.json();
//         if (response.ok) setMedicines(data.data);
//       } catch (err) {
//         console.error("Error fetching medicines:", err);
//       }
//     };

//     getMedicines();
//   }, [isOpen]);

//   useEffect(() => {
//     setFilteredMeds(
//       searchTerm
//         ? medicines.filter(med =>
//           med.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//         : []
//     );
//   }, [searchTerm, medicines]);

//   const generatePDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text("Prescription Summary", 20, 20);

//     doc.setFontSize(12);
//     doc.text(`Medicine: ${selectedMedication?.medicineName}`, 20, 40);
//     doc.text(`Dose: ${dose}`, 20, 50);
//     doc.text(`Quantity: ${quantity}`, 20, 60);
//     doc.text(`Frequency: ${frequency}`, 20, 70);
//     doc.text(`Duration: ${duration}`, 20, 80);
//     doc.text("Instructions:", 20, 90);
//     doc.text(instructions || "None", 20, 100, { maxWidth: 170 });

//     doc.save("Prescription.pdf");
//   };

//   const handleSubmit = async () => {
//     if (
//       !selectedMedication ||
//       !dose ||
//       !quantity ||
//       !frequency ||
//       !duration ||
//       !instructions
//     ) {
//       return;
//     }

//     const prescriptionData = {
//       medicine_id: selectedMedication.medicineName,
//       dose,
//       quantity,
//       frequency,
//       duration,
//       instruction: instructions,
//     };

//     const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

//     try {
//       const response = await fetch(
//         `${REACT_APP_BACKEND_URL}/consultations/prescribtion/add/${consultation_Id}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(prescriptionData),
//         }
//       );

//       const data = await response.json();
//       if (response.ok) {
//         console.log("Prescription added successfully:", data);

//         // 👉 Generate PDF
//         generatePDF();

//         // 👉 Send SMS after prescription
//         await fetch(`http://localhost:5001/notification/sms`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             to: "+923460329743", // ✅ E.164 format
//             body: `Prescription for ${selectedMedication.medicineName} has been created by ${doctorName}.`,
//           }),
//         });

//         onClose();
//       }
//     } catch (error) {
//       console.error("Error adding prescription:", error);
//     }
//   };


//   return (
//     <Modal show={isOpen} onHide={onClose} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>Prescribe Medication</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <div className="d-flex">
//           <div style={{ flex: 1, marginRight: "20px" }}>
//             <Form.Group className="mb-3">
//               <Form.Label>Search Medication</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Search a medication"
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//               />
//             </Form.Group>

//             {filteredMeds.length > 0 && (
//               <ListGroup className="mb-3">
//                 {filteredMeds.map((med) => (
//                   <ListGroup.Item
//                     key={med.medicineName}
//                     action
//                     onClick={() => {
//                       setSelectedMedication(med);
//                       setSearchTerm("");
//                       setFilteredMeds([]);
//                     }}
//                   >
//                     {med.medicineName}
//                   </ListGroup.Item>
//                 ))}
//               </ListGroup>
//             )}

//             {selectedMedication && (
//               <p>
//                 <strong>Selected Medication:</strong> {selectedMedication.medicineName}
//               </p>
//             )}
//           </div>

//           <div style={{ flex: 1 }}>
//             <Row className="mb-3">
//               <Col>
//                 <Form.Label>Dose</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter dose"
//                   value={dose}
//                   onChange={e => setDose(e.target.value)}
//                 />
//               </Col>
//               <Col>
//                 <Form.Label>Quantity</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter quantity"
//                   value={quantity}
//                   onChange={e => setQuantity(e.target.value)}
//                 />
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col>
//                 <Form.Label>Frequency</Form.Label>
//                 <Form.Control
//                   as="select"
//                   value={frequency}
//                   onChange={e => setFrequency(e.target.value)}
//                 >
//                   <option value="">Select frequency</option>
//                   <option value="Once a day">Once a day</option>
//                   <option value="Twice a day">Twice a day</option>
//                   <option value="Three times a day">Three times a day</option>
//                 </Form.Control>
//               </Col>
//               <Col>
//                 <Form.Label>Duration</Form.Label>
//                 <Form.Control
//                   as="select"
//                   value={duration}
//                   onChange={e => setDuration(e.target.value)}
//                 >
//                   <option value="">Select duration</option>
//                   <option value="3 days">3 days</option>
//                   <option value="5 days">5 days</option>
//                   <option value="1 week">1 week</option>
//                 </Form.Control>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>Instructions (Optional)</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 placeholder="Enter additional instructions"
//                 value={instructions}
//                 onChange={e => setInstructions(e.target.value)}
//               />
//             </Form.Group>
//           </div>
//         </div>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handleSubmit}>
//           Prescribe
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default PrescribeMedicationModal;
