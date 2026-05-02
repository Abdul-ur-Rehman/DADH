import PropTypes from 'prop-types';
import React from "react";
import { Routes, Route } from 'react-router-dom';
import { connect } from "react-redux";

// Import Routes
import { userRoutes, authRoutes } from "./routes/allRoutes";

// Import Middleware
import Authmiddleware from "./routes/middleware/Authmiddleware";

// Import Layouts
import NonAuthLayout from "./components/NonAuthLayout";
import WithLayout from "./components/WithLayout";

// Import scss
import "./assets/scss/theme.scss";
import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';
import '@sendbird/uikit-react/dist/index.css';

// Import Fake Backend
// import fakeBackend from "./helpers/AuthType/fakeBackend";
// fakeBackend();

// Sendbird App ID
const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID;

const App = () => {
 
  let sendbirdUser = localStorage.getItem('sendBirdUserName');
  let sendbirdUserId = localStorage.getItem('sendBirdUserId');

  const appContent = (
    <Routes>

          {/* Public Auth Routes */}
          {authRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <NonAuthLayout>
                  {route.component}
                </NonAuthLayout>
              }
              key={idx}
              exact
            />
          ))}

          {/* Protected User Routes */}
          {userRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <Authmiddleware allowedRoles={route.allowedRoles}>
                  <WithLayout>
                    {route.component}
                  </WithLayout>
                </Authmiddleware>
              }
              key={idx}
              exact
            />
          ))}

    </Routes>
  )

  return (
    <React.Fragment>
      {APP_ID
        ? <SendbirdProvider appId={APP_ID} userId={sendbirdUserId}>{appContent}</SendbirdProvider>
        : appContent}
    </React.Fragment>
  );
};

App.propTypes = {
  layout: PropTypes.any
};

const mapStateToProps = state => ({
  layout: state.Layout,
});

export default connect(mapStateToProps, null)(App);

 




