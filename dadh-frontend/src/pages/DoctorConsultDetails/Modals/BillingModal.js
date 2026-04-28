// import React, { useEffect, useState } from "react";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   FormGroup,
//   Label,
//   Input,
//   ListGroup,
//   ListGroupItem,
//   Row,
//   Col,
// } from "reactstrap";
// import { useNavigate } from "react-router-dom";

// const BillingModal = ({ show, handleClose }) => {
//   const [billings, setBillings] = useState([]);
//   const [selectedBillings, setSelectedBillings] = useState([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [customTotal, setCustomTotal] = useState(0);
//   const [activeConsultationId, setActiveConsultationId] = useState(null);
//   const [patientId, setPatientId] = useState(null);

//   const doctorId = localStorage.getItem("sendBirdUserId");
//   const consultationId = localStorage.getItem("consultationId");
//   const REACT_APP_BACKEND_URL = "http://localhost:5001/api";
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!show) return;

//     const storedData = JSON.parse(localStorage.getItem("data"));
//     const consultationIdFromStorage = storedData?.data?.activeConsultationId;

//     if (consultationIdFromStorage) {
//       setActiveConsultationId(consultationIdFromStorage);
//     }

//     const getBillings = async () => {
//       try {
//         const response = await fetch(`${REACT_APP_BACKEND_URL}/billing/getAllBilling`);
//         const data = await response.json();
//         if (response.ok) setBillings(data.data);
//       } catch (err) {
//         console.error("Error fetching Billings:", err);
//       }
//     };

//     getBillings();
//   }, [show]);

//   useEffect(() => {
//     if (!activeConsultationId) return;

//     const getPatientidFromConsultation = async () => {
//       try {
//         const response = await fetch(
//           `${REACT_APP_BACKEND_URL}/consultations/getOneById/${activeConsultationId}`
//         );
//         const data = await response.json();
//         if (response.ok) {
//           setPatientId(data.data.patientId);
//         }
//       } catch (err) {
//         console.error("Error fetching PatientId:", err);
//       }
//     };

//     getPatientidFromConsultation();
//   }, [activeConsultationId]);

//   const handleSelectBilling = async billing => {
//     const isSelected = selectedBillings.some(b => b._id === billing._id);
//     let updatedBillings;

//     try {
//       if (isSelected) {
//         updatedBillings = selectedBillings.filter(b => b._id !== billing._id);
//         await fetch(`${REACT_APP_BACKEND_URL}/bill/remove/${consultationId}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ bill_id: billing._id }),
//         });
//       } else {
//         updatedBillings = [...selectedBillings, billing];
//         await fetch(`${REACT_APP_BACKEND_URL}/bill/add/${consultationId}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ bill_id: billing._id }),
//         });
//       }

//       setSelectedBillings(updatedBillings);
//       const newTotal = updatedBillings.reduce((sum, b) => sum + b.amount, 0);
//       setTotalAmount(newTotal);
//       setCustomTotal(newTotal);
//     } catch (err) {
//       console.error("Error updating billing selection:", err);
//     }
//   };

//   const handleEndConsultation = async () => {
//     if (!activeConsultationId || !doctorId || !patientId) return;

//     try {
//       const res = await fetch(
//         `${REACT_APP_BACKEND_URL}/billing/end/consultation/${activeConsultationId}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             doctor_id: doctorId,
//             patientId: patientId,
//           }),
//         }
//       );
//       const result = await res.json();

//       if (result.state) {
//         // ✅ Fetch updated consultations and update localStorage
//         const updatedRes = await fetch(
//           `${REACT_APP_BACKEND_URL}/consultations/getConsulationByPatient/${patientId}`
//         );
//         const updatedData = await updatedRes.json();
//         const updatedConsultations = updatedData?.data || [];

//         localStorage.setItem("patientConsultations", JSON.stringify(updatedConsultations));
//         window.dispatchEvent(new Event("storage"));


        
//         // ✅ Navigate back
//         handleClose();
//         navigate("/doctor");
//         localStorage.removeItem("consultationId");
//       } else {
//         console.error("Consultation not ended properly", result.message);
//       }
//     } catch (err) {
//       console.error("Error ending consultation:", err);
//     }
//   };




