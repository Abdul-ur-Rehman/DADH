import React from "react";
import './SupportCard.css';  // Import the external CSS file

const SupportCard = () => {
  return (
    <div className="support-card">
      <h2 className="support-card-title">DaVinci Platform Support</h2>
      <p className="support-card-description">
        DaVinci is our web-based software platform that we use to consult
        patients. Before you start your first shift, please watch our training
        videos to get yourself up to speed.
      </p>

      <h3 className="support-card-subtitle">Table of contents – click on a link 👇</h3>
      <ul className="support-card-list">
        <li className="support-card-list-item">
          <strong>Training videos</strong>
          <ul className="support-card-sublist">
            <li>
              <a href="https://www.example.com/video1" target="_blank" rel="noopener noreferrer" className="support-card-link">
               1. How to Navigate the DaVinci Homepage
              </a>
            </li>
          </ul>
        </li>
        <li className="support-card-list-item">
          <strong>Consulting a patient</strong>
          <ul className="support-card-sublist">
            <li>
              <a href="https://www.example.com/video2" target="_blank" rel="noopener noreferrer" className="support-card-link">
               1. Patient Notes Section
              </a>
            </li>
            <li>
              <a href="https://www.example.com/video3" target="_blank" rel="noopener noreferrer" className="support-card-link">
               2. How to write a Prescription
              </a>
            </li>
            <li>
              <a href="https://www.example.com/video4" target="_blank" rel="noopener noreferrer" className="support-card-link">
               3. How to write a Referral
              </a>
            </li>
            <li>
              <a href="https://www.example.com/video5" target="_blank" rel="noopener noreferrer" className="support-card-link">
               4. How to request Investigations: Radiology and Pathology
              </a>
            </li>
            <li>
              <a href="https://www.example.com/video6" target="_blank" rel="noopener noreferrer" className="support-card-link">
              5. How to write a Medical Certificate
              </a>
            </li>
            <li>
              <a href="https://www.example.com/video7" target="_blank" rel="noopener noreferrer" className="support-card-link">
               6. How to Bill a Consultation
              </a>
            </li>
            <li>
              <a href="https://www.example.com/video8" target="_blank" rel="noopener noreferrer" className="support-card-link">
               7. Finding a Consultation and Re-queuing Patients
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default SupportCard;
