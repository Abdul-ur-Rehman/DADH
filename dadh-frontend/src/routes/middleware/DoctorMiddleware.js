import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import SidebarContent from "components/DoctorLayout/SidebarContent";


// import { layoutTypes } from "../../constants/layout";

const DoctorMiddleware = props => {
  // const { layoutType } = useSelector(state => ({
  //   layoutType: state.Layout.layoutType,
  // }));

  // const getLayout = layoutType => {
  //   switch (layoutType) {
  //     case layoutTypes.HORIZONTAL:
  //       return HorizontalLayout;
  //     case layoutTypes.VERTICAL:
  //     default:
  //       return VerticalLayout;
  //   }
  // };

  // const Layout = getLayout(layoutType);
  const storedData = localStorage.getItem("data");
  const authUser = storedData ? JSON.parse(storedData) : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser.state) {
      navigate("/"); // Redirect to admin dashboard or desired route
    } else {
      navigate("/login"); // Redirect to login if not admin
    }
  }, [navigate]);

  const isDoctor = authUser?.state;
  return (
    <Layout>
      {/* Wrap everything inside a fragment to avoid the warning */}
      <>
        {isDoctor && <SidebarContent />}
        <div style={{ flex: 1 }}>{props.children}</div>
      </>
    </Layout>
  );
};

export default DoctorMiddleware;
