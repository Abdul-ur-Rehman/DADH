// import PropTypes from "prop-types";
// import React, { useState, useEffect } from "react";
// import { connect } from "react-redux";
// import { Button } from "reactstrap";
// import { Link, useNavigate } from "react-router-dom";
// import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
// import logo from "../../assets/images/users/logo.png";
// import { withTranslation } from "react-i18next";
// import {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// } from "../../store/actions";
// import { useAuth } from "store/auth";
// import Swal from "sweetalert2";
// import "./Header.css";

// const Header = () => {
//   const handleToggleSidebar = () => {
//     const body = document.body;
//     if (window.innerWidth <= 992) {
//       body.classList.toggle("sidebar-enable");
//     } else {
//       body.classList.toggle("vertical-collapsed");
//       body.classList.toggle("sidebar-enable");
//     }
//   };

//   const { patientData } = useAuth();
//   const [isConsultationActive, setIsConsultationActive] = useState(false);
//   const navigate = useNavigate();

//   const checkConsultationStatus = () => {
//     try {
//       const consultations = JSON.parse(localStorage.getItem("patientConsultations") || "[]");
//       const hasActive = consultations.some((c) => c.isCompleted === false);
//       setIsConsultationActive(hasActive);
//     } catch (e) {
//       console.error("Error reading consultation from localStorage", e);
//       setIsConsultationActive(false);
//     }
//   };

//   useEffect(() => {
//     checkConsultationStatus();

//     const handleStorageChange = () => {
//       checkConsultationStatus();
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, []);

//   const handleNewConsultation = () => {
//     const consultations = JSON.parse(localStorage.getItem("patientConsultations") || "[]");
//     const hasActive = consultations.some((c) => c.isCompleted === false);

//     if (hasActive) {
//       Swal.fire({
//         icon: "warning",
//         title: "Consultation in Progress",
//         text: "You already have an ongoing consultation. Please end it before starting a new one.",
//       });
//       return;
//     }

//     navigate("/consult/patient");
//   };

 


//   return (
//     <React.Fragment>
//       <header id="page-topbar">
//         <div className="navbar-header d-flex justify-content-between align-items-center">
//           <div className="d-flex align-items-center">
//             <div className="navbar-brand-box">
//               <Link to="/admin/dashboard" className="logo d-flex align-items-center">
//                 {/* small logo → show on screens < lg */}
//                 <span className="logo-sm d-inline-block d-lg-none">
//                   <img src={logo} alt="Small logo" height="40" width="40" />
//                 </span>

//                 {/* large logo → show on screens ≥ lg */}
//                 <span className="logo-lg d-none d-lg-inline-block">
//                   <img src={logo} alt="Logo" height="55" />
//                 </span>
//               </Link>
//             </div>
//             {/* Toggle button */}
//             <button
//               id="vertical-menu-btn"
//               type="button"
//               className="btn btn-sm px-4 font-size-24 header-item waves-effect toggle-fixed"
//               onClick={handleToggleSidebar}
//             >
//               <i className="mdi mdi-menu fs-4"></i>
//             </button>
//           </div>

//           <div className="d-flex">
//             <form className="app-search d-none d-lg-block">
//               <div style={{ marginTop: "-3px", textAlign: "right" }}>
//                 <Button
//                   onClick={handleNewConsultation}
//                   color="primary"
//                   title={
//                     isConsultationActive
//                       ? "Active consultation in progress"
//                       : "Start new consultation"
//                   }
//                 >
//                   New Consultation
//                 </Button>
//               </div>
//             </form>

//             <NotificationDropdown />
//           </div>
//         </div>
//       </header>
//     </React.Fragment>
//   );
// };

// Header.propTypes = {
//   changeSidebarType: PropTypes.func,
//   leftMenu: PropTypes.any,
//   leftSideBarType: PropTypes.any,
//   showRightSidebar: PropTypes.any,
//   showRightSidebarAction: PropTypes.func,
//   t: PropTypes.any,
//   toggleLeftmenu: PropTypes.func,
// };

// const mapStatetoProps = (state) => {
//   const { layoutType, showRightSidebar, leftMenu, leftSideBarType } = state.Layout;
//   return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
// };

// export default connect(mapStatetoProps, {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// })(withTranslation()(Header));


// ... latest code 


