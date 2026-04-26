import { Plus, Eye, Trash2, Power, PowerOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Table,
  Button,
  Input,
  InputGroup,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faUserGroup,
  faTrash,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const PatientDetailsTable = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Family Members");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);

  const recordsPerPage = 20;
  const BASE_URL = "http://localhost:5001/api";

  const getPatients = async () => {
    try {
      const response = await fetch(`${BASE_URL}/patient/auth/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (response.ok) {
        const sortedData = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setData(sortedData);
        setFilteredData(sortedData);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const deletePatient = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}/patient/auth/deleteById/${id}`, {
            method: "DELETE",
          });

          const resultData = await response.json();

          if (response.ok) {
            Swal.fire("Deleted!", "Patient has been deleted.", "success");
            getPatients();
          } else {
            Swal.fire("Error", resultData.message || "Something went wrong", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Something went wrong", "error");
        }
      }
    });
  };



  const togglePatientStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

      const response = await fetch(`${BASE_URL}/patient/auth/toggleActive/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire(
          "Success",
          `Patient ${result.status === 1 ? "Enabled" : "Disabled"} Successfully`,
          "success"
        );
        getPatients();
      } else {
        Swal.fire("Error", result.message || "Something went wrong", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };




  const fetchFamilyMembers = async (medicareNumber, patientId, patientName) => {
    try {
      const res = await fetch(`${BASE_URL}/patient/auth/getAllFamilyMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicareNumber }),
      });
      const json = await res.json();
      if (json.state && json.data) {
        const members = json.data.filter((p) => p._id !== patientId);
        setFamilyMembers(members);
        setModalTitle(`Family of ${patientName}`);
      } else {
        setFamilyMembers([]);
        setModalTitle(`No family found for ${patientName}`);
      }
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching family members:", err);
    }
  };

  useEffect(() => {
    getPatients();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setFilteredData(
      data.filter(
        (patient, index) =>
          patient.name.toLowerCase().includes(search.toLowerCase()) ||
          patient.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}>
        <Card>
          <CardBody>
            <h3 className="mb-4 fw-semibold">Patient Information</h3>
            <Row className="mb-3 align-items-center">
              <Col sm={12} md={8} className="mb-3">
                <InputGroup style={{ maxWidth: "200px" }}>
                  <Input type="text" placeholder="Search by patient" value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
              </Col>
              <Col sm={12} md={4} className="mb-3 d-flex justify-content-md-end">
                <Link to="/add/patient-register/">
                  <Button color="primary" style={{ maxWidth: "200px" }}>New Patient</Button>
                </Link>
              </Col>
            </Row>

            <div className="table-responsive mt-3">
              <Table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Medicare</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-danger">No matching records found</td>
                    </tr>
                  ) : (
                    currentRecords.map((patient, index) => (
                      <tr key={patient._id}>
                        <td>{indexOfFirstRecord + index + 1}</td>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.medicareNumber || "N/A"}</td>

                        <td>
                          <span
                            className={`badge ${patient.status === 1 ? "bg-success" : "bg-danger"
                              }`}
                          >
                            {patient.status === 1 ? "Active" : "Inactive"}
                          </span>

                        </td>
                        <td className="d-flex gap-1 justify-content-center flex-wrap">
                          {/* Edit Button */}
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                            title="Edit"
                            style={{ width: "36px", height: "36px", padding: 0 }}
                            onClick={() => {
                              setViewPatient(patient);
                              setViewModalOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          {/* Family Button */}
                          {patient.medicareNumber && (
                            <button
                              className="btn btn-sm btn-outline-info d-flex align-items-center justify-content-center"
                              title="Family"
                              style={{ width: "36px", height: "36px", padding: 0 }}
                              onClick={() =>
                                fetchFamilyMembers(
                                  patient.medicareNumber,
                                  patient._id,
                                  patient.name
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faUserGroup} />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                            title="Delete"
                            style={{ width: "36px", height: "36px", padding: 0 }}
                            onClick={() => deletePatient(patient._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>

                          {/* Status Toggle Button */}
                          <button
                            className={`btn btn-sm ${patient.status === 1 ? "btn-outline-danger" : "btn-outline-success"
                              } d-flex align-items-center justify-content-center`}
                            title={patient.status === 1 ? "Disable" : "Enable"}
                            style={{ width: "36px", height: "36px", padding: 0 }}
                            onClick={() => togglePatientStatus(patient._id, patient.status)}
                          >
                            <FontAwesomeIcon
                              icon={patient.status === 1 ? faToggleOff : faToggleOn}
                            />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <Row className="align-items-center mt-3">
              <Col xs={12} md="auto" className="mb-2 mb-md-0">
                <span>Showing {currentRecords.length} of {filteredData.length} entries</span>
              </Col>
              <Col xs={12} md className="text-md-end">
                <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start">
                  <Button size="sm" color="primary" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</Button>
                  <span className="align-self-center">Page {currentPage} of {totalPages}</span>
                  <Button size="sm" color="primary" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>

      {/* Family Members Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="xl" centered>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>{modalTitle}</ModalHeader>
        <ModalBody>
          {familyMembers.length > 0 ? (
            <div className="table-responsive">
              <Table bordered hover striped className="text-center align-middle mb-0">
                <thead className="table-success">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>State</th>
                    <th>DOB</th>
                    <th>Medicare #</th>
                    <th>Address</th>
                    <th>Zip Code</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {familyMembers.map((m) => (
                    <tr key={m._id}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.phone}</td>
                      <td>{m.city}</td>
                      <td>{m.state}</td>
                      <td>{m.DOB}</td>
                      <td>{m.medicareNumber}</td>
                      <td>{m.address}</td>
                      <td>{m.zipCode}</td>
                      <td>{m.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted text-center m-0">No family members found.</p>
          )}
        </ModalBody>
      </Modal>

      {/* View Patient Modal */}
      <Modal
        isOpen={viewModalOpen}
        toggle={() => setViewModalOpen(!viewModalOpen)}
        size="md"
        centered
        style={{ maxWidth: "600px" }}
        contentClassName="p-2"
      >
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>Patient Details</ModalHeader>
        <ModalBody style={{ overflow: "visible" }}>
          {viewPatient ? (
            <Card className="mb-3" style={{ boxShadow: "none" }}>
              <CardBody style={{ padding: "15px", tableLayout: "fixed", width: "100%" }}>
                <Table size="sm" responsive>
                  <tbody>
                    {[
                      "name",
                      "email",
                      "phone",
                      "gender",
                      "DOB",
                      "medicareNumber",
                      "city",
                      "state",
                      "zipCode",
                      "address"
                    ].map((field) => (
                      <tr key={field}>
                        <td style={{ width: "40%", fontWeight: "bold" }}>{field.toUpperCase()}</td>
                        <td style={{ width: "60%" }}>
                          {field === "DOB"
                            ? viewPatient.DOB
                              ? new Date(viewPatient.DOB).toLocaleDateString()
                              : "N/A"
                            : viewPatient[field] || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          ) : (
            <p>No patient selected</p>
          )}
        </ModalBody>
      </Modal>

    </div>
  );
};

export default PatientDetailsTable;
