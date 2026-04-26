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
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "./Consult.css";

const ConsultationCategoryTable = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const recordsPerPage = 20;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

  const [categoryData, setCategoryData] = useState({
    category: "",
    notes: "",
    key: "",
  });

  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ category: "", notes: "", key: "" });

  const getConsultationCategories = async () => {
    try {
      const response = await fetch(`/api/consultationCategory/getAll`);
      const result = await response.json();
      if (response.ok) {
        setCategory(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getConsultationCategories();
  }, []);

  const deleteConsultationCategory = async (id) => {
  if (!id) return;

  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/consultationCategory/deleteById/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        await response.json();

        if (response.ok) {
          getConsultationCategories();
          Swal.fire("Deleted!", "Consultation category deleted successfully.", "success");
        } else {
          Swal.fire("Error", "Failed to delete.", "error");
        }
      } catch (error) {
        console.error("Network error:", error);
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  });
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!categoryData.category.trim()) newErrors.category = "Category is required";
    else if (categoryData.category.length < 3) newErrors.category = "Minimum 3 characters";

    if (!categoryData.notes.trim()) newErrors.notes = "Notes are required";
    else if (categoryData.notes.length < 5) newErrors.notes = "Minimum 5 characters";

    if (!categoryData.key.trim()) newErrors.key = "Key is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Add New Consult Successfully",
          confirmButtonColor: "#3085d6",
        });
        setModalOpen(false);
        setCategoryData({ category: "", notes: "", key: "" });
        getConsultationCategories();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({ category: item.category, notes: item.notes, key: item.key });
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
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/updateOneById/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        Swal.fire("Success", "Updated consultation category.", "success");
        setEditingId(null);
        setEditForm({ category: "", notes: "", key: "" });
        getConsultationCategories();
      } else {
        Swal.fire("Error", "Failed to update category.", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Error", "Something went wrong while updating.", "error");
    }
  }
};


useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleCancelEdit();
    if (e.key === "Enter" && editingId) handleSave(editingId);
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [editingId, editForm]);


  const filteredData = category.filter((item) =>
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}>
        <Card>
          <CardBody>
            <h3 className="mb-4 fw-semibold">Consultation Categories</h3>
            <Row className="mb-3 align-items-center">
              <Col sm={12} md={8} className="mb-3">
                <InputGroup style={{ maxWidth: "200px" }}>
                  <Input
                    type="text"
                    placeholder="Search by Category"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col sm={12} md={4} className="mb-3 d-flex justify-content-md-end">
                <Button color="primary" onClick={() => setModalOpen(true)}>
                  Add New Category
                </Button>
              </Col>
            </Row>

            <div className="table-responsive">
              <Table bordered striped className="text-center mb-0">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Category</th>
                    <th>Notes</th>
                    <th>Key</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5">No matching records found</td>
                    </tr>
                  ) : (
                    currentRecords.map((item, index) => {
                      const isEditing = item._id === editingId;
                      return (
                        <tr key={item._id}>
                          <td>{indexOfFirstRecord + index + 1}</td>
                          <td>
                            {isEditing ? (
                              <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                            ) : (
                              item.category
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <Input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                            ) : (
                              item.notes
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <Input value={editForm.key} onChange={(e) => setEditForm({ ...editForm, key: e.target.value })} />
                            ) : (
                              item.key
                            )}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              {isEditing ? (
                                <>
                                  <button  className="btn btn-sm btn-outline-success"
                                title="Save"
                                style={{ width: "36px", height: "36px", padding: 0 }}
                                 onClick={() => handleSave(item._id)}>
                                    <FontAwesomeIcon icon={faSave} />
                                  </button>
                                </>
                              ) : (
                                <Button size="sm" outline color="primary" onClick={() => handleEdit(item)}>
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                outline
                                color="danger"
                                onClick={() => deleteConsultationCategory(item._id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
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
                <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start align-items-center">
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

        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Add New Consultation Category</ModalHeader>
          <ModalBody>
            <form onSubmit={handleAddCategory}>
              <div className="mb-3">
                <label>Category</label>
                <Input type="text" name="category" value={categoryData.category} onChange={handleChange} />
                {errors.category && <small className="text-danger">{errors.category}</small>}
              </div>
              <div className="mb-3">
                <label>Notes</label>
                <Input type="text" name="notes" value={categoryData.notes} onChange={handleChange} />
                {errors.notes && <small className="text-danger">{errors.notes}</small>}
              </div>
              <div className="mb-3">
                <label>Key</label>
                <Input type="text" name="key" value={categoryData.key} onChange={handleChange} />
                {errors.key && <small className="text-danger">{errors.key}</small>}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button type="button" color="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Add Category
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default ConsultationCategoryTable;