// import PropTypes from "prop-types";
// import React, { useState, useEffect } from "react";
// import { connect } from "react-redux";
// import { Button } from "reactstrap";
// import { Link, useNavigate } from "react-router-dom";
// import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
// import logo from "../../assets/images/users/logo.png";
// import { withTranslation } from "react-i18next";
// import {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// } from "../../store/actions";
// import { useAuth } from "store/auth";
// import Swal from "sweetalert2";
// import "./Header.css";

// const Header = () => {
//   const handleToggleSidebar = () => {
//     const body = document.body;
//     if (window.innerWidth <= 992) {
//       body.classList.toggle("sidebar-enable");
//     } else {
//       body.classList.toggle("vertical-collapsed");
//       body.classList.toggle("sidebar-enable");
//     }
//   };

//   const { patientData } = useAuth();
//   const [isConsultationActive, setIsConsultationActive] = useState(false);
//   const navigate = useNavigate();
//   const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

//   const checkConsultationStatus = async () => {
//     if (!patientData || !patientData._id) return;

//     try {
//       const res = await fetch(`${REACT_APP_BACKEND_URL}/consultations/patient/${patientData._id}`);
//       const result = await res.json();

//       if (res.ok && result.state) {
//         const hasActive = result.data.some((c) => c.isCompleted === false);
//         setIsConsultationActive(hasActive);
//       } else {
//         setIsConsultationActive(false);
//       }
//     } catch (e) {
//       console.error("Error fetching consultation status", e);
//       setIsConsultationActive(false);
//     }
//   };

//   useEffect(() => {
//     checkConsultationStatus();

//     const handleStorageChange = () => {
//       checkConsultationStatus();
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, []);

//   const handleNewConsultation = async () => {
//     if (!patientData || !patientData._id) {
//       Swal.fire({
//         icon: "error",
//         title: "Missing Patient Info",
//         text: "Patient ID not found. Please log in again.",
//       });
//       return;
//     }

//     try {
//       const res = await fetch(`${REACT_APP_BACKEND_URL}/consultations/patient/${patientData._id}`);
//       const result = await res.json();

//       if (res.ok && result.state) {
//         const hasActive = result.data.some((c) => c.isCompleted === false);
//         if (hasActive) {
//           Swal.fire({
//             icon: "warning",
//             title: "Consultation in Progress",
//             text: "You already have an ongoing consultation. Please end it before starting a new one.",
//           });
//           return;
//         }

//         navigate("/consult/patient");
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: result.message || "Could not check consultation status.",
//         });
//       }
//     } catch (e) {
//       console.error("Error checking consultations:", e);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "An error occurred while checking consultations.",
//       });
//     }
//   };

//   return (
//     <React.Fragment>
//       <header id="page-topbar">
//         <div className="navbar-header d-flex justify-content-between align-items-center">
//           <div className="d-flex align-items-center">
//             <div className="navbar-brand-box">
//               <Link to="/admin/dashboard" className="logo d-flex align-items-center">
//                 <span className="logo-sm d-inline-block d-lg-none">
//                   <img src={logo} alt="Small logo" height="40" width="40" />
//                 </span>
//                 <span className="logo-lg d-none d-lg-inline-block">
//                   <img src={logo} alt="Logo" height="55" />
//                 </span>
//               </Link>
//             </div>
//             <button
//               id="vertical-menu-btn"
//               type="button"
//               className="btn btn-sm px-4 font-size-24 header-item waves-effect toggle-fixed"
//               onClick={handleToggleSidebar}
//             >
//               <i className="mdi mdi-menu fs-4"></i>
//             </button>
//           </div>

//           <div className="d-flex">
//             <form className="app-search d-none d-lg-block">
//               <div style={{ marginTop: "-3px", textAlign: "right" }}>
//                 <Button
//                   onClick={handleNewConsultation}
//                   color="primary"
//                   title={
//                     isConsultationActive
//                       ? "Active consultation in progress"
//                       : "Start new consultation"
//                   }
//                 >
//                   New Consultation
//                 </Button>
//               </div>
//             </form>

//             <NotificationDropdown />
//           </div>
//         </div>
//       </header>
//     </React.Fragment>
//   );
// };

// Header.propTypes = {
//   changeSidebarType: PropTypes.func,
//   leftMenu: PropTypes.any,
//   leftSideBarType: PropTypes.any,
//   showRightSidebar: PropTypes.any,
//   showRightSidebarAction: PropTypes.func,
//   t: PropTypes.any,
//   toggleLeftmenu: PropTypes.func,
// };

