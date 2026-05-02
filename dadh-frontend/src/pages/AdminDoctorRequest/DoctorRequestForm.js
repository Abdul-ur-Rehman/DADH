import Select from 'react-select';
import React, { useState, useEffect } from "react";
import { Row, Col, Input, Label, Button } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./Doctor.css";

const DoctorRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = "/api/doctor-requests";

  const [doctorData, setDoctorData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    workType: "",
    prescriberNumber: "",
    providerNumber: "",
    isHomeVisit: "",
    startDate: "",
    key: "",
    gender: "",
    doctorType: "",
    isApproved: true,
    qualification: "",
  });

  const [isReadyForUpdate, setIsReadyForUpdate] = useState(false);

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

  const getDoctorRequestByID = async () => {
    try {
      const response = await fetch(`${api}/getOneById/${id}`);
      const result = await response.json();
      if (response.ok) {
        const data = result.data;
        setDoctorData(data || {});

        // Check if both prescriber and provider number exist
        if (data?.prescriberNumber && data?.providerNumber) {
          setIsReadyForUpdate(true);
        } else {
          setIsReadyForUpdate(false);
        }

      } else {
        console.error("Error:", result);
      }
    } catch (error) {
      console.error("Error fetching doctor request:", error);
    }
  };

  useEffect(() => {
    if (id) getDoctorRequestByID();
  }, [id]);

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
      const prescriberCheck = await fetch(`${api}/check-prescriber/${doctorData.prescriberNumber}`);
      if (!prescriberCheck.ok) {
        const errorResult = await prescriberCheck.json();
        Toast.fire({
          icon: 'error',
          html: `<span class="toast-title">${errorResult.message}</span>`,
        });
        return;
      }

      const providerCheck = await fetch(`${api}/check-provider/${doctorData.providerNumber}`);
      if (!providerCheck.ok) {
        const errorResult = await providerCheck.json();
        Toast.fire({
          icon: 'error',
          html: `<span class="toast-title">${errorResult.message}</span>`,
        });
        return;
      }

      const response = await fetch(`${api}/approve-doctor/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isApproved: true,
          prescriberNumber: Number(doctorData.prescriberNumber),
          providerNumber: Number(doctorData.providerNumber),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDoctorData(data.data);
        setIsReadyForUpdate(true);
        Swal.fire("Approved!", "Doctor has been approved.", "success");
      } else {
        console.error("Approval failed");
      }

    } catch (error) {
      console.error("Error approving doctor request:", error);
      Swal.fire("Error", "Something went wrong during approval", "error");
    }
  };


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
      const response = await fetch(`${api}/update-doctor/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Updated!", "Doctor details updated successfully.", "success");
        navigate(`/admin/doctor-requests/table`);
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


  const handleChange = e => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    navigate(`/admin/doctor-requests/table`);
  };

  return (
    <div className="flex justify-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl p-5 w-full md:max-w-2xl mx-auto" style={{ maxWidth: "1000px", marginTop: "120px", marginBottom: "80px" }}>
        <h3 className="text-2xl font-semibold text-start mb-3">Doctor Request Form</h3>
        <form className="space-y-5">
          <Row>
            <Col md="6">
              <div className="mb-3">
                <Label>Name</Label>
                <Input type="text" name="name" value={doctorData.name} readOnly />
              </div>
              <div className="mb-3">
                <Label>Surname</Label>
                <Input type="text" name="surname" value={doctorData.surname} readOnly />
              </div>
            </Col>
            <Col md="6">
              <div className="mb-3">
                <Label>Phone</Label>
                <Input type="number" name="phone" value={doctorData.phone} readOnly />
              </div>
              <div className="mb-3">
                <Label>City</Label>
                <Input type="text" name="city" value={doctorData.city} readOnly />
              </div>
            </Col>
            <Col md="6">
              <div className="mb-3">
                <Label>State</Label>
                <Input type="text" name="state" value={doctorData.state} readOnly />
              </div>
              <div className="mb-3">
                <Label>Email</Label>
                <Input type="text" name="email" value={doctorData.email} readOnly />
              </div>
            </Col>
            <Col md="6">
              <div className="mb-3">
                <Label>Doctor Qualification</Label>
                <Input name="qualification" value={doctorData.qualification} readOnly />
              </div>
              <div className="mb-3">
                <Label>Work Type</Label>
                <Input type="text" name="workType" value={doctorData.workType} readOnly />
              </div>
            </Col >
            <Col md="6">
              <div className="mb-3">
                <Label>Gender</Label>
                <Input type="text" name="gender" value={doctorData.gender} readOnly />
              </div>
              <div className="mb-3">
                <Label>Start Date</Label>
                <Input type="date" name="startDate" value={doctorData.startDate?.split("T")[0] || ""} readOnly />
              </div>
            </Col >
            <Col md="6">
              <div className="mb-3">
                <Label>Home Visit</Label>
                <Select
                  name="isHomeVisit"
                  isDisabled
                  readOnly
                  value={doctorData.isHomeVisit === "Yes" ? { value: true, label: "Yes" } : { value: false, label: "No" }}
                  onChange={(e) =>
                    setDoctorData({ ...doctorData, isHomeVisit: e.value ? "Yes" : "No" })
                  }
                  options={[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                  ]}
                  placeholder="Select Home Visit Option"
                />
              </div >
            </Col >
            <Col md="12"><hr className="my-3 border-gray-300" /></Col>

            <Col md="6">
              <div className="mb-3">
                <Label>Prescriber Number</Label>
                <Input
                  type="number"
                  name="prescriberNumber"
                  value={doctorData.prescriberNumber}
                  onChange={handleChange}
                />
              </div>
            </Col>
            <Col md="6">
              <div className="mb-3">
                <Label>Provider Number</Label>
                <Input
                  type="number"
                  name="providerNumber"
                  value={doctorData.providerNumber}
                  onChange={handleChange}
                />
              </div >
            </Col>
          </Row >

          <div className="flex justify-end space-x-4 mt-2">
            {isReadyForUpdate ? (
              <Button type="button" color="primary" onClick={handleUpdate}>
                Update
              </Button>
            ) : (
              <Button
                type="button"
                color="primary"
                onClick={handleApprove}
                disabled={!doctorData.prescriberNumber || !doctorData.providerNumber}
              >
                Approve
              </Button>
            )}{" "}
            <Button type="button" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>

          {
            !doctorData.prescriberNumber || !doctorData.providerNumber ? (
              <p className="text-danger text-sm mt-1 text-end">
                Please fill in both Prescriber and Provider numbers to enable approval.
              </p>
            ) : null
          }
        </form >
      </div >
    </div >
  );
};

export default DoctorRequestForm;