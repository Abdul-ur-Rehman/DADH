import PropTypes from "prop-types";
import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import SimpleBar from "simplebar-react";
import MetisMenu from "metismenujs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import {
  Inbox,
  UserCheck,
  Users,
  Headphones,
  CreditCard,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

const SidebarContent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const Ref = useRef();

  const [doctors, setDoctors] = useState([]);

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    let parent = item.parentElement;
    while (parent && parent.id !== "side-menu") {
      parent.classList.add("mm-active");
      parent.childNodes?.[1]?.classList.add("mm-show");
      parent = parent.parentElement;
    }
  }, []);

  const removeActivation = (anchors) => {
    Array.from(anchors).forEach((a) => {
      a.classList.remove("active");
      let p = a.parentElement;
      while (p && p.id !== "side-menu") {
        p.classList.remove("mm-active", "mm-show");
        p.childNodes?.[0]?.classList.remove("mm-active");
        p = p.parentElement;
      }
    });
  };

  const activeMenu = useCallback(() => {
    const anchors = document
      .getElementById("side-menu")
      .getElementsByTagName("a");

    removeActivation(anchors);

    const match = Array.from(anchors).find(
      (a) => a.pathname === location.pathname
    );
    if (match) activateParentDropdown(match);
  }, [location.pathname, activateParentDropdown]);

  useEffect(() => { Ref.current?.recalculate?.(); }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, [activeMenu]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeMenu();
  }, [location.pathname, activeMenu]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const api = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api"}/doctor/getAll`;
        const response = await fetch(api);
        const result = await response.json();
        if (response.ok) {
          setDoctors(result.data || []);
        } else {
          console.error("Error:", result.message);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

const handleLogout = () => {
  // Sab data clear karo
  localStorage.removeItem("token");
  localStorage.removeItem("consultationId");
  localStorage.removeItem("patientData");
  localStorage.removeItem("sendBirdUserId");
  localStorage.removeItem("sendBirdUserName");
  localStorage.removeItem("data");
  localStorage.removeItem("incompleteConsultation");
  localStorage.removeItem("patientConsultations");
  localStorage.removeItem("patientId");

  localStorage.setItem("isDoctorLoggedIn", "false");

  navigate("/doctor/login");
};


  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={Ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {/* ─── Static doctor‑side links ─────────────────────────── */}
            <li className="menu-title">{props.t("Doctor")}</li>

            <li>
              <Link to="/doctor" className="waves-effect">
                <Inbox size={18} className="me-2" />
                <span>{props.t("Home")}</span>
              </Link>
            </li>

            <li>
              <Link to="/doctor/inbox" className="waves-effect">
                <Inbox size={18} className="me-2" />
                <span>{props.t("Inbox")}</span>
              </Link>
            </li>

            <li>
              <Link to="/doctor/consultHistory" className="waves-effect">
                <UserCheck size={18} className="me-2" />
                <span>{props.t("Consult History")}</span>
              </Link>
            </li>

            <li>
              <Link to="/doctor/billingpage" className="waves-effect">
                <CreditCard size={18} className="me-2" />
                <span>{props.t("Billing")}</span>
              </Link>
            </li>

            <li>
              <Link to="/doctor/supportcard" className="waves-effect">
                <Headphones size={18} className="me-2" />
                <span>{props.t("Support")}</span>
              </Link>
            </li>

            <li>
              <Link to="/doctor/myAccount" className="waves-effect">
                <Users size={18} className="me-2" />
                <span>{props.t("My Account")}</span>
              </Link>
            </li>

            <li>
              <a onClick={handleLogout} className="waves-effect">
                <LogOut size={18} className="me-2" />
                <span>{props.t("LogOut")}</span>
              </a>
            </li>

            {/* ─── Doctor list (no dropdown) ─────────────────────────── */}
            <li>
              <Link className="waves-effect">
              <Users size={18} className="me-2" />
              <span>{props.t("Doctors")}</span>

              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <li key={doctor.id} className="ps-4 py-1">
                    <span className="d-flex justify-content-between align-items-center">
                      <span>
                        {/* status dot */}
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            display: "inline-block",
                            marginRight: 8,
                            backgroundColor: doctor.isOnline ? "green" : "gray",
                          }}
                        />
                        {doctor.name}
                      </span>
                      <span className="text-muted small">
                        ({doctor.consultedPatients?.length ?? 0})
                      </span>
                    </span>
                  </li>
                ))
              ) : (
                <li className="ps-4 py-1 text-muted small">
                  {props.t("No doctors available")}
                </li>
              )}
              </Link>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>

  );
};

SidebarContent.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.object,
};

export default withTranslation()(SidebarContent);
