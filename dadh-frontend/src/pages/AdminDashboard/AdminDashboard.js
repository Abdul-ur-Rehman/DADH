import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table } from "reactstrap";
import { PhoneCallIcon, VideoIcon, MessageSquareIcon } from "lucide-react";

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);


  // Fetch all consultations
  const getConsultation = async () => {
    try {
      const api = `/api/consultations/getAll`;

      const response = await fetch(`${api}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok) {
        const updatedPatients = await Promise.all(
          result.data.map(async consultation => {
            const patient = await getPatientById(consultation.patientId); // Fetch patient info for each consultation
            const categoryName = await getConsultationCategoryName(
              consultation.consultationCategory
            ); // Fetch consultation category name
            return {
              ...consultation,
              patientName: patient.name,
              consultationCategoryName: categoryName,
            };
          })
        );
        setPatients(updatedPatients);
      } else {
        console.log("Error:", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to get patient information by ID
  const getPatientById = async id => {
    try {
      const response = await fetch(`/api/patient/auth/getOneById/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok) {
        return result.data; // Return the patient data (which includes name, etc.)
      } else {
        console.log("Error:", result.message);
        return {}; // Return empty object if there is an error
      }
    } catch (error) {
      console.error("Error:", error);
      return {}; // Return empty object if error occurs
    }
  };

  // Function to get consultation category name based on the category key
  const getConsultationCategoryName = async categoryKey => {
    try {
      const response = await fetch("/api/consultationCategory/getOneByKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: categoryKey }),
      });
      const result = await response.json();

      if (response.ok) {
        return result.data.category; // Return category name
      } else {
        console.log("Error:", result.message);
        return categoryKey; // Return key itself if there is an error
      }
    } catch (error) {
      console.error("Error:", error);
      return categoryKey; // Return key itself if error occurs
    }
  };

  useEffect(() => {
    getConsultation();
  }, []);

  // Function to get the appropriate icon based on the consultation type
  const getIcon = type => {
    switch (type) {
      case "videoCall":
        return <VideoIcon size={20} />;
      case "phoneCall":
        return <PhoneCallIcon size={20} />;
      case "textChat":
        return <MessageSquareIcon size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="d-flex justify-content-center bg-gray-50 min-h-screen">
      <div
        className="bg-white shadow-lg rounded-3 p-4 w-100"
        style={{ maxWidth: "700px", marginTop: "120px", marginBottom: "80px" }}
      >
        <Table>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <tr key={index}>
                  <td className="align-middle text-center">
                    <div className="d-flex justify-content-center">
                      {getIcon(patient.type)}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="font-weight-bold">
                        {patient.patientName} {/* Displaying patient's name */}
                      </span>
                      <span className="font-weight-bold">
                        {patient.consultationCategoryName}{" "}
                        {/* Displaying consultation category name */}
                      </span>
                      <span className="text-muted">{patient.notes}</span>
                      <span className="text-muted">
                        {new Date(patient.createdAt).toLocaleString()}
                      </span>
                      <span className="text-muted">{patient.type}</span>
                    </div>
                  </td>
                  <td className="align-middle">
                    <Link to={`/doctor-consult/${patient._id}`}>
                      <button
                        type="primary"
                        className="btn btn-primary d-flex align-items-center gap-2"
                      >
                        {getIcon(patient.type)} Consult Now
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  Loading patients...
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