// const mapStatetoProps = (state) => {
//   const { layoutType, showRightSidebar, leftMenu, leftSideBarType } = state.Layout;
//   return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
// };

// export default connect(mapStatetoProps, {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// })(withTranslation()(Header));



import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
import logo from "../../assets/images/users/logo.png";
import { withTranslation } from "react-i18next";
import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
} from "../../store/actions";
import Swal from "sweetalert2";
import "./Header.css";

const Header = () => {
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const navigate = useNavigate();
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

  const getPatientIdFromStorage = () => {
    try {
      const storedData = JSON.parse(localStorage.getItem("data"));
      return storedData?.data?._id || null;
    } catch (e) {
      console.error("Error reading patient ID from localStorage", e);
      return null;
    }
  };

  const checkConsultationStatus = async () => {
    const patientId = getPatientIdFromStorage();
    if (!patientId) return;

    try {
     const res = await fetch(`${REACT_APP_BACKEND_URL}/consultations/getConsulationByPatient/${patientId}`);
      const result = await res.json();

      if (res.ok && result.state) {
        const hasActive = result.data.some((c) => c.isCompleted === false);
        setIsConsultationActive(hasActive);
      } else {
        setIsConsultationActive(false);
      }
    } catch (e) {
      console.error("Error fetching consultation status", e);
      setIsConsultationActive(false);
    }
  };

  useEffect(() => {
    checkConsultationStatus();

    const handleStorageChange = () => {
      checkConsultationStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleNewConsultation = async () => {
    const patientId = getPatientIdFromStorage();
    if (!patientId) {
      Swal.fire({
        icon: "error",
        title: "Missing Patient Info",
        text: "Patient ID not found. Please log in again.",
      });
      return;
    }

    try {
      const res = await fetch(`${REACT_APP_BACKEND_URL}/consultations/getConsulationByPatient/${patientId}`);
      const result = await res.json();

      if (res.ok && result.state) {
        const hasActive = result.data.some((c) => c.isCompleted === false);
        if (hasActive) {
          Swal.fire({
            icon: "warning",
            title: "Consultation in Progress",
            text: "You already have an ongoing consultation. Please end it before starting a new one.",
          });
          return;
        }

        navigate("/consult/patient");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Could not check consultation status.",
        });
      }
    } catch (e) {
      console.error("Error checking consultations:", e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while checking consultations.",
      });
    }
  };

  const handleToggleSidebar = () => {
    const body = document.body;
    if (window.innerWidth <= 992) {
      body.classList.toggle("sidebar-enable");
    } else {
      body.classList.toggle("vertical-collapsed");
      body.classList.toggle("sidebar-enable");
    }
  };

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="navbar-brand-box">
              <Link to="/admin/dashboard" className="logo d-flex align-items-center">
                <span className="logo-sm d-inline-block d-lg-none">
                  <img src={logo} alt="Small logo" height="40" width="40" />
                </span>
                <span className="logo-lg d-none d-lg-inline-block">
                  <img src={logo} alt="Logo" height="55" />
                </span>
              </Link>
            </div>
            <button
              id="vertical-menu-btn"
              type="button"
              className="btn btn-sm px-4 font-size-24 header-item waves-effect toggle-fixed"
              onClick={handleToggleSidebar}
            >
              <i className="mdi mdi-menu fs-4"></i>
            </button>
          </div>

          <div className="d-flex">
            <form className="app-search d-none d-lg-block">
              <div style={{ marginTop: "-3px", textAlign: "right" }}>
                <Button
                  onClick={handleNewConsultation}
                  color="primary"
                  title={
                    isConsultationActive
                      ? "Active consultation in progress"
                      : "Start new consultation"
                  }
                >
                  New Consultation
                </Button>
              </div>
            </form>

            <NotificationDropdown />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

Header.propTypes = {
  changeSidebarType: PropTypes.func,
  leftMenu: PropTypes.any,
  leftSideBarType: PropTypes.any,
  showRightSidebar: PropTypes.any,
  showRightSidebarAction: PropTypes.func,
  t: PropTypes.any,
  toggleLeftmenu: PropTypes.func,
};

const mapStatetoProps = (state) => {
  const { layoutType, showRightSidebar, leftMenu, leftSideBarType } = state.Layout;
  return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
};

export default connect(mapStatetoProps, {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
