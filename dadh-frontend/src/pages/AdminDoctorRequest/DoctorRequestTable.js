// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardBody,
//   Table,
//   Button,
//   Input,
//   InputGroup,
//   Row,
//   Col,
// } from "reactstrap";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";

// const DoctorRequestTable = () => {
//   const [search, setSearch] = useState("");
//   const [doctorRequest, setDoctorRequest] = useState([]);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 20;
//   const navigate = useNavigate();
//   const api = "/api/doctor-requests/";

//   const getDoctorRequests = async () => {
//     try {
//       const response = await fetch(`${api}getAll`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       if (response.ok && data?.data) {
//         const sortedData = data.data.sort(
//           (a, b) =>
//             new Date(parseInt(b._id.substring(0, 8), 16) * 1000) -
//             new Date(parseInt(a._id.substring(0, 8), 16) * 1000)
//         );
//         setDoctorRequest(sortedData);
//       } else {
//         setError(data.message || "Failed to fetch doctor requests");
//       }
//     } catch (error) {
//       console.error("Fetch Error:", error);
//       setError("Error fetching data. Check API server.");
//     }
//   };

//   useEffect(() => {
//     getDoctorRequests();
//   }, []);


//   const deleteDoctor = async (id) => {
//     const confirmed = await Swal.fire({
//       title: "Are you sure?",
//       text: "This doctor will be permanently deleted.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (confirmed.isConfirmed) {
//       try {
//         const response = await fetch(`/api/doctor-requests/deleteById/${id}`, {
//           method: "DELETE",
//         });

//         const data = await response.json();

//         if (response.ok) {
//           // Remove doctor from UI
//           setDoctorRequest((prev) => prev.filter((doctor) => doctor._id !== id));

//           Swal.fire("Deleted!", data.message || "Doctor deleted successfully.", "success");
//         } else {
//           Swal.fire("Error", data.message || "Failed to delete doctor.", "error");
//         }
//       } catch (err) {
//         console.error("Delete Error:", err);
//         Swal.fire("Error", "Something went wrong while deleting.", "error");
//       }
//     }
//   };


//   const toggleActiveStatus = async (id, currentStatus, name) => {
//     const newStatus = currentStatus === 1 ? 0 : 1;
//     try {
//       const response = await fetch(`${api}toggleActive/${id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setDoctorRequest((prev) =>
//           prev.map((doctor) =>
//             doctor._id === id ? { ...doctor, status: newStatus } : doctor
//           )
//         );

//         Swal.fire({
//           icon: newStatus === 1 ? "success" : "warning",
//           title: newStatus === 1 ? "Doctor Enabled" : "Doctor Disabled",
//           text: newStatus === 1
//             ? `${name} is now enabled. Doctor can login now.`
//             : `${name} is now disabled. Doctor cannot login.`,
//           timer: 2500,
//           showConfirmButton: false,
//         });
//       } else {
//         Swal.fire("Error", result.message || "Something went wrong", "error");
//       }
//     } catch (err) {
//       Swal.fire("Error", "Failed to toggle status", "error");
//       console.error("Toggle Active Error:", err);
//     }
//   };


//   const filteredData = doctorRequest.filter((item) =>
//     item.email || item.name || item.phone
//       ? item.email.toLowerCase().includes(search.toLowerCase()) ||
//       item.name.toLowerCase().includes(search.toLowerCase()) ||
//       item.phone.toLowerCase().includes(search.toLowerCase())
//       : false
//   );

//   const totalPages = Math.ceil(filteredData.length / recordsPerPage);
//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//   const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

//   return (
//     <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
//       <div
//         className="bg-white shadow-lg rounded-3 p-4 w-100"
//         style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}
//       >
//         <Card>
//           <CardBody>
//             <h3 className="text-2xl font-semibold mb-3">Doctor Requests</h3>

//             <Row className="align-items-center mb-3">
//               <Col sm={12} md={4} className="mb-3">
//                 <InputGroup style={{ maxWidth: "200px" }}>
//                   <Input
//                     type="text"
//                     placeholder="Search by doctor"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                 </InputGroup>
//               </Col>
//             </Row>

//             {error && <p className="text-danger text-center">{error}</p>}

