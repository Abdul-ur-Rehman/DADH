

import React, { useEffect, useState } from 'react';
import { TUICallKit, TUICallKitServer, TUICallType } from '@tencentcloud/call-uikit-react';
import * as GenerateTestUserSig from '../../debug/GenerateTestUserSig-es';
import { Container, Typography, Button, CircularProgress, Paper } from '@mui/material';
import "./AudioCall.css"; // External CSS

const DoctorAudioCallPage = () => {
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

  const SDKAppID = 20025898;
  const SDKSecretKey = 'cc1761e049018cad20a8b11f2214e68460372e9b9d3f9a5c2acada24fb814465';

  const callerUserID = localStorage.getItem('sendBirdUserId') || null;
  const patientData = JSON.parse(localStorage.getItem('consultPatientData')) || null;
  const calleeUserID = patientData?._id || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAndCall = async () => {
      if (!callerUserID || !calleeUserID) {
        setError('Caller or callee user ID is missing. Please check your login and patient details.');
        setLoading(false);
        return;
      }
      try {
        const { userSig } = GenerateTestUserSig.genTestUserSig({
          userID: callerUserID,
          SDKAppID,
          SecretKey: SDKSecretKey,
        });
        await TUICallKitServer.init({ userID: callerUserID, userSig, SDKAppID });

        try {
          await TUICallKitServer.enableFloatWindow(true);
        } catch (error) {
          alert(`[TUICallKit] enableFloatWindow failed. Reason: ${error}`);
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to initialize the Audio call. Please try again.');
        setLoading(false);
      }
    };
    initializeAndCall();
  }, [callerUserID, calleeUserID]);

  const handleCall = async () => {
    try {

      await startCallBackendUpdate();

      await TUICallKitServer.call({ userID: calleeUserID, type: TUICallType.AUDIO_CALL });
    } catch (error) {
      setError('Failed to start the call. Please try again.');
    }
  };


  const getConsultationId = () => {
    try {
      return localStorage.getItem("consultationId") || null;
    } catch {
      return null;
    }
  };

  const startCallBackendUpdate = async () => {
    const consultationId = getConsultationId();
    if (!consultationId) {
      console.warn("Consultation ID not found. Cannot update call status.");
      return;
    }

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/update/${consultationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCalling: true, // ✅ Difference here
        }),
      });

      if (!response.ok) {
        console.error("❌ API responded with error:", await response.text());
      }
    } catch (error) {
      console.error("Failed to update consultation to start call:", error);
    }
  };

  const endCallBackendUpdate = async () => {
    
    const consultationId = getConsultationId();
    if (!consultationId) {
      console.warn("Consultation ID not found. Cannot update call status.");
      return;
    }

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/update/${consultationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCalling: false,
        }),
        keepalive: true, // ✅ Important to allow request during unload
      });

      if (!response.ok) {
        console.error("❌ Failed to mark call as ended:", await response.text());
      }
    } catch (error) {
      console.error("Failed to update consultation on window close:", error);
    }
  };
  useEffect(() => {
    
    const handleBeforeUnload = (event) => {
      endCallBackendUpdate();
      // Optionally prevent page reload if needed:
      // event.preventDefault();
      // event.returnValue = '';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);




  return (
    <Container maxWidth="sm" className="audio-call-container">
      <Paper elevation={3} className="audio-call-paper">
        <Typography variant="h5" gutterBottom>
          Preparing Audio Call
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              You are about to start a Audio call with {patientData?.name || "your patient"}.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleCall}>
              Start Audio Call
            </Button>
          </>
        )}
      </Paper>
      <TUICallKit />
    </Container>
  );
};
export default DoctorAudioCallPage;
