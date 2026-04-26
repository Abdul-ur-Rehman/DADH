import React, { useState, useEffect } from "react";
import {
  SendBirdProvider,
  useSendbirdStateContext,
} from "@sendbird/uikit-react";
import { GroupChannel } from "@sendbird/uikit-react/GroupChannel";
import "@sendbird/uikit-react/dist/index.css";
import {
  Grid,
  Box,
  CardContent,
  Paper,
  Typography,
} from "@mui/material";

const ChatComponent = ({
  userId,
  userNickname = "User",
  recipientId,
  recipientNickname = "Recipient",
}) => {
  console.log("reached chat component");
  const [currentChannelUrl, setCurrentChannelUrl] = useState("");
  const APP_ID = "0C9C0093-D483-46BC-9D98-938BE5FE8A84";

  const { stores } = useSendbirdStateContext() || {};
  const sb = stores?.sdkStore?.sdk;

  useEffect(() => {
    const fetchOrCreateChannel = async () => {
      if (!sb?.groupChannel || !userId || !recipientId) return;

      try {
        const query = sb.groupChannel.createMyGroupChannelListQuery({
          userIdsFilter: {
            userIds: [userId, recipientId],
            includeMode: true,
            queryType: "AND",
          },
          includeEmpty: true,
          limit: 1,
        });

        const channels = await query.next();

        if (channels.length > 0) {
          setCurrentChannelUrl(channels[0].url);
        } else {
          const newChannel = await sb.groupChannel.createChannel({
            invitedUserIds: [recipientId],
            isDistinct: true,
          });
          setCurrentChannelUrl(newChannel.url);
        }
      } catch (error) {
        console.error("Channel error:", error);
      }
    };

    fetchOrCreateChannel();
  }, [sb, userId, recipientId]);

  return (
    <SendBirdProvider appId={APP_ID} userId={userId} nickname={userNickname}>
      <Grid container sx={{ height: "100vh" }}>
        {/* Main Chat Window */}
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "1rem",
              marginTop: "-55px",
              marginRight: "-30px",     // No extra margin on right
              marginLeft: "80px",      // No extra margin on left
              // maxWidth: "800px",     // Take full width of parent
              width: "350px",        // Force full width
              boxSizing: "border-box", // Ensure padding doesn't cause overflow
            }}


          >
            <Paper
              elevation={3}
              sx={{
                flexGrow: 1,
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ flexGrow: 1, overflow: "hidden", height: "100%" }}>
                  {currentChannelUrl ? (
                    <GroupChannel channelUrl={currentChannelUrl} />
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        color: "#888",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      Select a chat to start a conversation...
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Paper>
          </Box>
        </Grid>
      </Grid>

    </SendBirdProvider>
  );
};

export default ChatComponent;
