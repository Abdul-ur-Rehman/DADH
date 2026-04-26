import PropTypes from "prop-types";
import React, { useEffect, useCallback, useRef } from "react";
import SimpleBar from "simplebar-react";
import MetisMenu from "metismenujs";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import {
  Home,
  Mail,
  User,
  FileText,
  History,
  LogOut,
} from "lucide-react";

import "./SidebarContent.css";

const SidebarContent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef();
  const path = location.pathname;

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show");
        const parent3 = parent2.parentElement;
        if (parent3) {
          parent3.classList.add("mm-active");
          parent3.childNodes[0].classList.add("mm-active");
          const parent4 = parent3.parentElement;
          if (parent4) {
            parent4.classList.add("mm-show");
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show");
              parent5.childNodes[0].classList.add("mm-active");
            }
          }
        }
      }
      scrollElement(item);
    } else {
      scrollElement(item);
    }
  }, []);

  const removeActivation = (items) => {
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const parent = item.parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.length && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.remove("mm-show");
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active");
            parent3.childNodes[0].classList.remove("mm-active");
            const parent4 = parent3.parentElement;
            if (parent4) {
              parent4.classList.remove("mm-show");
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show");
                parent5.childNodes[0].classList.remove("mm-active");
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = location.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path, activateParentDropdown]);

  useEffect(() => {
    ref.current?.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  const handleLogout = () => {
    const isLoggedIn = localStorage.getItem("isPatientLoggedIn");

    if (isLoggedIn === "false") {
      localStorage.setItem("isPatientLoggedIn", "true");
    }
    if (isLoggedIn === "true") {
      localStorage.setItem("isPatientLoggedIn", "false");
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate("/patient/login");
  };

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Patient")}</li>

            <li>
              <Link to="/patient" className="waves-effect d-flex align-items-center gap-2">
                <Home size={18} />
                <span>{props.t("Home")}</span>
              </Link>
            </li>

            <li>
              <Link to="/patient/inbox" className="waves-effect d-flex align-items-center gap-2">
                <Mail size={18} />
                <span>{props.t("Inbox")}</span>
              </Link>
            </li>

            <li>
              <Link to="/patient/patientprofile" className="waves-effect d-flex align-items-center gap-2">
                <User size={18} />
                <span>{props.t("Patient Profile")}</span>
              </Link>
            </li>

            {/* <li>
              <Link to="/patient/patientHistory" className="waves-effect d-flex align-items-center gap-2">
                <FileText size={18} />
                <span>{props.t("Patient History")}</span>
              </Link>
            </li> */}

            {/* <li>
              <Link to="/patient/consulthistory" className="waves-effect d-flex align-items-center gap-2">
                <History size={18} />
                <span>{props.t("Patient Consult History")}</span>
              </Link>
            </li> */}

            <li>
              <a className="waves-effect d-flex align-items-center gap-2" onClick={handleLogout}>
                <LogOut size={18} />
                <span>{props.t("LogOut")}</span>
              </a>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withTranslation()(SidebarContent);
