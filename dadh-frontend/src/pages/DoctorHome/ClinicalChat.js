import React from "react";
import { SendBirdProvider, OpenChannel } from "@sendbird/uikit-react";
import "@sendbird/uikit-react/dist/index.css";
import { Grid, Box } from "@mui/material";
import "./ClinicalChat.css"; // Import external CSS

// const APP_ID = "77C305A1-ACF1-48B6-8B75-E9C7882A0BC3";
const APP_ID = "0C9C0093-D483-46BC-9D98-938BE5FE8A84";

const DEFAULT_CHANNEL =
  "sendbird_open_channel_29962_fd304b2d59617fd96e7b285f6b0854654fe2ca9e";

const ClinicalChat = ({ userId, userNickname = "User" }) => {
  return (
    <div style={{ width: "100%", }} className="">
      <SendBirdProvider appId={APP_ID} userId={userId} nickname={userNickname}>
        <Grid
          container
          sx={{
            height: "80vh",
            width: "100%",
            overflow: "hidden",
            margin: 0,
            borderRadius: "12px",
            // marginLeft: -2,
          }}
        >
          {/* Sidebar - Channel List */}
          <Grid
            item
            xs={12}
            sx={{
              // marginLeft: -1,
              height: "100%",
              overflowY: "auto",
              // bgcolor: "#f4f4f4",
              display: "flex",
              borderRadius: "12px",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 450 }}>
              <OpenChannel channelUrl={DEFAULT_CHANNEL} />
            </Box>
          </Grid>

          {/* Main Chat Section */}
          <Grid item xs={9} sx={{ height: "100%", display: "flex" }}>
            <Box sx={{ width: "100%", maxWidth: 1200, height: "100%" }}>
              {/* Future chat content goes here */}
            </Box>
          </Grid>
        </Grid>
      </SendBirdProvider>
    </div>
  );
};

export default ClinicalChat;
