// import React, { useEffect, useState } from "react";
// import { FaComments } from "react-icons/fa";
// import "./BillingTable.css";

// const BillingTable = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [billingPatients, setBillingPatients] = useState([]);

//   // const fetchAllBillingPatients = async () => {
//   //   try {
//   //     const response = await fetch("/api/consultations/getBillingsByDoctorId/");
//   //     const data = await response.json();
//   //     console.log("Billing patients data:", data);
//   //     setBillingPatients(data.billing || []);
//   //   } catch (err) {
//   //     console.error("Error fetching billing data:", err);
//   //   }
//   // };

//   // useEffect(() => {
//   //   fetchAllBillingPatients();
//   // }, []);

//   // Filter by date if both start and end are selected

// const fetchAllBillingPatients = async () => {
//   try {
//     // Step 1: Get whole user info object
//     const userInfo = JSON.parse(localStorage.getItem("data"));

//     // Step 2: Access doctor _id
//     const doctorId = userInfo?.data?._id;

//     if (!doctorId) {
//       console.error("Doctor ID not found in localStorage");
//       return;
//     }

//     // Step 3: API call with doctorId
//     const response = await fetch(`/api/consultations/getBillingsByDoctorId/${doctorId}`);
//     const data = await response.json();

//     console.log("Billing patients data:", data);
//     setBillingPatients(data.billings || []);
//   } catch (err) {
//     console.error("Error fetching billing data:", err);
//   }
// };

// useEffect(() => {
//   fetchAllBillingPatients();
// }, []);


// useEffect(() => {
//   fetchAllBillingPatients();
// }, []);



//   const filteredBillings = billingPatients
//     .filter((billing) => {
//       const issuedDate = new Date(billing.issued_at);
//       const start = startDate ? new Date(startDate) : null;
//       const end = endDate ? new Date(endDate) : null;

//       if (start && issuedDate < start) return false;
//       if (end && issuedDate > end) return false;
//       return true;
//     })
//     .sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at)); // latest first

//   return (
//     <div className="billing-container">
//       <h2 className="billing-heading">Billing History</h2>

//       <div className="date-selection">
//         <label>
//           Start Date:
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </label>
//         <label>
//           End Date:
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </label>
//       </div>

//       <div className="billing-list">
//         {filteredBillings.length === 0 ? (
//           <p className="no-data">No billing records found.</p>
//         ) : (
//           filteredBillings.map((billing, index) => {
//             const name = billing.patientId?.name || "Unknown Patient";
//             const dob = billing.patientId?.DOB;
//             const age = dob
//               ? new Date().getFullYear() - new Date(dob).getFullYear()
//               : "N/A";
//             const zip = billing.patientId?.zipCode || "N/A";
//             const amount = billing.total_amount?.toFixed(2) || "0.00";
//             const issuedDate = new Date(billing.issued_at).toLocaleString();

//             return (
//               <div key={index} className="billing-item">
//                 <FaComments className="comment-icon" />
//                 <div className="billing-info">
//                   <strong>
//                     {name} ({age}) - {zip}
//                   </strong>
//                   <br />
//                   <span>{issuedDate}</span>
//                 </div>
//                 <div className="billing-amount">${amount}</div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// // export default BillingTable;


// import React, { useEffect, useState } from "react";
// import { FaComments } from "react-icons/fa";
// import "./BillingTable.css";

// const BillingTable = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [billingPatients, setBillingPatients] = useState([]);

//   const fetchAllBillingPatients = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("data"));
//       const doctorId = userInfo?.data?._id;

//       if (!doctorId) {
//         console.error("Doctor ID not found in localStorage");
//         return;
//       }

//       const response = await fetch(
//         `/api/consultations/getBillingsByDoctorId/${doctorId}`
//       );
//       const data = await response.json();

//       const billingPatients = data.billings || [];

//       const allDetailedBills = [];

//       for (const billing of billingPatients) {
//         for (const billCode of billing.billCodes) {
//           const billResponse = await fetch(
//             `http://localhost:5001/api/billing/getOneById/${billCode}`
//           );
//           const billData = await billResponse.json();

