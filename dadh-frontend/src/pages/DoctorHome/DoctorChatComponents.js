import React, { useEffect, useState } from "react";
import {
  SendBirdProvider,
  useSendbirdStateContext,
} from "@sendbird/uikit-react";
import { GroupChannel } from "@sendbird/uikit-react/GroupChannel";
import "@sendbird/uikit-react/dist/index.css";
import { Grid, Box, Card, CardContent, Typography } from "@mui/material";



const DoctorChatComponents = ({
  userId,
  userNickname = "User",
  recipientId = null,
}) => {
  const [currentChannelUrl, setCurrentChannelUrl] = useState("");
  const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID;

  const { stores } = useSendbirdStateContext();
  const sb = stores?.sdkStore?.sdk;

  useEffect(() => {
    if (recipientId && sb?.groupChannel) {
      const fetchOrCreateChannel = async () => {
        try {
          const query = sb.groupChannel.createMyGroupChannelListQuery({
            userIdsFilter: {
              userIds: [userId, recipientId],
              includeMode: true,
              queryType: "AND",
            },
            includeEmpty: true,
            limit: 5,
          });

          const channels = await query.next();
          if (channels.length > 0) {
            setCurrentChannelUrl(channels[0].url);
          } else {
            const newChannel = await sb.groupChannel.createChannel({
              invitedUserIds: [userId, recipientId],
            });
            setCurrentChannelUrl(newChannel.url);
          }
        } catch (error) {
          console.error("Error creating or fetching channel:", error);
        }
      };
      fetchOrCreateChannel();
    }
  }, [recipientId, sb]);

  return (

    <div
      style={{ width: "100%", height: "calc(100vh - 64px)" }}
    >
      <SendBirdProvider appId={APP_ID} userId={userId} nickname={userNickname}>
        <Grid container justifyContent="center" sx={{ height: "100%" }}>
          <Grid item xs={12} sm={12} md={12} lg={12} sx={{ height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "80vh",
                width: "100%",
                backgroundColor: "background.paper",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  // padding: { xs: 1, sm: 2 },
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {currentChannelUrl ? (
                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                      <GroupChannel channelUrl={currentChannelUrl} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        Select a chat to start conversation
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Box>
          </Grid>
        </Grid>
      </SendBirdProvider>
    </div>
  );
};



export default DoctorChatComponents;
