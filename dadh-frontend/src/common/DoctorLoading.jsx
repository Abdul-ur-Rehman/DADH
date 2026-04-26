// import React from 'react';

// function DoctorLoading() {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
//       <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
//         {/* <img
//           src="https://cdn.pixabay.com/photo/2017/03/19/03/48/material-2155442_1280.png"
//           alt="Doctor loading"
//           className="w-40 h-40 mx-auto mb-6"
//         /> */}
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">
//           Preparing your consultation...
//         </h2>
//         <p className="text-gray-600 text-sm leading-relaxed">
//           Hang tight! We’re getting things ready so you can assist your patient smoothly.
//         </p>

//         <div className="w-full bg-gray-200 rounded-full h-2 mt-8 overflow-hidden">
//           <div className="bg-blue-500 h-full animate-progressBar w-1/3 rounded-full"></div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes progressBar {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(300%);
//           }
//         }

//         .animate-progressBar {
//           animation: progressBar 1.8s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }


import React from 'react'

function DoctorLoading() {
    return (
        <React.Fragment>
            <div
                className="patient-home text-center mt-3"
                style={{
                    minHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f8f9fa",
                    padding: "2rem",
                    borderRadius: "10px",
                }}
            >
                <img
                    src="https://cdn.pixabay.com/photo/2017/03/19/03/48/material-2155442_1280.png"
                    alt="Preparing your consultation"
                    style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "contain",
                        marginBottom: "2rem",
                    }}
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Preparing your consultation...
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Hang tight! We’re getting things ready so you can assist your patient smoothly.
                </p>
                <div
                    style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "6px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "3px",
                        marginTop: "2rem",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: "70%",
                            backgroundColor: "#3498db",
                            borderRadius: "3px",
                            animation: "progress 2s ease-in-out infinite",
                        }}
                    ></div>
                </div>
            </div>

            <style jsx>{`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(250%);
            }
          }
        `}</style>
        </React.Fragment>
    )
}

export default DoctorLoading