//           if (billData?.data) {
//             allDetailedBills.push({
//               ...billData.data,
//               patientId: billing.patientId,
//               consultationCategory: billing.consultationCategory,
//               createdAt: billing.createdAt,
//             });
//           }
//         }
//       }

//       setBillingPatients(allDetailedBills);
//     } catch (err) {
//       console.error("Error fetching billing data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAllBillingPatients();
//   }, []);

//   const filteredBillings = billingPatients
//     .filter((billing) => {
//       const issuedDate = new Date(billing.issued_at);
//       const start = startDate ? new Date(startDate) : null;
//       const end = endDate ? new Date(endDate) : null;

//       if (start && issuedDate < start) return false;
//       if (end && issuedDate > end) return false;
//       return true;
//     })
//     .sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at)); // latest first

//   return (
//     <div className="billing-container">
//       <h2 className="billing-heading">Billing History</h2>

//       <div className="date-selection">
//         <label>
//           Start Date:
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </label>
//         <label>
//           End Date:
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </label>
//       </div>

//       <div className="billing-list">
//         {filteredBillings.length === 0 ? (
//           <p className="no-data">No billing records found.</p>
//         ) : (
//           filteredBillings.map((billing, index) => {
//             const name = billing.patientId?.name || "Unknown Patient";
//             const dob = billing.patientId?.DOB;
//             const age = dob
//               ? new Date().getFullYear() - new Date(dob).getFullYear()
//               : "N/A";
//             const zip = billing.patientId?.zipCode || "N/A";
//             const amount = billing.amount?.toFixed(2) || "0.00";
//             const issuedDate = new Date(billing.issued_at).toLocaleString();

//             return (
//               <div key={index} className="billing-item">
//                 <FaComments className="comment-icon" />
//                 <div className="billing-info">
//                   <strong>
//                     {name} ({age}) - {zip}
//                   </strong>
//                   <br />
//                   <span>{issuedDate}</span>
//                 </div>
//                 <div className="billing-amount">${amount}</div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillingTable;


// import React, { useEffect, useState } from "react";
// import { FaComments } from "react-icons/fa";
// import "./BillingTable.css";

// const BillingTable = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [billingPatients, setBillingPatients] = useState([]);

//   const fetchAllBillingPatients = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("data"));
//       const doctorId = userInfo?.data?._id;

//       if (!doctorId) {
//         console.error("Doctor ID not found in localStorage");
//         return;
//       }

//       const response = await fetch(
//         `/api/consultations/getBillingsByDoctorId/${doctorId}`
//       );
//       const data = await response.json();

//       const billingRecords = data.billings || [];
//       const patientBillingMap = [];

//       for (const billing of billingRecords) {
//         // Fetch patient info
//         const patientRes = await fetch(
//           `http://localhost:5001/api/patient/auth/getOneById/${billing.patientId}`
//         );
//         const patientData = await patientRes.json();
//         const patientInfo = patientData?.data || {};

//         let totalAmount = 0;
//         const allBills = [];

//         for (const billCode of billing.billCodes) {
//           const billResponse = await fetch(
//             `http://localhost:5001/api/billing/getOneById/${billCode}`
//           );
//           const billData = await billResponse.json();

//           if (billData?.data) {
//             allBills.push(billData.data);
//             totalAmount += billData.data.amount || 0;
//           }
//         }

//         patientBillingMap.push({
//           patient: patientInfo,
//           consultationCategory: billing.consultationCategory,
//           createdAt: billing.createdAt,
//           bills: allBills,
//           totalAmount,
//         });
//       }

//       setBillingPatients(patientBillingMap);
//     } catch (err) {
//       console.error("Error fetching billing data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAllBillingPatients();
//   }, []);

//   const filteredBillings = billingPatients
//     .filter((item) => {
//       const issuedDate = new Date(item.createdAt);
//       const start = startDate ? new Date(startDate) : null;
//       const end = endDate ? new Date(endDate) : null;

