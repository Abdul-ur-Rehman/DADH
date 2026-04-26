// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   Row,
//   Col,
//   Input,
//   Label,
//   Card,
//   CardBody,
// } from "reactstrap";

// const AdminDetailsForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [adminData, setAdminData] = useState({
//     username: "",
//     email: "",
//     phone: "",
//     password: "",
//     state: "",
//     city: "",
//     DOB: "",
//     address: "",
//     zipCode: "",
//     gender: "",
//     medicareNumber: "",
//     IRN: "",
//   });

//   const getAdminDetailsByID = async () => {
//     try {
//       const response = await fetch(`/api/Admin/auth/getOneById/${id}`);
//       const data = await response.json();
//       if (response.ok) {
//         setAdminData(data.data || {});
//       } else {
//         console.error("Error fetching admin details:", data);
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//     }
//   };

//   useEffect(() => {
//     if (id) getAdminDetailsByID();
//   }, [id]);

//   return (
//     <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
//       <div
//         className="bg-white shadow-lg rounded-3 p-4 w-100"
//         style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}
//       >
//         <h3 className="text-2xl font-semibold text-start mb-3">Admin Information</h3>
//         <Col xs="12">
//           <Card>
//             <CardBody className="p-4">
//               <Row>
//                 {/* Left Column */}
//                 <Col xs="12" md="6">
//                   <div className="mb-3">
//                     <Label>Username</Label>
//                     <Input type="text" value={adminData.username} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Email</Label>
//                     <Input type="email" value={adminData.email} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Phone</Label>
//                     <Input type="tel" value={adminData.phone} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Address</Label>
//                     <Input type="text" value={adminData.address} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>City</Label>
//                     <Input type="text" value={adminData.city} readOnly />
//                   </div>
//                 </Col>

//                 {/* Right Column */}
//                 <Col xs="12" md="6">
//                   <div className="mb-3">
//                     <Label>State</Label>
//                     <Input type="text" value={adminData.state} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Date of Birth</Label>
//                     <Input type="date" value={adminData.DOB} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Zip Code</Label>
//                     <Input type="text" value={adminData.zipCode} readOnly />
//                   </div>
//                   <div className="mb-3">
//                     <Label>Gender</Label>
//                     <Input type="text" value={adminData.gender} readOnly />
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

// export default AdminDetailsForm;
