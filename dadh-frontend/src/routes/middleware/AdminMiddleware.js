import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import VerticalLayout from "components/VerticalLayout";
// import HorizontalLayout from "components/HorizontalLayout";
import SidebarContent from "components/AdminLayout/SidebarContent";

// import { layoutTypes } from "../../constants/layout";

const AdminMiddleware = (props) => {
  // const { layoutType } = useSelector((state) => ({
  //   layoutType: state.Layout.layoutType,
  // }));

  // const getLayout = (layoutType) => {
  //   switch (layoutType) {
  //     case layoutTypes.HORIZONTAL:
  //       return HorizontalLayout;
  //     case layoutTypes.VERTICAL:
  //     default:
  //       return VerticalLayout;
  //   }
  // };

  // const Layout = getLayout(layoutType);
  // const authUser = JSON.parse(localStorage.getItem("data"));
  const authUser = JSON.parse(localStorage.getItem("data"));

  const navigate = useNavigate() 

  useEffect(() => {

    if (authUser && authUser.role === "admin" && authUser.state) {
      navigate("/dashboard"); // Redirect to admin dashboard or desired route
    } else {
      navigate("/login"); // Redirect to login if not admin
    }
  }, [navigate]);

  // if (!authUser) {
  //   return <Navigate to="/login" />;
  // }

  const isAdmin = authUser?.role === "admin";

  return (
    <Layout>
      {/* Wrap everything inside a fragment to avoid the warning */}
      <>
        {isAdmin && <SidebarContent />}
        <div style={{ flex: 1 }}>{props.children}</div>
      </>
    </Layout>
  );
};

export default AdminMiddleware;