//       if (start && issuedDate < start) return false;
//       if (end && issuedDate > end) return false;
//       return true;
//     })
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//   return (
//     <div className="billing-container">
//       <h2 className="billing-heading">Billing History</h2>

//       <div className="date-selection">
//         <label>
//           Start Date:
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </label>
//         <label>
//           End Date:
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </label>
//       </div>

//       <div className="billing-list">
//         {filteredBillings.length === 0 ? (
//           <p className="no-data">No billing records found.</p>
//         ) : (
//           filteredBillings.map((entry, index) => {
//             const name = entry.patient?.name || "Unknown Patient";
//             const dob = entry.patient?.DOB;
//             const age = dob
//               ? new Date().getFullYear() - new Date(dob).getFullYear()
//               : "N/A";
//             const zip = entry.patient?.zipCode || "N/A";
//             const issuedDate = new Date(entry.createdAt).toLocaleString();
//             const amount = entry.totalAmount?.toFixed(2) || "0.00";

//             return (
//               <div key={index} className="billing-item">
//                 <FaComments className="comment-icon" />
//                 <div className="billing-info">
//                   <strong>
//                     {name} ({age}) - {zip}
//                   </strong>
//                   <br />
//                   <span>{issuedDate}</span>
//                   <br />
//                   <em>{entry.consultationCategory}</em>
//                   {/* <ul>
//                     {entry.bills.map((bill, idx) => (
//                       <li key={idx}>
//                         {bill.description || "Bill"} - ${bill.amount?.toFixed(2)}
//                       </li>
//                     ))}
//                   </ul> */}
//                 </div>
//                 <div className="billing-amount">Total: ${amount}</div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillingTable;

// import React, { useEffect, useState } from "react";
// import { FaComments } from "react-icons/fa";
// import "./BillingTable.css";

// const BillingTable = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [billingPatients, setBillingPatients] = useState([]);

//   const fetchAllBillingPatients = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("data"));
//       const doctorId = userInfo?.data?._id;

//       if (!doctorId) {
//         console.error("Doctor ID not found in localStorage");
//         return;
//       }

//       const response = await fetch(
//         `/api/consultations/getBillingsByDoctorId/${doctorId}`
//       );
//       const data = await response.json();

//       const billingRecords = data.billings || [];
//       const patientBillingMap = [];

//       for (const billing of billingRecords) {
//         const patientRes = await fetch(
//           `http://localhost:5001/api/patient/auth/getOneById/${billing.patientId}`
//         );
//         const patientData = await patientRes.json();
//         const patientInfo = patientData?.data || {};

//         let totalAmount = 0;
//         const allBills = [];

//         for (const billCode of billing.billCodes) {
//           const billResponse = await fetch(
//             `http://localhost:5001/api/billing/getOneById/${billCode}`
//           );
//           const billData = await billResponse.json();

//           if (billData?.data) {
//             allBills.push(billData.data);
//             totalAmount += billData.data.amount || 0;
//           }
//         }

//         patientBillingMap.push({
//           patient: patientInfo,
//           consultationCategory: billing.consultationCategory,
//           createdAt: billing.createdAt,
//           bills: allBills,
//           totalAmount,
//         });
//       }

//       setBillingPatients(patientBillingMap);
//     } catch (err) {
//       console.error("Error fetching billing data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAllBillingPatients();
//   }, []);

//   const filteredBillings = billingPatients
//     .filter((item) => {
//       const issuedDate = new Date(item.createdAt);
//       let start, end;

//       // agar user filter kare toh uska use karo
//       if (startDate && endDate) {
//         start = new Date(startDate);
//         end = new Date(endDate);
//       } else {
//         // warna default pichle 7 din ka range lo
//         end = new Date(); // aaj
//         start = new Date();
//         start.setDate(end.getDate() - 7); // 7 din pehle
//       }

//       return issuedDate >= start && issuedDate <= end;
//     })
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // latest first

//   return (
//     <div className="billing-container">
//       <h2 className="billing-heading">Billing History</h2>

//       <div className="date-selection">
//         <label>
//           Start Date:
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </label>
//         <label>
//           End Date:
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </label>
//       </div>

