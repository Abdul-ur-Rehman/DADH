// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Row, Col, Input, Label, Button } from "reactstrap";
// import Swal from 'sweetalert2';
// import "./Consult.css";

// const EditConsultCategory = () => {
//   const [category, setCategory] = useState({
//     category: "",
//     notes: "",
//     key: "",
//   });

//   const navigate = useNavigate();
//   const { id } = useParams();
//   const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setCategory(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleCancel = () => {
//     setCategory({
//       category: "",
//       notes: "",
//       key: "",
//     });
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     console.log("category", category);
//     const api = `${REACT_APP_BACKEND_URL}/consultationCategory/updateOneById/${id}`;

//     try {
//       const response = await fetch(`${api}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(category),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         navigate("/admin/consultationCategory/table");
//         Toast.fire({
//           icon: 'success',
//           html: '<span class="toast-title">Updated consultation</span>',
    
//         });
//       }
//     } catch (error) {
//       console.error("error", error);
//     }
//   };

//   const getConsultationCategoryByID = async () => {
//     const api = `/api/consultationCategory/getOne/${id}`;

//     try {
//       const response = await fetch(`${api}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       if (response.ok) {
//         console.log("setConsultationCategories by id : ", data.data);
//         setCategory(data.data);
//       } else {
//         console.log("error", data.message);
//       }
//     } catch (error) {
//       console.error("error", error);
//     }
//   };

//   useEffect(() => {
//     getConsultationCategoryByID();
//   }, []);

//   const Toast = Swal.mixin({
//     toast: true,
//     position: 'top-end',
//     showConfirmButton: false,
//     timer: 3000,
//     timerProgressBar: true,
//     customClass: {
//       popup: 'my-toast' // Custom class
//     },
//     didOpen: (toast) => {
//       toast.addEventListener('mouseenter', Swal.stopTimer)
//       toast.addEventListener('mouseleave', Swal.resumeTimer)
//     }
//   });

//   return (
//     <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
//       <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "900px", marginTop: "120px", marginBottom: "80px" }} >
//         <h3 className="text-2xl font-semibold text-start mb-3">Edit Consultation Category</h3>
//         <form onSubmit={handleSubmit}>
//           <Row>
//             <Col lg="12">
//               <div className="mb-3">
//                 <Label>Category</Label>
//                 <Input
//                   type="text"
//                   name="category"
//                   value={category.category}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <Label>Notes</Label>
//                 <Input
//                   type="text"
//                   name="notes"
//                   value={category.notes}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <Label>Key</Label>
//                 <Input
//                   type="text"
//                   name="key"
//                   value={category.key}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             </Col>
//           </Row>
//           {/* Buttons */}
//           <div className="d-flex justify-content-end mt-3">
//             <Button
//               type="button"
//               color="secondary"
//               onClick={handleCancel}
//               className="me-2"
//             >
//               Cancel
//             </Button>
//             <Button type="submit" color="primary">
//               Update
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditConsultCategory;