//   return (
//     <Modal isOpen={show} toggle={handleClose} centered>
//       <ModalHeader toggle={handleClose}>Billing Information</ModalHeader>
//       <ModalBody>
//         <Row>
//           <Col sm="6">
//             <h6>Bill Codes</h6>
//             <ListGroup flush>
//               {billings.map(billing => (
//                 <ListGroupItem key={billing._id} className="p-1">
//                   <FormGroup check>
//                     <Label check>
//                       <Input
//                         type="checkbox"
//                         checked={selectedBillings.some(
//                           b => b._id === billing._id
//                         )}
//                         onChange={() => handleSelectBilling(billing)}
//                       />
//                       {billing.billCode} - ${billing.amount}
//                     </Label>
//                   </FormGroup>
//                 </ListGroupItem>
//               ))}
//             </ListGroup>
//           </Col>
//           <Col sm="6">
//             <h6>Selected</h6>
//             <ListGroup flush>
//               {selectedBillings.map((billing, index) => (
//                 <ListGroupItem key={billing._id} className="p-1">
//                   {index + 1}. {billing.billCode} - ${billing.amount}
//                 </ListGroupItem>
//               ))}
//             </ListGroup>
//           </Col>
//         </Row>
//         <hr />
//         <Row>
//           <Col>
//             <h6>Total:</h6>
//           </Col>
//           <Col className="text-end">
//             <Input
//               type="number"
//               value={customTotal}
//               onChange={e => setCustomTotal(parseFloat(e.target.value) || 0)}
//             />
//           </Col>
//         </Row>
//       </ModalBody>
//       <ModalFooter>
//         <Button color="secondary" onClick={handleClose}>
//           Close
//         </Button>
//         <Button color="primary" onClick={handleEndConsultation}>
//          Save Billing
//         </Button>
//       </ModalFooter>
//     </Modal>
//   );
// };

// export default BillingModal;


import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

const BillingModal = ({ show, handleClose }) => {
  const [billings, setBillings] = useState([]);
  const [selectedBillings, setSelectedBillings] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customTotal, setCustomTotal] = useState(0);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [patientId, setPatientId] = useState(null);

  const doctorId = localStorage.getItem("sendBirdUserId");
  const consultationId = localStorage.getItem("consultationId");
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";
  const navigate = useNavigate();

  useEffect(() => {
    if (!show) return;

    const storedData = JSON.parse(localStorage.getItem("data"));
    const consultationIdFromStorage = storedData?.data?.activeConsultationId;

    if (consultationIdFromStorage) {
      setActiveConsultationId(consultationIdFromStorage);
    }

    const getBillings = async () => {
      try {
        const response = await fetch(`${REACT_APP_BACKEND_URL}/billing/getAllBilling`);
        const data = await response.json();
        if (response.ok) setBillings(data.data);
      } catch (err) {
        console.error("Error fetching Billings:", err);
      }
    };

    getBillings();
  }, [show]);

  useEffect(() => {
    if (!activeConsultationId) return;

    const getPatientidFromConsultation = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_BACKEND_URL}/consultations/getOneById/${activeConsultationId}`
        );
        const data = await response.json();
        if (response.ok) {
          setPatientId(data.data.patientId);
        }
      } catch (err) {
        console.error("Error fetching PatientId:", err);
      }
    };

    getPatientidFromConsultation();
  }, [activeConsultationId]);

  const handleSelectBilling = billing => {
    const isSelected = selectedBillings.some(b => b._id === billing._id);
    const updatedBillings = isSelected
      ? selectedBillings.filter(b => b._id !== billing._id)
      : [...selectedBillings, billing];

    setSelectedBillings(updatedBillings);

    const newTotal = updatedBillings.reduce((sum, b) => sum + b.amount, 0);
    setTotalAmount(newTotal);
    setCustomTotal(newTotal);
  };

  const handleEndConsultation = async () => {
    if (!activeConsultationId) return;

    try {
      // Consultation is already ended by the Stop button — just save bill codes
      for (const billing of selectedBillings) {
        await fetch(`${REACT_APP_BACKEND_URL}/bill/add/${activeConsultationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bill_id: billing._id }),
        });
      }

      localStorage.removeItem("consultationId");
      handleClose();
      navigate("/doctor");
    } catch (err) {
      console.error("Error saving billing:", err);
    }
  };

  return (
    <Modal isOpen={show} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Billing Information</ModalHeader>
      <ModalBody>
        <Row>
          <Col sm="6">
            <h6>Bill Codes</h6>
            <ListGroup flush>
              {billings.map(billing => (
                <ListGroupItem key={billing._id} className="p-1">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={selectedBillings.some(b => b._id === billing._id)}
                        onChange={() => handleSelectBilling(billing)}
                      />
                      {billing.billCode} - ${billing.amount}
                    </Label>
                  </FormGroup>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>
          <Col sm="6">
            <h6>Selected</h6>
            <ListGroup flush>
              {selectedBillings.map((billing, index) => (
                <ListGroupItem key={billing._id} className="p-1">
                  {index + 1}. {billing.billCode} - ${billing.amount}
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <h6>Total:</h6>
          </Col>
          <Col className="text-end">
            <Input
              type="number"
              value={customTotal}
              onChange={e => setCustomTotal(parseFloat(e.target.value) || 0)}
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button color="primary" onClick={handleEndConsultation}>
          Save Billing
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BillingModal;

