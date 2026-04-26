// import React, { useEffect, useState } from "react";
// import { FaPlusCircle, FaUserCircle } from "react-icons/fa";

// const PatientCard = () => {
//   const [patientData, setPatientData] = useState({ date: "", id: "" });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/patient/data");
//         const data = await response.json();
//         setPatientData({ date: data.date, id: data.id });
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <div className="flex justify-center bg-gray-50 min-h-screen" style={{ paddingLeft: "20px" }}>
//       <div
//         className="bg-white w-96 p-6 rounded-lg shadow-xl border border-gray-200"
//         style={{ maxWidth: "250px", marginTop: "120px", marginBottom: "80px", marginLeft: "20px" }}
//       >
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-4 w-full">
//             <FaUserCircle className="text-gray-600 text-2xl" />
//             <FaPlusCircle className="text-purple-600 text-2xl cursor-pointer hover:text-purple-700 transition" style={{ marginLeft: "210px" }} />
//             <div className="flex-1">
//               <h3 className="text-xl font-bold text-gray-900">{patientData.date || "Loading..."}</h3>
//               <p className="text-sm text-gray-500">{patientData.id || "Loading..."}</p>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col justify-center items-center text-gray-400 py-8 border-t">
//           <div className="text-5xl">💬</div>
//           <p className="text-lg font-medium">No Channels</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PatientCard;
