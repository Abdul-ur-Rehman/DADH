import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";

import logo from "../../assets/images/users/logo.png";
import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
} from "../../store/actions";

import "./Header.css";

const Header = () => {
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
    <header id="page-topbar" className="fixed-logo-wrapper">
      {/* Logo (always visible) */}
      <div className="navbar-header d-flex align-items-center w-100 px-3">

        <div className="d-flex align-items-center">
          <div className="navbar-brand-box">
            <Link to="/admin/dashboard" className="logo d-flex align-items-center">
              {/* small logo → show on screens < lg */}
              <span className="logo-sm d-inline-block d-lg-none">
                <img src={logo} alt="Small logo" height="40" width="40" />
              </span>

              {/* large logo → show on screens ≥ lg */}
              <span className="logo-lg d-none d-lg-inline-block">
                <img src={logo} alt="Logo" height="55" />
              </span>
            </Link>
          </div>
          {/* Toggle button */}
          <button
            id="vertical-menu-btn"
            type="button"
            className="btn btn-sm px-4 font-size-24 header-item waves-effect toggle-fixed"
            onClick={handleToggleSidebar}
          >
            <i className="mdi mdi-menu fs-4"></i>
          </button>
        </div>
      </div>
    </header>

  );
};

Header.propTypes = {
  changeSidebarType: PropTypes.func,
  showRightSidebarAction: PropTypes.func,
};

const mapStateToProps = state => ({
  showRightSidebar: state.Layout.showRightSidebar,
});

export default connect(mapStateToProps, {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
