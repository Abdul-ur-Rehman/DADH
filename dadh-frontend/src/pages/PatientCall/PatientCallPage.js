

import React, { useEffect, useState } from "react";
import {
  TUICallKit,
  TUICallKitServer
} from "@tencentcloud/call-uikit-react";
import * as GenerateTestUserSig from "../../debug/GenerateTestUserSig-es";
import { CircularProgress, Typography } from "@mui/material";

const SDKAppID = 20025898;
const SDKSecretKey = "cc1761e049018cad20a8b11f2214e68460372e9b9d3f9a5c2acada24fb814465";

const PatientCallPage = () => {
  const calleeUserID = localStorage.getItem("sendBirdUserId") || "";
  const calleeUserName = localStorage.getItem("sendBirdUserName") || "Patient";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPatient = async () => {
      
      if (!calleeUserID) {
        setError("Patient ID is missing.");
        return;
      }

      console.log("Patient ID:", calleeUserID);

      const { userSig } = GenerateTestUserSig.genTestUserSig({
        userID: calleeUserID,
        SDKAppID,
        SecretKey: SDKSecretKey,
      });

      try {
        await TUICallKitServer.init({ userID: calleeUserID, userSig, SDKAppID });
        console.log("sdk initialized")
        await TUICallKitServer.enableFloatWindow(true);
        setLoading(false);
      } catch (err) {
        setError("Failed to initialize TUICallKit: " + (err?.message || JSON.stringify(err)));
        setLoading(false);
      }
    };

    initPatient();
  }, [calleeUserID]);

  return (
    <div style={{ padding: 20 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Typography>Waiting for call from doctor...</Typography>
      )}

      <div id="PatientCallUI" style={{ height: "500px", marginTop: 20 }}>
        <TUICallKit
          ref={(instance) => {
            if (instance) {
              instance.mount({ elementId: "PatientCallUI" });
            }
          }}
        />
      </div>
    </div>
  );
};

export default PatientCallPage;
