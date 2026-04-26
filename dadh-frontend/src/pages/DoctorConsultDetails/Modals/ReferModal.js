// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { useNavigate } from "react-router-dom"; 

// const ReferModal = ({ show, handleClose }) => {
//   const [doctors, setDoctors] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState("");
//   const [referralMessage, setReferralMessage] = useState("");
//   const doctorName = localStorage.getItem("doctorName") || "Doctor";
//   const consultationId = localStorage.getItem("consultationId");
//   const navigate = useNavigate(); 
  
//   const BASE_URL = "http://localhost:5001/api"; // Update if needed

//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}/doctor/getAll`, {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//         });

//         const data = await response.json();
//         if (response.ok) {
//           setDoctors(data.data);
//         }
//       } catch (error) {
//         console.log("Error fetching doctors:", error);
//       }
//     };

//     if (show) fetchDoctors(); // Only fetch when modal is open
//   }, [show]);

//   const handleRefer = async () => {
//     if (!selectedDoctor || !referralMessage || !consultationId) {
//       return;
//     }

//     const referralData = {
//       doctorId: selectedDoctor,
//       consultationId,
//       ReferralMessage: referralMessage,
//     };

//     try {
//       const response = await fetch(`${BASE_URL}/consultations/referDoctor`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(referralData),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         // ✅ Get selected doctor's name
//         const selectedDoctorObj = doctors.find(doc => doc._id === selectedDoctor);
//         const selectedDoctorName = selectedDoctorObj?.name || "Unknown Doctor";

//         // ✅ Send SMS
//         // await fetch(`http://localhost:5001/notification/sms`, {
//         //   method: "POST",
//         //   headers: {
//         //     "Content-Type": "application/json",
//         //   },
//         //   body: JSON.stringify({
//         //     to: "+923460329743",
//         //     body: `📋 Referral Created:\nDoctor: ${selectedDoctorName}\nMessage: ${referralMessage}`,
//         //   }),
//         // });

//         handleClose();
//        navigate("/doctor");
//       }
//     } catch (error) {
//       console.error("Error referring doctor:", error);
//     }
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>Refer Patient</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           {/* Doctor Selection */}
//           <Form.Group className="mb-3">
//             <Form.Label>Select Doctor</Form.Label>
//             <Form.Select
//               value={selectedDoctor}
//               onChange={e => setSelectedDoctor(e.target.value)}
//             >
//               <option value="">Select a doctor</option>
//               {doctors.map(doctor => (
//                 <option key={doctor._id} value={doctor._id}>
//                   {doctor.name}
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>

//           {/* Referral Message */}
//           <Form.Group className="mb-3">
//             <Form.Label>Referral Message</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               placeholder="Enter additional details for referral..."
//               value={referralMessage}
//               onChange={e => setReferralMessage(e.target.value)}
//             />
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handleRefer}>
//           Refer
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default ReferModal;


import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ReferModal = ({ show, handleClose }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [referralMessage, setReferralMessage] = useState("");

  const consultationId = localStorage.getItem("consultationId");
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5001/api";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/doctor/getAll`);
        const data = await response.json();
        if (response.ok) {
          setDoctors(data.data);
        }
      } catch (error) {
        console.log("Error fetching doctors:", error);
      }
    };

    if (show) fetchDoctors();
  }, [show]);

const handleRefer = async () => {
  if (!selectedDoctor || !referralMessage || !consultationId) return;

  // 1️⃣ Step: Send referral
  const referralData = {
    doctorId: selectedDoctor,
    consultationId,
    ReferralMessage: referralMessage,
  };

  try {
    const referralResponse = await fetch(`${BASE_URL}/consultations/referDoctor`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(referralData),
    });

    const referralResult = await referralResponse.json();

    if (!referralResponse.ok) {
      console.error("Referral failed:", referralResult?.message);
      return;
    }

    // 2️⃣ Step: End consultation after referral succeeds
    const localData = JSON.parse(localStorage.getItem("data"));
    const patientData = JSON.parse(localStorage.getItem("patientData")); // ✅ fetch patient

    const doctorId = localData?.data?._id;
    const patientId = patientData?._id;

    if (!doctorId || !patientId) {
      console.error("Missing doctorId or patientId");
      return;
    }

    const endResponse = await fetch(`${BASE_URL}/billing/end/referral/${consultationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ doctor_id: doctorId, patientId }),
    });

    const endResult = await endResponse.json();

    if (!endResult?.state) {
      console.error("Consultation end failed:", endResult?.message);
      return;
    }

    // 3️⃣ Step: Cleanup + redirect
    localStorage.removeItem("consultationId");
    localStorage.removeItem("patientData");

    handleClose();
    navigate("/doctor");

  } catch (error) {
    console.error("Error during refer & end consultation:", error);
  }
};

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Refer Patient</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Doctor</Form.Label>
            <Form.Select
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Referral Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter referral details..."
              value={referralMessage}
              onChange={e => setReferralMessage(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleRefer}>
          Refer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReferModal;
