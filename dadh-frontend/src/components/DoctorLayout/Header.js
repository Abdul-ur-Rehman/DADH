// import PropTypes from "prop-types";
// import React, { useState, useEffect } from "react";
// import { connect } from "react-redux";
// import { Link } from "react-router-dom";
// import { withTranslation } from "react-i18next";
// import logo from "../../assets/images/users/logo.png";
// import "./Header.css";

// import {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// } from "../../store/actions";

// /* ── sidebar toggle ───────────────────────────*/
// const handleToggleSidebar = () => {
//   const body = document.body;
//   if (window.innerWidth <= 992) body.classList.toggle("sidebar-enable");
//   else {
//     body.classList.toggle("vertical-collapsed");
//     body.classList.toggle("sidebar-enable");
//   }
// };

// /* ── live stats ───────────────────────────────*/
// const DoctorConsultations = () => {
//   const [todayBills, setTodayBills] = useState(0);
//   const [weekBills, setWeekBills] = useState(0);
//   const [todayCons, setTodayCons] = useState(0);
//   const [todayUnique, setTodayUnique] = useState(0);
//   const [queue, setQueue] = useState(0);
//   const [err, setErr] = useState(null);

//   const API = "http://localhost:5001/api";
//   const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id;

//   useEffect(() => {
//     if (!doctorId) return;

//     const urls = [
//       `/consultations/getTotalDoctorConsultationsToday/${doctorId}`,
//       `/consultations/totalPatientsByConsultation/${doctorId}`,
//       `/consultations/totalCurrentDayConsultationsCount/${doctorId}`,
//       `/billing/currentDayBillingByDoctor/${doctorId}`,
//       `/billing/sevenDaysBillingsByDoctor/${doctorId}`,
//     ];

//     (async () => {
//       try {
//         const [todayC, uniq, q, billDay, billWeek] = await Promise.all(
//           urls.map((u) => fetch(`${API}${u}`).then((r) => r.json()))
//         );

//         setTodayCons(todayC?.data || 0);
//         setTodayUnique(uniq?.data || 0);
//         setQueue(q?.data || 0);

//         // ✅ Handle billing with new response
//         setTodayBills(billDay?.gross_total || 0);
//         setWeekBills(billWeek?.gross_total || 0);
//       } catch (err) {
//         console.error("Stats fetch error:", err);
//         setErr("Stats error");
//       }
//     })();
//   }, [doctorId]);

//   if (err) return null;

//   return (
//     <div className="header-stats">
//       <div className="header-box billing">
//         <h4>{`$${todayBills} / $${weekBills}`}</h4>
//         <p>Billing</p>
//       </div>
//       <div className="header-box patients">
//         <h4>{`${todayCons} / ${todayUnique}`}</h4>
//         <p>Patients</p>
//       </div>
//       <div className="header-box queue">
//         <h4>{queue}</h4>
//         <p>Queue</p>
//       </div>
//     </div>
//   );
// };


// /* ── main header ──────────────────────────────*/
// const Header = () => (
//   <>
//     <header id="page-topbar" className="fixed-logo-wrapper">
//       <div className="navbar-header d-flex align-items-center w-100 px-3">
//         {/* logo + hamburger */}
//         <div className="d-flex align-items-center me-3">
//           <div className="navbar-brand-box">
//             <Link to="/doctor" className="logo d-flex align-items-center">
//               <span className="logo-sm d-inline-block d-lg-none">
//                 <img src={logo} alt="small" height="40" width="40" />
//               </span>
//               <span className="logo-lg d-none d-lg-inline-block">
//                 <img src={logo} alt="logo" height="55" />
//               </span>
//             </Link>
//           </div>

//           <button
//             id="vertical-menu-btn"
//             className="btn btn-sm header-item waves-effect toggle-fixed"
//             onClick={handleToggleSidebar}
//           >
//             <i className="mdi mdi-menu fs-4" />
//           </button>
//         </div>

//         {/* middle: live stats (flex‑grows, scrolls on narrow) */}
//         <DoctorConsultations />

//         {/* right: fullscreen icon */}
//         <button
//           type="button"
//           className="btn header-item noti-icon waves-effect ms-auto"
//           onClick={() => document.documentElement.requestFullscreen()}
//         >
//           <i className="mdi mdi-fullscreen" />
//         </button>
//       </div>
//     </header>
//   </>
// );

// Header.propTypes = {
//   changeSidebarType:      PropTypes.func,
//   showRightSidebarAction: PropTypes.func,
//   t:                      PropTypes.any,
// };

