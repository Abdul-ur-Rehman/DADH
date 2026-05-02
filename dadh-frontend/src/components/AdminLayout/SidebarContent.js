import PropTypes from "prop-types";
import React, { useEffect, useCallback, useRef } from "react";
import SimpleBar from "simplebar-react";
import MetisMenu from "metismenujs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import {
  Inbox,
  UserCheck,
  List,
  Users,
  CreditCard,
  LogOut,
  Home,
  CalendarDays,
} from "lucide-react";
import "./SidebarContent.css";

const SidebarContent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef();
  const path = location.pathname;

  const adminLevel = localStorage.getItem("adminLevel"); // "superadmin" or "subadmin"

  const handleLogout = () => {
    localStorage.setItem("isAdminLoggedIn", "false");
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminLevel");
    localStorage.removeItem("data");
    sessionStorage.clear();
    navigate("/admin/login");
  };

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
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

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
    const fullPath = location.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (fullPath === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path, activateParentDropdown]);

  useEffect(() => {
    ref.current?.recalculate?.();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeMenu();
  }, [activeMenu]);

  const scrollElement = (item) => {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  };

  return (
    <React.Fragment>
      <SimpleBar ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Admin")}</li>

            {/* Only for Super Admin */}
            {adminLevel === "superadmin" && (
              <li>
                <Link to="/admin/details/table" className="waves-effect">
                  <UserCheck size={18} style={{ marginRight: 8 }} />
                  <span>{props.t("Admins")}</span>
                </Link>
              </li>
            )}


            {/* <li>
              <Link to="/admin/Home" className="waves-effect">
                <Inbox size={18} style={{ marginRight: 8 }} />
                <span>{props.t("Home")}</span>
              </Link>
            </li> */}

<li>
  <Link to="/admin/Home" className="waves-effect">
    <Home size={18} style={{ marginRight: 8 }} />
    <span>{props.t("Home")}</span>
  </Link>
</li>

            <li>
              <Link to="/admin/inbox" className="waves-effect">
                <Inbox size={18} style={{ marginRight: 8 }} />
                <span>{props.t("Inbox")}</span>
              </Link>
            </li>


            <li>
                <Link to="/admin/Consultations" className="waves-effect">
              <CalendarDays size={18} style={{ marginRight: 8 }} />
              <span>{props.t("Consultations")}</span>
            </Link>
            </li>

          

            <li>
              <Link to="/admin/doctor-requests/table" className="waves-effect">
                <UserCheck size={18} style={{ marginRight: 8 }} />
                <span>{props.t("Doctors")}</span>
              </Link>
            </li>

            <li>
              <Link to="/admin/consultation-category/table" className="waves-effect">
                <List size={18} style={{ marginRight: 8 }} />
                <span>{props.t("Consultation Category")}</span>
              </Link>
            </li>

            <li>
              <Link to="/admin/patient-details/table" className="waves-effect">
                <Users size={18} style={{ marginRight: 8 }} />
                <span>{props.t("Patient Details")}</span>
              </Link>
            </li>

            <li>
              <Link to="/admin/billing-code/table" className="waves-effect">
                <CreditCard size={18} style={{ marginRight: 8 }} />
                <span>{props.t("Billing Code")}</span>
              </Link>
            </li>

            <li>
              <a onClick={handleLogout} className="waves-effect d-flex" role="button">
                <LogOut size={18} className="me-2" />
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
