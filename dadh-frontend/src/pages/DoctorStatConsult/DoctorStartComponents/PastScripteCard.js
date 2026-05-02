import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";
import "./styles.css";

const PastScriptsCard = () => {
  const [consultations, setConsultations] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [patient, setPatient] = useState(null);
  const [patientId, setPatientId] = useState(null);

  const BASE_URL = "http://localhost:5001/api";

  /* --- read patient from whichever LS key exists --- */
  useEffect(() => {
    const raw =
      localStorage.getItem("consultPatientData") || localStorage.getItem("data");
    if (!raw) return console.warn("No patient info in localStorage");

    try {
      const parsed = JSON.parse(raw);
      setPatient(parsed?.data || parsed);          // handles both shapes
      setPatientId((parsed?.data || parsed)?._id);
    } catch (e) {
      console.error("Failed to parse patient:", e);
    }
  }, []);

  /* --- fetch consultations --- */
  useEffect(() => {
    if (!patientId) return;

    const fetchAll = () => getConsultations(patientId);
    fetchAll();
    const id = setInterval(fetchAll, 30_000);
    return () => clearInterval(id);
  }, [patientId]);

  const getConsultations = async (pid) => {
    try {
      /* ⬇ SAME MIS‑SPELLED ROUTE THAT WORKS IN YOUR OTHER COMPONENT */
      const res = await fetch(
        `${BASE_URL}/consultations/getConsulationByPatient/${pid}`
      );
      const json = await res.json();

      if (!res.ok) {
        return console.error(`(${res.status}) ${json.message || "Error"}`);
      }

      const list = await Promise.all(
        json.data.map(async (c) => {
          const cat = await getCategoryName(c.consultationCategory);
          const obj = {
            ...c,
            patientName: patient.name,
            patientAge: calcAge(patient.DOB),
            patientGender: patient.gender,
            consultationCategoryName: cat,
          };
          if (!c.isCompleted) {
            localStorage.setItem("incompleteConsultation", JSON.stringify(obj));
          }
          return obj;
        })
      );
      setConsultations(list);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const getCategoryName = async (key) => {
    try {
      const r = await fetch(`${BASE_URL}/consultationCategory/getOneByKey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const j = await r.json();
      return r.ok ? j.data.category : key;
    } catch (e) {
      console.error(e);
      return key;
    }
  };

  const calcAge = (dob) => {
    if (!dob) return "N/A";
    const b = new Date(dob);
    const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    if (
      t.getMonth() < b.getMonth() ||
      (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())
    )
      age--;
    return age;
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const icon = (t) =>
    t === "videoCall" ? (
      <VideoIcon size={20} className="me-1" />
    ) : t === "phoneCall" ? (
      <PhoneCallIcon size={20} className="me-1" />
    ) : t === "textChat" ? (
      <MessageSquareIcon size={20} className="me-1" />
    ) : null;

  return (
    <div className="past mt-0">
      <Card className="container-class">
        <Card.Title className="title-card">Past Consultations</Card.Title>
        <hr className="divider" />

        {consultations.length === 0 ? (
          <Card.Text className="text-card">No consultations found.</Card.Text>
        ) : (
          consultations.map((c, i) => (
            <div key={i} className="patient-toggle-card mb-2">
              <div
                className="toggle-header"
                onClick={() =>
                  setExpandedIndex((prev) => (prev === i ? null : i))
                }
                style={{
                  cursor: "pointer",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: 10,
                  borderRadius: 5,
                  border: "1px solid #ddd",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    {icon(c.type)} <strong>{c.patientName}</strong> –{" "}
                    {c.consultationCategoryName}
                  </div>
                  <div>{expandedIndex === i ? "▲" : "▼"}</div>
                </div>
              </div>

              {expandedIndex === i && (
                <div
                  style={{
                    background: "#fefefe",
                    padding: 10,
                    border: "1px solid #ddd",
                    borderTop: "none",
                    borderRadius: "0 0 5px 5px",
                  }}
                >
                  <p>
                    <strong>Age / Gender:</strong> {c.patientAge}, {c.patientGender}
                  </p>
                  <p>
                    <strong>Date:</strong> {fmtDate(c.createdAt)}
                  </p>
                  <p>
                    <strong>Notes:</strong> {c.notes || "No notes available"}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default PastScriptsCard;