//       <div className="billing-list">
//         {filteredBillings.length === 0 ? (
//           <p className="no-data">No billing records found.</p>
//         ) : (
//           filteredBillings.map((entry, index) => {
//             const name = entry.patient?.name || "Unknown Patient";
//             const dob = entry.patient?.DOB;
//             const age = dob
//               ? new Date().getFullYear() - new Date(dob).getFullYear()
//               : "N/A";
//             const zip = entry.patient?.zipCode || "N/A";
//             const issuedDate = new Date(entry.createdAt).toLocaleString();
//             const amount = entry.totalAmount?.toFixed(2) || "0.00";

//             return (
//               <div key={index} className="billing-item">
//                 <FaComments className="comment-icon" />
//                 <div className="billing-info">
//                   <strong>
//                     {name} ({age}) - {zip}
//                   </strong>
//                   <br />
//                   <span>{issuedDate}</span>
//                   <br />
//                   <em>{entry.consultationCategory}</em>
//                 </div>
//                 <div className="billing-amount">Total: ${amount}</div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillingTable;

import React, { useEffect, useState } from "react";
import { FaComments } from "react-icons/fa";
import "./BillingTable.css";

const BillingTable = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billingPatients, setBillingPatients] = useState([]);

  const fetchAllBillingPatients = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("data"));
      const doctorId = userInfo?.data?._id;

      if (!doctorId) {
        console.error("Doctor ID not found in localStorage");
        return;
      }

      const response = await fetch(
        `/api/consultations/getBillingsByDoctorId/${doctorId}`
      );
      const data = await response.json();

      const billingRecords = data.billings || [];
      const patientBillingMap = [];

      for (const billing of billingRecords) {
        const patientRes = await fetch(
          `http://localhost:5001/api/patient/auth/getOneById/${billing.patientId}`
        );
        const patientData = await patientRes.json();
        const patientInfo = patientData?.data || {};

        let totalAmount = 0;
        const allBills = [];

        for (const billCode of billing.billCodes) {
          const billResponse = await fetch(
            `http://localhost:5001/api/billing/getOneById/${billCode}`
          );
          const billData = await billResponse.json();

          if (billData?.data) {
            allBills.push(billData.data);
            totalAmount += billData.data.amount || 0;
          }
        }

        patientBillingMap.push({
          patient: patientInfo,
          consultationCategory: billing.consultationCategory,
          createdAt: billing.createdAt,
          bills: allBills,
          totalAmount,
        });
      }

      setBillingPatients(patientBillingMap);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    }
  };

  useEffect(() => {
    fetchAllBillingPatients();
  }, []);

  const filteredBillings = billingPatients
    .filter((item) => {
      const issuedDate = new Date(item.createdAt);
      let start, end;

      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Ensure full end day is included
      } else {
        end = new Date(); // today
        end.setHours(23, 59, 59, 999);
        start = new Date();
        start.setDate(end.getDate() - 7); // last 7 days
      }

      return issuedDate >= start && issuedDate <= end;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="billing-container">
      <h2 className="billing-heading">Billing History</h2>

      <div className="date-selection">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="billing-list">
        {filteredBillings.length === 0 ? (
          <p className="no-data">No billing records found.</p>
        ) : (
          filteredBillings.map((entry, index) => {
            const name = entry.patient?.name || "Unknown Patient";
            const dob = entry.patient?.DOB;
            const age = dob
              ? new Date().getFullYear() - new Date(dob).getFullYear()
              : "N/A";
            const zip = entry.patient?.zipCode || "N/A";
            const issuedDate = new Date(entry.createdAt).toLocaleString();
            const amount = entry.totalAmount?.toFixed(2) || "0.00";

            return (
              <div key={index} className="billing-item">
                <FaComments className="comment-icon" />
                <div className="billing-info">
                  <strong>
                    {name} ({age}) - {zip}
                  </strong>
                  <br />
                  <span>{issuedDate}</span>
                  <br />
                  <em>{entry.consultationCategory}</em>
                </div>
                <div className="billing-amount">Total: ${amount}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BillingTable;
