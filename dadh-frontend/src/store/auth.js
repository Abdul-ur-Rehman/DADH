// import { createContext, useContext, useEffect, useState } from "react"

// export const AuthContext = createContext()

// // eslint-disable-next-line react/prop-types
// export const AuthProvider = ({ children }) => {
//   const [patientData, setPatientData] = useState();
//   const [data, setData] = useState(() => {
//     const storedData = localStorage.getItem("patientData")
//     return storedData ? JSON.parse(storedData) : null
//   })
//   // const userData = JSON.parse(localStorage.getItem("data"));
//   const authorizationToken = `Bearer ${data?.data?.token}`
//   const patientId = data?.data?.id

//   const getPatientDetailsByID = async () => {
//     try {
//       // const api = `/api/patient/auth/getOneById/${ patientId }`;

//       const response = await fetch(`/api/patient/auth/getOneById/${ patientId }`);
//       const data = await response.json();
//       if (response.ok) {
//         console.log("patientData from auth",data.data);
//         setPatientData(data.data || {});
//       } else {
//         console.error("Error:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching doctor request:", error);
//     }
//   };
//   ;
//   const storeDataInLS = data => {
//     setData(data)
//     localStorage.setItem("data", JSON.stringify(data))
//   }

//   const userLogout = () => {
//     setData("")
//     return localStorage.removeItem("data")
//   }

//   let loggedInData = data


//   useEffect(() => {
//     getPatientDetailsByID()

//   }, [])

//   return (
//     <AuthContext.Provider
//       value={{
//         storeDataInLS,
//         userLogout,
//         loggedInData,
//         authorizationToken,
//         patientData,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }


// import { createContext, useContext, useEffect, useState } from "react";
// export const AuthContext = createContext();
// // eslint-disable-next-line react/prop-types
// export const AuthProvider = ({ children }) => {
//   const [data, setData] = useState(() => {
//     const storedData = localStorage.getItem("data");
//     return storedData ? JSON.parse(storedData) : null;
//   });

//   const [patientData, setPatientData] = useState(null);
//   const userData = JSON.parse(localStorage.getItem("patientData"));
//   const token = data?.data?.token || "";
//   const isDoctor = data?.data?.role === "doctor"; // optional if you store roles
//   const authorizationToken = `Bearer ${token}`;
//   const userId = userData?.data?._id; 
  
//  const getPatientDetailsByID = async () => {
//     try {
//       const response = await fetch(`/api/patient/auth/getOneById/${ patientId }`);
//       const data = await response.json();
//       if (response.ok) {
//         console.log("patientData from auth",data.data);
//         setPatientData(data.data || {});
//       } else {
//         console.error("Error:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching doctor request:", error);
//     }
//   };

//   const storeDataInLS = (newData) => {
//     setData(newData);
//     localStorage.setItem("data", JSON.stringify(newData));
//   };

//   const userLogout = () => {
//     setData(null);
//     localStorage.removeItem("data");
//   };

//   useEffect(() => {
//     // Only fetch if it's a patient login
//     if (userId && !isDoctor) {
//       getPatientDetailsByID();
//     }
//   }, [userId]);

//   return (
//     <AuthContext.Provider
//       value={{
//         storeDataInLS,
//         userLogout,
//         userId,
//         token,
//         authorizationToken,
//         isDoctor,
//         patientData,
//         loggedInData: data,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook to use anywhere
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
import { createContext, useContext, useEffect, useState } from "react"

export const AuthContext = createContext()

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [getUser, setGetUser] = useState()
  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem("data")
    return storedData ? JSON.parse(storedData) : null
  })
  const [user, setUser] = useState()
  const [userList, setUserList] = useState([])
  const [service, setService] = useState("")
  const [roles, setRoles] = useState("")
  const clientId = data?.clientId || ""
  const userData = JSON.parse(localStorage.getItem("data"));
  const userId = userData?.data?._id; 
  const locationId = data?.locationId || ""
  const token = data?.token || null

  const authorizationToken = `Bearer ${data?.token}`

  const storeDataInLS = data => {
    setData(data)
    localStorage.setItem("data", JSON.stringify(data))
  }

  const userLogout = () => {
    setData("")
    return localStorage.removeItem("data")
  }

  let loggedInData = data

  useEffect(() => {
  }, [])

  return (
    <AuthContext.Provider
      value={{
        storeDataInLS,
        userLogout,
        loggedInData,
        user,
        service,
        authorizationToken,
        loading,
        getUser,
        userList,
        clientId,
        locationId,
        userId,
        roles,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
