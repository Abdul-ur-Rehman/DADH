import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";
import { Button, FormGroup, Label } from "reactstrap";
import { Typography, Divider } from "@mui/material";
import moment from "moment";
import "./PatientDetails.css";


const PatientDetailCard = () => {
  const { id } = useParams();
  const consultationId = id;
  const navigate = useNavigate();
  const [patientHosInfo, setPatientHosInfo] = useState(null);
  const [consultInfo, setConsultInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState(false);
  const [consultCategory, setConsultCategory] = useState(false);
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";
  const [isPatientIsInConsulting, setIsPatientIsInConsulting] = useState(null);

  const isConsulting = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/getOneById/${consultationId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Consultation data", data.data);
        if (!data.data.doctorId) {
          setLoading(false);
          setIsPatientIsInConsulting(false);
        } else {
          setLoading(true);
          setIsPatientIsInConsulting(true);
        }
      }
    } catch (error) {
      console.log("Error in isConsulting", error);
    }
  };

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const consultResp = await fetch(
          `${REACT_APP_BACKEND_URL}/consultations/getOneById/${consultationId}`
        );
        const data = await consultResp.json();
        if (consultResp.ok) {
          setConsultInfo(data.data);
          if (data.data?.patientId) {
            fetchPatientHosInfo(data.data.patientId);
            setPatientId(data.data.patientId);
            fetchConsultationCategory(data.data.consultationCategory);
          }
        }
      } catch (error) {
        console.error("Error fetching consultation:", error);
      }
    };

    fetchConsultation();
    isConsulting();
  }, [id]);

  const fetchConsultationCategory = async categoryKey => {
    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultationCategory/getOneByKey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: categoryKey }),
      });

      const data = await response.json();
      if (response.ok) {
        setConsultCategory(data.data);
        console.log("consultation category key:", data.data.category);
      } else {
        console.log("Error response:", data);
      }
    } catch (error) {
      console.error("Error fetching consultation category:", error);
    }
  };

  const fetchPatientHosInfo = async patientId => {
    try {
      const api = `/api/patient/auth/getOneById/${patientId}`;

      const response = await fetch(`${REACT_APP_BACKEND_URL}/patient/auth/getOneById/${patientId}`);
      const data = await response.json();
      if (response.ok) {
        setPatientHosInfo(data.data);
      }
    } catch (error) {
      console.error("Error fetching patient info:", error);
    }
  };

  const handleStartConsult = async () => {
    setLoading(true);
    try {
      const jsonData = JSON.parse(localStorage.getItem("data"));
      const doctorId = jsonData.data._id;
      localStorage.setItem("consultationId", consultationId);
      localStorage.setItem("patientId", patientId);
      localStorage.setItem("consultPatientData", JSON.stringify(patientHosInfo));
      console.log("patientHosInfo ", patientHosInfo);
      if (!doctorId || !consultInfo?._id) {
        console.error("Doctor ID or Consultation ID is missing");
        setLoading(false);
        return;
      }

      const updateBody = {
        doctorId: doctorId,
        consultationId: consultInfo._id,
        isConsulting: true,
        patientId: patientId,
      };

      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/assignDoctor`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Navigating with patientId:", patientId);

        // update the local storage with the new consultation ID
        const storedData = JSON.parse(localStorage.getItem("data"));
        storedData.data.activeConsultationId = data.consultation._id;
        localStorage.setItem("data", JSON.stringify(storedData));

        navigate("details", { state: { patientId: patientId } });
      } else {
        console.error("Error starting consultation:", data);
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = timestamp => {
    if (!timestamp) return "N/A";
    const createdTime = moment(timestamp);
    return createdTime.format("DD/MM/YYYY, hh:mm A");
  };

  const calculateAge = DOB => {
    if (!DOB) return "N/A";
    const birthDate = new Date(DOB);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  if (!consultInfo || !patientHosInfo) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  return (
    <Card className="py-2 px-3 rounded-xl shadow-xl text-left w-full max-w-md mx-auto">
      <div
        className="d-flex flex-wrap gap-3"
        style={{ fontSize: "18px", fontWeight: "bold",}}
      >
        <p className="text-sm font-bold">
          {patientHosInfo?.name || "Patient Name"} {" "}
          ({patientHosInfo?.DOB ? calculateAge(patientHosInfo.DOB) : "N/A"}),{" "}
          {patientHosInfo?.city || "Address"}
        </p>
      </div>
      <div className="flex justify-between text-xs font-extrabold mb-3">
        <span  className="label-text">Date Of Birth: </span>{" "}
        <span className="font-black">{patientHosInfo?.DOB || "N/A"}</span>
      </div>

      <div className="flex justify-between text-xs font-extrabold mb-3">
        <span  className="label-text">Consult Preference: </span> {" "}
        <span className="font-black">{consultInfo?.type || "N/A"}</span>
      </div>

      <div className="flex justify-between text-xs font-extrabold mb-3">
        <span  className="label-text">Request Time: </span>{" "}
        <span className="font-black">{formatTime(consultInfo?.createdAt)}</span>
      </div>

      <div className="flex justify-between text-xs font-extrabold mb-3">
        <span  className="label-text">Symptom or Condition: </span>{" "}
        <span className="font-black">{consultCategory?.category || "N/A"}</span>
      </div>

      <div className="flex justify-between text-xs font-extrabold mb-3">
        <span  className="label-text">Additional Info: </span>{" "}
        <span className="font-black">{consultInfo?.notes || "N/A"}</span>
      </div>


      <FormGroup className="w-full">
        <Button
          className="w-100 bg-primary rounded-lg text-white rounded-md"
          onClick={handleStartConsult}
          disabled={loading}
        >
          {isPatientIsInConsulting
            ? "Already in consultation"
            : loading
              ? "Loading..."
              : "Start Consultation"}
        </Button>
      </FormGroup>
    </Card>
  );
};

export default PatientDetailCard;
