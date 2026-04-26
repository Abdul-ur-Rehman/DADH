import React, { useState } from "react";
import { Box, Button, ButtonGroup, Paper } from "@mui/material";
import DoctorChatComponents from "./DoctorChatComponents";
import ClinicalChat from "./ClinicalChat.js";

export default function ChatToggleTabs() {
  const [activeTab, setActiveTab] = useState("clinical");

  const docId = localStorage.getItem("sendBirdUserId");
  const docName = localStorage.getItem("sendBirdUserName");

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          textAlign: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: "40px",
            display: "inline-block",
            padding: "6px",
            backgroundColor: "#f5f5f5",
          }}
        >
          
            <ButtonGroup disableElevation variant="contained">
              <Button
                onClick={() => setActiveTab("clinical")}
                sx={{
                  borderRadius: "20px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  px: 3,
                }}
              >
                Clinical
              </Button>

            <Button
              onClick={() => setActiveTab("dispatcher")}
              sx={{
                borderRadius: "20px",
                backgroundColor: activeTab === "dispatcher" ? "#1976d2" : "#e0e0e0",
                color: activeTab === "dispatcher" ? "#fff" : "#000",
                px: 3,
                '&:hover': {
                  backgroundColor: activeTab === "dispatcher" ? "#1565c0" : "#d5d5d5",
                }
              }}
            >
              Dispatcher
            </Button>
            </ButtonGroup>
        </Paper>
      </Box>

      {/* Tab content */}
      <Box sx={{ mt: 4, px: 2 }}>
        {activeTab === "clinical" ? (
          <ClinicalChat userId={docId} userNickname={docName} />
        ) : (
          <DoctorChatComponents
            userId={docId}
            userNickname={docName}
            recipientId={"Support"}
            recipientNickname="Dispatcher"
          />
        )}
      </Box>
    </Box>
  );
}