// const mapStateToProps = (state) => ({
//   showRightSidebar: state.Layout.showRightSidebar,
// });

// export default connect(mapStateToProps, {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// })(withTranslation()(Header));


import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import logo from "../../assets/images/users/logo.png";
import "./Header.css";

import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
} from "../../store/actions";

/* ── sidebar toggle ───────────────────────────*/
const handleToggleSidebar = () => {
  const body = document.body;
  if (window.innerWidth <= 992) body.classList.toggle("sidebar-enable");
  else {
    body.classList.toggle("vertical-collapsed");
    body.classList.toggle("sidebar-enable");
  }
};

/* ── live stats with auto-refresh ───────────── */
const DoctorConsultations = () => {
  const [todayBills, setTodayBills] = useState(0);
  const [weekBills, setWeekBills] = useState(0);
  const [todayCons, setTodayCons] = useState(0);
  const [todayUnique, setTodayUnique] = useState(0);
  const [queue, setQueue] = useState(0);
  const [err, setErr] = useState(null);

  const API = "http://localhost:5001/api";
  const doctorId = JSON.parse(localStorage.getItem("data"))?.data?._id;

  const fetchStats = async () => {
    if (!doctorId) return;

    const urls = [
      `/consultations/getTotalDoctorConsultationsToday/${doctorId}`,
      `/consultations/totalPatientsByConsultation/${doctorId}`,
      `/consultations/totalCurrentDayConsultationsCount/${doctorId}`,
      `/billing/currentDayBillingByDoctor/${doctorId}`,
      `/billing/sevenDaysBillingsByDoctor/${doctorId}`,
    ];

    try {
      const [todayC, uniq, q, billDay, billWeek] = await Promise.all(
        urls.map((u) => fetch(`${API}${u}`).then((r) => r.json()))
      );

      setTodayCons(todayC?.data || 0);
      setTodayUnique(uniq?.data || 0);
      setQueue(q?.data || 0);
      setTodayBills(billDay?.gross_total || 0);
      setWeekBills(billWeek?.gross_total || 0);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setErr("Stats error");
    }
  };

  useEffect(() => {
    fetchStats(); // first fetch

    const intervalId = setInterval(() => {
      fetchStats(); // every 15 seconds
    }, 15000);

    return () => clearInterval(intervalId); // cleanup
  }, [doctorId]);

  if (err) return null;

  return (
    <div className="header-stats">
      <div className="header-box billing">
        <h4>{`$${todayBills} / $${weekBills}`}</h4>
        <p>Billing</p>
      </div>
      <div className="header-box patients">
        <h4>{`${todayCons} / ${todayUnique}`}</h4>
        <p>Patients</p>
      </div>
      <div className="header-box queue">
        <h4>{queue}</h4>
        <p>Queue</p>
      </div>
    </div>
  );
};

/* ── main header ──────────────────────────────*/
const Header = () => (
  <>
    <header id="page-topbar" className="fixed-logo-wrapper">
      <div className="navbar-header d-flex align-items-center w-100 px-3">
        {/* logo + hamburger */}
        <div className="d-flex align-items-center me-3">
          <div className="navbar-brand-box">
            <Link to="/doctor" className="logo d-flex align-items-center">
              <span className="logo-sm d-inline-block d-lg-none">
                <img src={logo} alt="small" height="40" width="40" />
              </span>
              <span className="logo-lg d-none d-lg-inline-block">
                <img src={logo} alt="logo" height="55" />
              </span>
            </Link>
          </div>

          <button
            id="vertical-menu-btn"
            className="btn btn-sm header-item waves-effect toggle-fixed"
            onClick={handleToggleSidebar}
          >
            <i className="mdi mdi-menu fs-4" />
          </button>
        </div>

        {/* middle: live stats */}
        <DoctorConsultations />

        {/* right: fullscreen icon */}
        <button
          type="button"
          className="btn header-item noti-icon waves-effect ms-auto"
          onClick={() => document.documentElement.requestFullscreen()}
        >
          <i className="mdi mdi-fullscreen" />
        </button>
      </div>
    </header>
  </>
);

Header.propTypes = {
  changeSidebarType:      PropTypes.func,
  showRightSidebarAction: PropTypes.func,
  t:                      PropTypes.any,
};

const mapStateToProps = (state) => ({
  showRightSidebar: state.Layout.showRightSidebar,
});

export default connect(mapStateToProps, {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
