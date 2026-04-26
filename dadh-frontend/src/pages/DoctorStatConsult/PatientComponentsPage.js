import React from "react";
// import ConditionsCard from "./DoctorStartComponents/ConditionsCard";
import PastScripteCard from "./DoctorStartComponents/PastScripteCard";
import PatientDetailsCard from "./DoctorStartComponents/PatientDetailsCard";
import "./PatientComponents.css"; // External CSS import
import { useParams } from "react-router-dom";


const PatientComponentsPage = () => {
  const { id } = useParams();


  return (
    <div className="dashboard-container">
      <div className="left-section">
        <PatientDetailsCard id={id}/>
      </div>

      <div className="right-section">
        <PastScripteCard id={id} />
      </div>
    </div>
  );
};

export default PatientComponentsPage;
