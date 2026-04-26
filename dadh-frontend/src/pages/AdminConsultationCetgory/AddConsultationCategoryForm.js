// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardBody,
//   Table,
//   Button,
//   Input,
//   InputGroup,
//   Container,
//   Row,
//   Col,
//   Modal,
//   ModalHeader,
//   ModalBody,
// } from "reactstrap";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
// import Swal from "sweetalert2";
// import "./Consult.css";

// const ConsultationCategoryTable = () => {
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [modalOpen, setModalOpen] = useState(false);

//   const recordsPerPage = 20;
//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

//   const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

//   const [categoryData, setCategoryData] = useState({
//     category: "",
//     notes: "",
//     key: "",
//   });
//   const [errors, setErrors] = useState({});

//   const Toast = Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     timer: 3000,
//     timerProgressBar: true,
//     customClass: { popup: "my-toast" },
//     didOpen: (toast) => {
//       toast.addEventListener("mouseenter", Swal.stopTimer);
//       toast.addEventListener("mouseleave", Swal.resumeTimer);
//     },
//   });

//   const getConsultationCategories = async () => {
//     try {
//       const response = await fetch(`/api/consultationCategory/getAll`);
//       const result = await response.json();
//       if (response.ok) {
//         setCategory(result.data);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   useEffect(() => {
//     getConsultationCategories();
//   }, []);

//   const deleteConsultationCategory = async (id) => {
//     if (!id) return;
//     try {
//       const response = await fetch(`/api/consultationCategory/deleteById/${id}`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//       });
//       await response.json();
//       if (response.ok) getConsultationCategories();

//       Toast.fire({ icon: "error", html: '<span class="toast-title">Deleted successfully</span>' });
//     } catch (error) {
//       console.error("Network error:", error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCategoryData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const validateForm = () => {
//     let newErrors = {};
//     if (!categoryData.category.trim()) newErrors.category = "Category is required";
//     else if (categoryData.category.length < 3) newErrors.category = "Minimum 3 characters";

//     if (!categoryData.notes.trim()) newErrors.notes = "Notes are required";
//     else if (categoryData.notes.length < 5) newErrors.notes = "Minimum 5 characters";

//     if (!categoryData.key.trim()) newErrors.key = "Key is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleAddCategory = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/add`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(categoryData),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         Toast.fire({
//           icon: "success",
//           html: '<span class="toast-title">Add New Consult Successfully</span>',
//         });
//         setModalOpen(false);
//         setCategoryData({ category: "", notes: "", key: "" });
//         getConsultationCategories();
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   const filteredData = category.filter((item) =>
//     item.category.toLowerCase().includes(search.toLowerCase())
//   );
//   const totalPages = Math.ceil(filteredData.length / recordsPerPage);
//   const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

//   return (
//     <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
//       <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}>
//         <Card>
//           <CardBody>
//             <h3 className="mb-4 fw-semibold">Consultation Categories</h3>
//             <Row className="mb-3 align-items-center">
//               <Col sm={12} md={8} className="mb-3">
//                 <InputGroup style={{ maxWidth: "200px" }}>
//                   <Input
//                     type="text"
//                     placeholder="Search by Category"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                 </InputGroup>
//               </Col>
//               <Col sm={12} md={4} className="mb-3 d-flex justify-content-md-end">
//                 <Button color="primary" onClick={() => setModalOpen(true)}>
//                   Add New Category
//                 </Button>
//               </Col>
//             </Row>

//             {/* Table */}
//             <div className="table-responsive">
//               <Table bordered striped className="text-center mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>S.No</th>
//                     <th>Category</th>
//                     <th>Notes</th>
//                     <th>Key</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentRecords.length === 0 ? (
//                     <tr>
//                       <td colSpan="5" className="text-center">
//                         No matching records found
//                       </td>
//                     </tr>
//                   ) : (
//                     currentRecords.map((item, index) => (
//                       <tr key={item._id}>
//                         <td>{indexOfFirstRecord + index + 1}</td>
//                         <td>{item.category}</td>
//                         <td>{item.notes}</td>
//                         <td>{item.key}</td>
//                         <td>
//                           <div className="d-flex justify-content-center gap-2">
//                             <Button size="sm" outline color="primary" title="Edit">
//                               <FontAwesomeIcon icon={faEdit} />
//                             </Button>
//                             <Button
//                               size="sm"
//                               outline
//                               color="danger"
//                               onClick={() => deleteConsultationCategory(item._id)}
//                               title="Delete"
//                             >
//                               <FontAwesomeIcon icon={faTrash} />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>

//             {/* Pagination */}
//             <Row className="align-items-center mt-3">
//               <Col xs={12} md="auto" className="mb-2 mb-md-0">
//                 <span>
//                   Showing {currentRecords.length} of {filteredData.length} entries
//                 </span>
//               </Col>
//               <Col xs={12} md className="text-md-end">
//                 <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start align-items-center">
//                   <Button
//                     size="sm"
//                     color="primary"
//                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                   >
//                     Prev
//                   </Button>
//                   <span className="align-self-center">
//                     Page {currentPage} of {totalPages}
//                   </span>
//                   <Button
//                     size="sm"
//                     color="primary"
//                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         {/* Modal */}
//         <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered>
//           <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Add New Consultation Category</ModalHeader>
//           <ModalBody>
//             <form onSubmit={handleAddCategory}>
//               <div className="mb-3">
//                 <label>Category</label>
//                 <Input type="text" name="category" value={categoryData.category} onChange={handleChange} />
//                 {errors.category && <small className="text-danger">{errors.category}</small>}
//               </div>
//               <div className="mb-3">
//                 <label>Notes</label>
//                 <Input type="text" name="notes" value={categoryData.notes} onChange={handleChange} />
//                 {errors.notes && <small className="text-danger">{errors.notes}</small>}
//               </div>
//               <div className="mb-3">
//                 <label>Key</label>
//                 <Input type="text" name="key" value={categoryData.key} onChange={handleChange} />
//                 {errors.key && <small className="text-danger">{errors.key}</small>}
//               </div>

//               <div className="d-flex justify-content-end gap-2">
//                 <Button type="button" color="secondary" onClick={() => setModalOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" color="primary">
//                   Add Category
//                 </Button>
//               </div>
//             </form>
//           </ModalBody>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default ConsultationCategoryTable;