//             <div className="table-responsive">
//               <Table bordered striped className="text-center align-middle">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Phone</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentRecords.length === 0 ? (
//                     <tr>
//                       <td colSpan="5" className="text-center text-danger">
//                         No matching records found
//                       </td>
//                     </tr>
//                   ) : (
//                     currentRecords.map((item) => (
//                       <tr key={item._id}>
//                         <td>{item.name}</td>
//                         <td>{item.email}</td>
//                         <td>{item.phone}</td>
//                         <td>
//                           {item.status === 1 ? (
//                             <span className="badge bg-success">Active</span>
//                           ) : (
//                             <span className="badge bg-danger">Inactive</span>
//                           )}
//                         </td>
//                         <td>
//                           <div className="d-flex justify-content-center gap-2">
//                             {/* Edit (Update) Icon */}
//                             <button
//                               className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
//                               style={{ width: "36px", height: "36px", padding: 0 }}
//                               onClick={() => navigate(`/admin/doctorDetails/form/${item._id}`)}
//                               title="Update"
//                             >
//                               <FontAwesomeIcon icon={faEdit} />
//                             </button>

//                             {/* Delete Icon */}
//                             <button
//                               className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
//                               title="Delete"
//                               style={{ width: "36px", height: "36px", padding: 0 }}
//                               onClick={() => deleteDoctor(item._id)}
//                             >
//                               <FontAwesomeIcon icon={faTrash} />
//                             </button>

//                             {/* Enable/Disable Toggle Icon */}
//                             <button
//                               className={`btn btn-sm ${item.status === 1 ? "btn-outline-danger" : "btn-outline-success"
//                                 } d-flex align-items-center justify-content-center`}
//                               onClick={() => toggleActiveStatus(item._id, item.status, item.name)}
//                               title={item.status === 1 ? "Disable" : "Enable"}
//                             >
//                               <FontAwesomeIcon icon={item.status === 1 ? faToggleOff : faToggleOn} />
//                             </button>
//                           </div>
//                         </td>


//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>

