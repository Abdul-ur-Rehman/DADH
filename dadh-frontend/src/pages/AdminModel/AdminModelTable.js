// ... [Keep all your imports unchanged]
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
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const AdminModelTable = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const recordsPerPage = 20;

  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

  const getAdmins = async () => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/admin/auth/getAll`);
      const result = await response.json();
      if (response.ok && result.data) {
        const sortedData = result.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(sortedData);
        setFilteredData(sortedData);
      } else {
        console.error("Fetch Error:", result.message || "Failed to fetch admins.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    getAdmins();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    const searchLower = search.toLowerCase();
    const filtered = data.filter((admin) =>
      (admin.username || "").toLowerCase().includes(searchLower) ||
      (admin.email || "").toLowerCase().includes(searchLower)
    );
    setFilteredData(filtered);
  }, [search, data]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / recordsPerPage));

  const formatLevel = (level) => {
    const lvl = (level || "").toLowerCase();
    if (lvl === "superadmin") return "Super Admin";
    if (lvl === "subadmin") return "Sub Admin";
    return "-";
  };

  const handleStatusToggle = async (id, currentStatus, username) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await fetch(`${REACT_APP_BACKEND_URL}/admin/auth/toggleActive/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const result = await response.json();
      if (response.ok) {
        setData((prev) =>
          prev.map((admin) =>
            admin._id === id ? { ...admin, status: newStatus } : admin
          )
        );

        Swal.fire({
          icon: newStatus === 1 ? "success" : "warning",
          title: newStatus === 1 ? "Admin Enabled" : "Admin Disabled",
          text:
            newStatus === 1
              ? `${username} is now enabled and can login.`
              : `${username} is now disabled and cannot login.`,
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to update status", "error");
      }
    } catch (err) {
      console.error("Status update error", err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (admin) => {
    setEditId(admin._id);
    setEditForm({ username: admin.username, email: admin.email });
  };

const handleSave = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to save the changes?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, save it!",
    cancelButtonText: "Cancel",
  });

  if (confirm.isConfirmed) {
    try {
      await fetch(`${REACT_APP_BACKEND_URL}/admin/auth/updateById/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      setEditId(null);
      getAdmins();
      Swal.fire("Saved!", "Changes have been saved.", "success");
    } catch (err) {
      console.error("Edit update error", err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  }
};


  const handleDelete = async (id) => {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetch(`${REACT_APP_BACKEND_URL}/admin/auth/deleteById/${id}`, {
          method: "DELETE",
        });
        getAdmins();
        Swal.fire("Deleted!", "Admin has been deleted.", "success");
      } catch (err) {
        console.error("Delete error", err);
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  });
};


  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div
        className="bg-white shadow-lg rounded-3 p-4 w-100"
        style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}
      >
        <Card>
          <CardBody>
            <h3 className="mb-4 fw-semibold">Admin Information</h3>

            <Row className="mb-3 align-items-center">
              <Col sm={12} md={8} className="mb-3">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <Input
                    type="text"
                    placeholder="Search by username or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col sm={12} md={4} className="mb-3 d-flex justify-content-md-end">
                <Link to="/admin/register/form">
                  <Button color="primary" style={{ maxWidth: "200px" }}>
                    New Admin
                  </Button>
                </Link>
              </Col>
            </Row>

            <div className="table-responsive mt-3">
              <Table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>S.No</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-danger">
                        No matching records found
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((admin, i) => {
                      const isEditing = editId === admin._id;
                      return (
                        <tr key={admin._id}>
                          <td>{(currentPage - 1) * recordsPerPage + i + 1}</td>
                          <td>
                            {isEditing ? (
                              <Input
                                value={editForm.username}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, username: e.target.value })
                                }
                              />
                            ) : (
                              admin.username || "-"
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <Input
                                value={editForm.email}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, email: e.target.value })
                                }
                              />
                            ) : (
                              admin.email || "-"
                            )}
                          </td>
                          <td>{formatLevel(admin.level)}</td>
                          <td>
                            <span
                              className={`badge ${admin.status === 1 ? "bg-success" : "bg-danger"
                                }`}
                            >
                              {admin.status === 1 ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="d-flex gap-1 justify-content-center flex-wrap">
                            {isEditing ? (
                              <button
                                className="btn btn-sm btn-outline-success"
                                title="Save"
                                style={{ width: "36px", height: "36px", padding: 0 }}
                                onClick={() => handleSave(admin._id)}
                              >
                                <FontAwesomeIcon icon={faSave} />
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                                style={{ width: "36px", height: "36px", padding: 0 }}
                                onClick={() => handleEdit(admin)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            )}

                            <button
                              className={`btn btn-sm ${admin.status === 1 ? "btn-outline-danger" : "btn-outline-success"
                                } d-flex align-items-center justify-content-center`}
                              title={admin.status === 1 ? "Disable" : "Enable"}
                              style={{ width: "36px", height: "36px", padding: 0 }}
                              onClick={() => handleStatusToggle(admin._id, admin.status, admin.username)}
                            >
                              <FontAwesomeIcon
                                icon={admin.status === 1 ? faToggleOff : faToggleOn}
                              />
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              style={{ width: "36px", height: "36px", padding: 0 }}
                              onClick={() => handleDelete(admin._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminModelTable;
