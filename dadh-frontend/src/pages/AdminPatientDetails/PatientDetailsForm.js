// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   Row,
//   Col,
//   Input,
//   Label,
//   Button,
//   Container,
//   Card,
//   CardBody,
// } from "reactstrap";

// const PatientDetailsForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [patientData, setPatientData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     state: "",
//     city: "",
//     DOB: "",
//     medicareNumber: "",
//     // IRN: "",
//     address: "",
//     zipCode: "",
//     gender: "",
//   });

//   const [errors, setErrors] = useState({});

//   const getPatientDetailsByID = async () => {
//     try {
//       const api = `/api/patient/auth/getOneById/${id}`;

//       const response = await fetch(`${api}`);
//       const data = await response.json();
//       if (response.ok) {
//         setPatientData(data.data || {});
//       } else {
//         console.error("Error:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching doctor request:", error);
//     }
//   };

//   useEffect(() => {
//     if (id) getPatientDetailsByID();
//   }, [id]);

//   const handleCancel = () => {
//     navigate("/patient-details");
//   };

//   return (
//     <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
//       <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}>
//       <h3 className="text-2xl font-semibold text-start mb-3">Patient Information</h3>
//         <Col xs="12">
//           <Card>
//             <CardBody className="p-4">
//               <Row>
//                 {/* Left Column Group */}
//                 <Col xs="12" md="6">
//                   <div className="mb-3">
//                     <Label>Name</Label>
//                     <Input
//                       type="text"
//                       name="name"
//                       value={patientData.name}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Email</Label>
//                     <Input
//                       type="email"
//                       name="email"
//                       value={patientData.email}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Phone</Label>
//                     <Input
//                       type="tel"
//                       name="phone"
//                       value={patientData.phone}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Medicare Number</Label>
//                     <Input
//                       type="text"
//                       name="medicareNumber"
//                       value={patientData.medicareNumber}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   {/* <div className="mb-3">
//                     <Label>IRN</Label>
//                     <Input
//                       type="number"
//                       name="IRN"
//                       value={patientData.IRN}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div> */}
//                    <div className="mb-3">
//                     <Label>Address</Label>
//                     <Input
//                       type="text"
//                       name="address"
//                       value={patientData.address}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                 </Col>

//                 {/* Right Column Group */}
//                 <Col xs="12" md="6">
//                   <div className="mb-3">
//                     <Label>City</Label>
//                     <Input
//                       type="text"
//                       name="city"
//                       value={patientData.city}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>State</Label>
//                     <Input
//                       type="text"
//                       name="state"
//                       value={patientData.state}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Date Of Birth</Label>
//                     <Input
//                       type="date"
//                       name="DOB"
//                       value={patientData.DOB}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Zip Code</Label>
//                     <Input
//                       type="text"
//                       name="zipCode"
//                       value={patientData.zipCode}
//                       readOnly
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Gender</Label>
//                     <input
//                       name="gender"
//                       type="text"
//                       value={patientData.gender}
//                       readOnly
//                       className="form-control w-full"
//                     />
//                   </div>
//                 </Col>
//               </Row>
//             </CardBody>
//           </Card>
//         </Col>
//       </div>
//     </div>
//   );
// };

// export default PatientDetailsForm;
