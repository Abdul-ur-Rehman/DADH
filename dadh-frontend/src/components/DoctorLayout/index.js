import PropTypes from "prop-types";
import React, { Component } from "react";

import { connect } from "react-redux";
import withRouter from "components/Common/withRouter";
import {
  changeLayout,
  changeSidebarTheme,
  changeBodyTheme,
  changeSidebarType,
  changeTopbarTheme,
  changeLayoutWidth,
  showRightSidebarAction,
} from "../../store/actions";

// Layout Related Components
import Header from "./Header";
import Sidebar from "./Sidebar";
import Rightbar from "../CommonForBoth/Rightbar";
import { Navigate } from "react-router-dom";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    };
    this.toggleMenuCallback = this.toggleMenuCallback.bind(this);
    this.hideRightbar = this.hideRightbar.bind(this);
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(1).toUpperCase() + string.slice(2);
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.addEventListener("click", this.hideRightbar, true);

    if (this.props.leftSideBarTheme) {
      this.props.changeSidebarTheme(this.props.leftSideBarTheme);
    }

    if (this.props.bodyTheme) {
      this.props.changeBodyTheme(this.props.bodyTheme);
    }

    if (this.props.layoutWidth) {
      this.props.changeLayoutWidth(this.props.layoutWidth);
    }

    if (this.props.leftSideBarType) {
      this.props.changeSidebarType(this.props.leftSideBarType);
    }

    if (this.props.topbarTheme) {
      this.props.changeTopbarTheme(this.props.topbarTheme);
    }
  }

  toggleMenuCallback = () => {
    if (this.props.leftSideBarType === "default") {
      this.props.changeSidebarType("condensed", this.state.isMobile);
    } else if (this.props.leftSideBarType === "condensed") {
      this.props.changeSidebarType("default", this.state.isMobile);
    }
  };

  hideRightbar = (event) => {
    const rightbar = document.getElementById("right-bar");
    if (rightbar && rightbar.contains(event.target)) {
      return;
    } else {
      if (document.body.classList.contains("right-bar-enabled")) {
        this.props.showRightSidebarAction(false);
      }
    }
  };

  // ✅ Safely get token from localStorage
  getToken = () => {
    try {
      const rawData = localStorage.getItem("data");
      if (!rawData) return null;

      const data = JSON.parse(rawData);
      return data?.token || null;
    } catch (error) {
      console.warn("Error parsing token data:", error);
      return null;
    }
  };

  // ✅ Safely decode JWT
  decodeJWT = (token) => {
    if (!token || typeof token !== "string") return null;

    try {
      const base64Url = token.split(".")[1];
      const decodedData = JSON.parse(atob(base64Url));
      return decodedData;
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  // ✅ Check token expiration
  isTokenExpired = (token) => {
    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  };

  render() {
    const token = this.getToken();

    if (!token || this.isTokenExpired(token)) {
      return <Navigate to="/doctor/login" />;
    }

    return (
      <React.Fragment>
        <div id="layout-wrapper">
          <Header toggleMenuCallback={this.toggleMenuCallback} />
          <Sidebar
            theme={this.props.leftSideBarTheme}
            type={this.props.leftSideBarType}
            isMobile={this.state.isMobile}
          />
          <div className="main-content" style={{ marginTop: "40px" }}>
            {this.props.children}
          </div>
        </div>
        {this.props.showRightSidebar ? <Rightbar /> : null}
      </React.Fragment>
    );
  }
}

Layout.propTypes = {
  changeLayoutWidth: PropTypes.func,
  changeSidebarTheme: PropTypes.func,
  changeBodyTheme: PropTypes.func,
  changeSidebarType: PropTypes.func,
  changeTopbarTheme: PropTypes.func,
  children: PropTypes.object,
  layoutWidth: PropTypes.any,
  leftSideBarTheme: PropTypes.any,
  leftSideBarType: PropTypes.any,
  location: PropTypes.object,
  showRightSidebar: PropTypes.any,
  showRightSidebarAction: PropTypes.func,
  topbarTheme: PropTypes.any,
};

const mapStatetoProps = (state) => {
  return {
    ...state.Layout,
  };
};

export default connect(mapStatetoProps, {
  changeLayout,
  changeSidebarTheme,
  changeBodyTheme,
  changeSidebarType,
  changeTopbarTheme,
  changeLayoutWidth,
  showRightSidebarAction,
})(withRouter(Layout));