//             <Row className="align-items-center mt-3">
//               <Col xs={12} md="auto" className="mb-2 mb-md-0">
//                 <span>
//                   Showing {currentRecords.length} of {filteredData.length} entries
//                 </span>
//               </Col>
//               <Col xs={12} md className="text-md-end">
//                 <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start">
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
//                     onClick={() =>
//                       setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default DoctorRequestTable;

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Table,
  Button,
  Input,
  InputGroup,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
} from "reactstrap";
import Select from 'react-select';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DoctorRequestTable = () => {
  const [search, setSearch] = useState("");
  const [doctorRequest, setDoctorRequest] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editedDoctor, setEditedDoctor] = useState({});
  const [isReadyForUpdate, setIsReadyForUpdate] = useState(false);

  const recordsPerPage = 20;
  const navigate = useNavigate();
  const api = "/api/doctor-requests/";

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'my-toast'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  const getDoctorRequests = async () => {
    try {
      const response = await fetch(`${api}getAll`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data?.data) {
        const sortedData = data.data.sort(
          (a, b) =>
            new Date(parseInt(b._id.substring(0, 8), 16) * 1000) -
            new Date(parseInt(a._id.substring(0, 8), 16) * 1000)
        );
        setDoctorRequest(sortedData);
      } else {
        setError(data.message || "Failed to fetch doctor requests");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError("Error fetching data. Check API server.");
    }
  };

  useEffect(() => {
    getDoctorRequests();
  }, []);

  // Open modal with doctor details
  const openModal = (doctor) => {
    setSelectedDoctor(doctor);
    setEditedDoctor({ ...doctor });

    // Check if both prescriber and provider number exist
    if (doctor?.prescriberNumber && doctor?.providerNumber) {
      setIsReadyForUpdate(true);
    } else {
      setIsReadyForUpdate(false);
    }

    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedDoctor(null);
    setEditedDoctor({});
    setIsReadyForUpdate(false);
  };

  // Handle input changes in modal
  const handleModalChange = (e) => {
    setEditedDoctor({ ...editedDoctor, [e.target.name]: e.target.value });
  };

  // Handle approval
  const handleApprove = async () => {
    const confirm = await Swal.fire({
      title: "Approve Doctor?",
      text: "Are you sure you want to approve this doctor?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
    });

    if (!confirm.isConfirmed) return;

    try {
      const prescriberCheck = await fetch(`${api}check-prescriber/${editedDoctor.prescriberNumber}`);
      if (!prescriberCheck.ok) {
        const errorResult = await prescriberCheck.json();
        Toast.fire({
          icon: 'error',
          html: `<span class="toast-title">${errorResult.message}</span>`,
        });
        return;
      }

      const providerCheck = await fetch(`${api}check-provider/${editedDoctor.providerNumber}`);
      if (!providerCheck.ok) {
        const errorResult = await providerCheck.json();
        Toast.fire({
          icon: 'error',
          html: `<span class="toast-title">${errorResult.message}</span>`,
        });
        return;
      }

      const response = await fetch(`${api}approve-doctor/${selectedDoctor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isApproved: true,
          prescriberNumber: Number(editedDoctor.prescriberNumber),
          providerNumber: Number(editedDoctor.providerNumber),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEditedDoctor(data.data);
        setIsReadyForUpdate(true);

        // Update the doctor in the main list
        setDoctorRequest(prev =>
          prev.map(doc =>
            doc._id === selectedDoctor._id ? data.data : doc
          )
        );

        Swal.fire("Approved!", "Doctor has been approved.", "success");
      } else {
        console.error("Approval failed");
      }

    } catch (error) {
      console.error("Error approving doctor request:", error);
      Swal.fire("Error", "Something went wrong during approval", "error");
    }
  };

  // Handle update
  const handleUpdate = async () => {
    const confirm = await Swal.fire({
      title: "Update Doctor?",
      text: "Are you sure you want to update the doctor details?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${api}update-doctor/${selectedDoctor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedDoctor),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the doctor in the main list
        setDoctorRequest(prev =>
          prev.map(doc =>
            doc._id === selectedDoctor._id ? data.data : doc
          )
        );

        Swal.fire("Updated!", "Doctor details updated successfully.", "success");
        closeModal();
      } else if (response.status === 409) {
        if (data.message.includes("Prescriber")) {
          Swal.fire("Error", "Prescriber No already in use", "error");
        } else if (data.message.includes("Provider")) {
          Swal.fire("Error", "Provider No already in use", "error");
        } else {
          Swal.fire("Error", data.message, "error");
        }
      } else {
        Swal.fire("Error", "Update failed", "error");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  const deleteDoctor = async (id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This doctor will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(`/api/doctor-requests/deleteById/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (response.ok) {
          setDoctorRequest((prev) => prev.filter((doctor) => doctor._id !== id));
          Swal.fire("Deleted!", data.message || "Doctor deleted successfully.", "success");
        } else {
          Swal.fire("Error", data.message || "Failed to delete doctor.", "error");
        }
      } catch (err) {
        console.error("Delete Error:", err);
        Swal.fire("Error", "Something went wrong while deleting.", "error");
      }
    }
  };

  const toggleActiveStatus = async (id, currentStatus, name) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const response = await fetch(`${api}toggleActive/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        setDoctorRequest((prev) =>
          prev.map((doctor) =>
            doctor._id === id ? { ...doctor, status: newStatus } : doctor
          )
        );

        Swal.fire({
          icon: newStatus === 1 ? "success" : "warning",
          title: newStatus === 1 ? "Doctor Enabled" : "Doctor Disabled",
          text: newStatus === 1
            ? `${name} is now enabled. Doctor can login now.`
            : `${name} is now disabled. Doctor cannot login.`,
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to toggle status", "error");
      console.error("Toggle Active Error:", err);
    }
  };

  const filteredData = doctorRequest.filter((item) =>
    item.email || item.name || item.phone
      ? item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase())
      : false
  );

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div
        className="bg-white shadow-lg rounded-3 p-4 w-100"
        style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}
      >
        <Card>
          <CardBody>
            <h3 className="text-2xl font-semibold mb-3">Doctor Requests</h3>

            <Row className="align-items-center mb-3">
              <Col sm={12} md={4} className="mb-3">
                <InputGroup style={{ maxWidth: "200px" }}>
                  <Input
                    type="text"
                    placeholder="Search by doctor"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
            </Row>

            {error && <p className="text-danger text-center">{error}</p>}

            <div className="table-responsive">
              <Table bordered striped className="text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-danger">
                        No matching records found
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>
                          {item.status === 1 ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Inactive</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            {/* Edit (Update) Icon */}
                            <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                              style={{ width: "36px", height: "36px", padding: 0 }}
                              onClick={() => openModal(item)}
                              title="Update"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>

                            {/* Delete Icon */}
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                              title="Delete"
                              style={{ width: "36px", height: "36px", padding: 0 }}
                              onClick={() => deleteDoctor(item._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>

                            {/* Enable/Disable Toggle Icon */}
                            <button
                              className={`btn btn-sm ${item.status === 1 ? "btn-outline-danger" : "btn-outline-success"
                                } d-flex align-items-center justify-content-center`}
                              onClick={() => toggleActiveStatus(item._id, item.status, item.name)}
                              title={item.status === 1 ? "Disable" : "Enable"}
                            >
                              <FontAwesomeIcon icon={item.status === 1 ? faToggleOff : faToggleOn} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <Row className="align-items-center mt-3">
              <Col xs={12} md="auto" className="mb-2 mb-md-0">
                <span>
                  Showing {currentRecords.length} of {filteredData.length} entries
                </span>
              </Col>
              <Col xs={12} md className="text-md-end">
                <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span className="align-self-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Modal for Doctor Details */}
        <Modal
          isOpen={modalOpen}
          toggle={closeModal}
          size="md"
          centered
          style={{ maxWidth: "600px" }}
          contentClassName="p-2"
        >
          <ModalHeader toggle={closeModal}>Doctor Details</ModalHeader>
          <ModalBody style={{ overflow: "visible" }}>
            {selectedDoctor && (
              <Card className="mb-3" style={{ boxShadow: "none" }}>
                <CardBody style={{ padding: "15px" }}>
                  {/* Editable Fields */}
                  <div className="mb-2 p-2">
                    <Row>
                      <Col md="6">
                        <div className="mb-2">
                          <Label className="fw-bold">Prescriber Number</Label>
                          <Input
                            type="number"
                            name="prescriberNumber"
                            value={editedDoctor.prescriberNumber || ''}
                            onChange={handleModalChange}
                            className="form-control-sm"
                          />
                        </div>
                      </Col>
                      <Col md="6">
                        <div className="mb-2">
                          <Label className="fw-bold">Provider Number</Label>
                          <Input
                            type="number"
                            name="providerNumber"
                            value={editedDoctor.providerNumber || ''}
                            onChange={handleModalChange}
                            className="form-control-sm"
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>


                  {/* Read-only Details */}
                  <Table size="sm" responsive style={{ tableLayout: "fixed", width: "100%" }}>
                    <tbody>
                      {[
                        "name",
                        "surname",
                        "email",
                        "phone",
                        "gender",
                        "qualification",
                        "workType",
                        "city",
                        "state",
                        "startDate",
                        "isHomeVisit"
                      ].map((field) => (
                        <tr key={field}>
                          <td style={{ width: "40%", fontWeight: "bold" }}>
                            {field === "isHomeVisit" ? "HOME VISIT" : field.toUpperCase()}
                          </td>
                          <td style={{ width: "60%" }}>
                            {field === "startDate"
                              ? editedDoctor.startDate
                                ? editedDoctor.startDate.split("T")[0]
                                : "N/A"
                              : field === "isHomeVisit"
                                ? editedDoctor.isHomeVisit || "N/A"
                                : editedDoctor[field] || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Validation Note */}
                  {!editedDoctor.prescriberNumber || !editedDoctor.providerNumber ? (
                    <p className="text-danger text-sm mt-3">
                      Please fill in both Prescriber and Provider numbers to enable approval.
                    </p>
                  ) : null}
                </CardBody>
              </Card>
            )}
          </ModalBody>
          <ModalFooter>
            {isReadyForUpdate ? (
              <Button color="primary" onClick={handleUpdate}>
                Update
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={handleApprove}
                disabled={!editedDoctor.prescriberNumber || !editedDoctor.providerNumber}
              >
                Approve
              </Button>
            )}
            <Button color="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

      </div>
    </div>
  );
};

export default DoctorRequestTable;