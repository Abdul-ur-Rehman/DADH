import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Table,
  Button,
  Input,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Label,
} from "reactstrap";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import "./Bill.css";

const BillingTable = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [billingData, setBillingData] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

const [newBilling, setNewBilling] = useState({
  billCode: "",
  shortDescription: "",
  amount: "",
});


  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;

  const getBillingData = async () => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/billing/getAllBilling`);
      if (response.ok) {
        const data = await response.json();
        setBillingData(data.data);
        setFilteredData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch billing data", error);
    }
  };

  useEffect(() => {
    getBillingData();
  }, []);

  useEffect(() => {
    const result = billingData.filter(
      bill =>
        bill.billCode.toLowerCase().includes(search.toLowerCase()) ||
        bill.shortDescription.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
    setCurrentPage(1);
  }, [search, billingData]);

  const handleEdit = id => setEditingKey(id);

  const handleSave = async (id) => {
    const updatedRecord = billingData.find((item) => item._id === id);
    if (!updatedRecord) return;

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
        const response = await fetch(`${REACT_APP_BACKEND_URL}/billing/updateOne/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRecord),
        });

        if (response.ok) {
          Swal.fire("Success", "Billing record updated successfully.", "success");
          setEditingKey(null);
        } else {
          Swal.fire("Error", "Failed to update billing record.", "error");
        }
      } catch (error) {
        console.error("Failed to update billing record:", error);
        Swal.fire("Error", "Something went wrong while updating.", "error");
      }
    }
  };

  // ✅ Delete Function with Confirmation
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${REACT_APP_BACKEND_URL}/billing/deleteById/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            setBillingData((prev) => prev.filter(item => item._id !== id));
            Swal.fire("Deleted!", "Billing record deleted successfully.", "success");
          } else {
            Swal.fire("Error", "Failed to delete billing record.", "error");
          }
        } catch (error) {
          Swal.fire("Error", "Something went wrong while deleting.", "error");
        }
      }
    });
  };


  // ✅ Add Function
 const handleAdd = async () => {
  const {
    billCode,
    shortDescription,
    amount,
    total_amount,
    doctorId,
    patientId,
    consultation_id,
  } = newBilling;

  // Basic validation
  if (!billCode || !shortDescription || !amount) {
    Swal.fire("Validation Error", "Please fill all required fields.", "warning");
    return;
  }

  try {
    const response = await fetch(`${REACT_APP_BACKEND_URL}/billing/add`, {
      method: "POST",
      body: JSON.stringify({
        billCode,
        shortDescription,
        amount,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      setBillingData([...billingData, data.data]);
      setModal(false);
      setNewBilling({
        billCode: "",
        shortDescription: "",
        amount: "",
      });
      Swal.fire("Success", "Billing record added successfully.", "success");
    } else {
      Swal.fire("Error", "Failed to add billing record.", "error");
    }
  } catch (error) {
    Swal.fire("Error", "Something went wrong while adding.", "error");
  }
};



  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-3 p-4 w-100" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }} >
        <Card>
          <CardBody>
            <h3 className="text-2xl font-semibold text-start mb-3">Billing Record</h3>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <InputGroup style={{ maxWidth: "200px" }} className="mb-2 mb-md-0">
                <Input
                  type="text"
                  placeholder="Search Billing Code"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </InputGroup>
              <Button color="primary" onClick={() => setModal(true)}>
                Add Billing Record
              </Button>
            </div>
            <div className="table-responsive">
              <Table bordered striped className="text-center">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Billing Code</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr><td colSpan="5">No records found</td></tr>
                  ) : (
                    currentRecords.map((item, index) => (
                      <tr key={item._id}>
                        <td>{indexOfFirstRecord + index + 1}</td>
                        <td>{editingKey === item._id ? <Input value={item.billCode} onChange={e => setBillingData(billingData.map(b => b._id === item._id ? { ...b, billCode: e.target.value } : b))} /> : item.billCode}</td>
                        <td>{editingKey === item._id ? <Input value={item.shortDescription} onChange={e => setBillingData(billingData.map(b => b._id === item._id ? { ...b, shortDescription: e.target.value } : b))} /> : item.shortDescription}</td>
                        <td>{editingKey === item._id ? <Input type="number" value={item.amount} onChange={e => setBillingData(billingData.map(b => b._id === item._id ? { ...b, amount: e.target.value } : b))} /> : item.amount}</td>
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            {editingKey === item._id ? (
                              <button
                                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                title="Save"
                                style={{ width: "36px", height: "36px", padding: 0 }}
                                onClick={() => handleSave(item._id)}
                              >
                                <Save size={18} />
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                title="Edit"
                                style={{ width: "36px", height: "36px", padding: 0 }}
                                onClick={() => handleEdit(item._id)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                              title="Delete"
                              style={{ width: "36px", height: "36px", padding: 0 }}
                              onClick={() => handleDelete(item._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            <div className="d-flex flex-wrap justify-content-between mt-3">
              <span>Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} entries</span>
              <div>
                <Button size="sm" color="light" className="ms-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</Button>
                <Button size="sm" color="primary" className="ms-2" disabled>{currentPage}</Button>
                <Button size="sm" color="light" className="ms-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Modal for Adding Billing */}
        <Modal isOpen={modal} toggle={() => setModal(!modal)}>
          <ModalHeader toggle={() => setModal(!modal)}>Add Billing Record</ModalHeader>
          <ModalBody>
            <Row>
              <Col lg="12">
                <div className="mb-3">
                  <Label>Billing Code</Label>
                  <Input value={newBilling.billCode} onChange={e => setNewBilling({ ...newBilling, billCode: e.target.value })} />
                </div>
                <div className="mb-3">
                  <Label>Description</Label>
                  <Input value={newBilling.shortDescription} onChange={e => setNewBilling({ ...newBilling, shortDescription: e.target.value })} />
                </div>
                <div className="mb-3">
                  <Label>Amount</Label>
                  <Input type="number" value={newBilling.amount} onChange={e => setNewBilling({ ...newBilling, amount: e.target.value })} />
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleAdd}>
              <Plus size={16} className="me-1" /> Add Record
            </Button>
            <Button color="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default BillingTable;
