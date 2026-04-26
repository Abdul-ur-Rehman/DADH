// src/components/DoctorPersonalInfoCard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Spinner,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";

const DoctorPersonalInfoCard = () => {
  const navigate          = useNavigate();
  const signatureRef      = useRef(null);
  const DocId             = localStorage.getItem("sendBirdUserId");
  const apiRoot           = "http://localhost:5001/api/doctor-requests/";

  /* ───────────────────────────────────────────
     Static dropdown lists
     ───────────────────────────────────────────*/
  const doctorTypes = [
    "Hospital Doctor",
    "Clinic Doctor",
    "General Practitioner",
    "Specialist",
    "VR",
    "GP Fellow",
    "GP Registrar",
    "AHOMP",
    "PEP FSP",
    "PEP",
  ];
  const preferencesList = ["Telehealth", "Homevisit"];

  /* ───────────────────────────────────────────
     Local state
     ───────────────────────────────────────────*/
  const [doctorData, setDoctorData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    providerNumber: "",
    prescriberNumber: "",
    gender: "",
    qualification: "",
    doctorType: "",
    preferences: [],
    signature: "",
    additionalText: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  /* ───────────────────────────────────────────
     Helper: load base64 signature → canvas
     ───────────────────────────────────────────*/
  const loadSignatureToCanvas = useCallback((sig) => {
    if (signatureRef.current && sig) {
      try {
        signatureRef.current.clear();
        signatureRef.current.fromDataURL(`data:image/png;base64,${sig}`);
      } catch (err) {
        console.error("Failed to load signature:", err);
      }
    }
  }, []);

  /* ───────────────────────────────────────────
     Fetch doctor on mount
     ───────────────────────────────────────────*/
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiRoot}getOneById/${DocId}`);
        if (!res.ok) throw new Error("Network error");
        const { data } = await res.json();

        setDoctorData({
          ...data,
          // fallback if backend sent workType instead of preferences[]
          preferences:
            Array.isArray(data.preferences) && data.preferences.length
              ? data.preferences
              : data.workType
              ? [data.workType]
              : [],
        });

        loadSignatureToCanvas(data.signature);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [DocId, apiRoot, loadSignatureToCanvas]);

  /* Reload sig onto canvas if it changes in state */
  useEffect(() => {
    if (doctorData.signature) loadSignatureToCanvas(doctorData.signature);
  }, [doctorData.signature, loadSignatureToCanvas]);

  /* ───────────────────────────────────────────
     Handlers
     ───────────────────────────────────────────*/
  const handleFullNameChange = (e) => {
    const full = e.target.value.trim();
    const [first = "", ...rest] = full.split(" ");
    setDoctorData((p) => ({ ...p, name: first, surname: rest.join(" ") }));
  };

  const onPreferencesChange = (e) => {
    const { value, checked } = e.target;
    setDoctorData((p) => ({
      ...p,
      preferences: checked
        ? [...p.preferences, value]
        : p.preferences.filter((pref) => pref !== value),
    }));
  };

  const handleUpdate = async () => {
    let sig = doctorData.signature;
    let isSignatureProvided = !!sig;

    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const trimmed = signatureRef.current.getTrimmedCanvas();
      const base64  = trimmed.toDataURL("image/png").split(",")[1];
      if (base64 !== sig) {
        sig = base64;
        isSignatureProvided = true;
      }
    }

    try {
      const res = await fetch(`${apiRoot}update-doctor/${DocId}`, {
        method : "PATCH",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ ...doctorData, signature: sig, isSignatureProvided }),
      });
      if (!res.ok) throw new Error("Update failed");
      navigate("/doctor/myAccount");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  /* ───────────────────────────────────────────
     Render
     ───────────────────────────────────────────*/
  if (isLoading) {
    return (
      <div className="text-center mt-4 pt-5">
        <Spinner color="primary" />
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div
        className="bg-white shadow-lg rounded-3 p-4 w-100"
        style={{ maxWidth: 1000, marginTop: 50, marginBottom: 80 }}
      >
        <Card>
          <CardBody>
            <h3 className="text-2xl fw-semibold mb-3">
              Doctor Personal Information
            </h3>

            {/* Full Name */}
            <FormGroup>
              <Label for="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={`${doctorData.name} ${doctorData.surname}`.trim()}
                onChange={handleFullNameChange}
              />
            </FormGroup>

            {/* Phone */}
            <FormGroup>
              <Label for="phone">Phone</Label>
              <Input
                id="phone"
                value={doctorData.phone}
                onChange={(e) => setDoctorData({ ...doctorData, phone: e.target.value })}
              />
            </FormGroup>

            {/* Email */}
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={doctorData.email}
                onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })}
              />
            </FormGroup>

            {/* Provider Number */}
            <FormGroup>
              <Label for="providerNumber">Provider Number</Label>
              <Input
                id="providerNumber"
                value={doctorData.providerNumber}
                onChange={(e) => setDoctorData({ ...doctorData, providerNumber: e.target.value })}
              />
            </FormGroup>

            {/* Prescriber Number */}
            <FormGroup>
              <Label for="prescriberNumber">Prescriber Number</Label>
              <Input
                id="prescriberNumber"
                value={doctorData.prescriberNumber}
                onChange={(e) => setDoctorData({ ...doctorData, prescriberNumber: e.target.value })}
              />
            </FormGroup>

            {/* Gender */}
            <FormGroup>
              <Label for="gender">Gender</Label>
              <Input
                id="gender"
                type="select"
                value={doctorData.gender}
                onChange={(e) => setDoctorData({ ...doctorData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </Input>
            </FormGroup>

            {/* Qualification */}
            <FormGroup>
              <Label for="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={doctorData.qualification}
                onChange={(e) => setDoctorData({ ...doctorData, qualification: e.target.value })}
              />
            </FormGroup>

            {/* Doctor Type */}
            <FormGroup>
              <Label for="doctorType">Doctor Type</Label>
              <Input
                id="doctorType"
                type="select"
                value={doctorData.doctorType}
                onChange={(e) => setDoctorData({ ...doctorData, doctorType: e.target.value })}
              >
                <option value="">Select Type</option>
                {doctorTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Input>
            </FormGroup>

            {/* Signature */}
            <FormGroup>
              <Label>Signature</Label>
              <div style={{ border: "1px solid #ccc", borderRadius: 4, width: 400, height: 150 }}>
                <SignatureCanvas
                  penColor="black"
                  ref={signatureRef}
                  canvasProps={{ width: 400, height: 150, style: { backgroundColor: "#fff" } }}
                />
              </div>
              <Button color="secondary" className="mt-2" onClick={() => {
                signatureRef.current?.clear();
                setDoctorData((p) => ({ ...p, signature: "" }));
              }}>
                Clear Signature
              </Button>
            </FormGroup>

            {/* Preferences */}
            <strong>Preferences</strong>
            <div className="d-flex flex-wrap mb-3">
              {preferencesList.map((pref) => (
                <FormGroup check inline key={pref}>
                  <Label check>
                    <Input
                      type="checkbox"
                      value={pref}
                      checked={doctorData.preferences.includes(pref)}
                      onChange={onPreferencesChange}
                    />{" "}
                    {pref}
                  </Label>
                </FormGroup>
              ))}
            </div>

            {/* Save Button */}
            <div className="text-start">
              <Button color="primary" onClick={handleUpdate}>
                Save Changes
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DoctorPersonalInfoCard;
