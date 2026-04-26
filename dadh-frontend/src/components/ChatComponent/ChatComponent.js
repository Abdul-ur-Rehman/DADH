// import React, { useEffect, useState } from "react";
// import {
//   useSendbirdStateContext,
//   ChannelList,
//   Channel,
// } from "@sendbird/uikit-react";
// import "@sendbird/uikit-react/dist/index.css";
// import { Box, Grid } from "@mui/material";

// const ChatComponent = ({
//   userId,
//   recipientId = null,
//   recipientNickname = "Recipient",
// }) => {
//   const [currentChannelUrl, setCurrentChannelUrl] = useState("");

//   const { stores } = useSendbirdStateContext();
//   const sb = stores?.sdkStore?.sdk;

//   useEffect(() => {
//     if (!recipientId || !sb || !sb.groupChannel) return;

//     const fetchOrCreate = async () => {
//       try {
//         const query = sb.groupChannel.createMyGroupChannelListQuery({
//           userIdsFilter: {
//             userIds: [userId, recipientId],
//             includeMode: "AND",
//             queryType: "EXACT",
//           },
//           includeEmpty: true,
//           limit: 1,
//         });

//         const channels = await query.next();
//         if (channels.length) {
//           setCurrentChannelUrl(channels[0].url);
//         } else {
//           const newChannel = await sb.groupChannel.createChannel({
//             invitedUserIds: [recipientId],
//             name: `${recipientNickname} & ${userId}`,
//             isDistinct: true,
//           });
//           setCurrentChannelUrl(newChannel.url);
//         }
//       } catch (e) {
//         console.error("Channel error:", e);
//       }
//     };

//     fetchOrCreate();
//   }, [sb, userId, recipientId, recipientNickname]);

//   return (
//     <Grid container sx={{ height: "80vh" }}>
//       <Grid item sx={{ flex: "0 0 350px", height: "100%", overflow: "auto" }}>
//         <Box sx={{ height: "100%", p: 1 }}>
//           <ChannelList
//             selectedChannelUrl={currentChannelUrl}
//             onChannelSelect={(ch) => setCurrentChannelUrl(ch.url)}
//           />
//         </Box>
//       </Grid>

//       <Grid item sx={{ flex: 1, height: "100%", overflow: "auto" }}>
//         <Box sx={{ height: "100%", p: 1 }}>
//           {currentChannelUrl ? (
//             <Channel channelUrl={currentChannelUrl} />
//           ) : (
//             <Box
//               sx={{
//                 height: "100%",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 color: "text.disabled",
//               }}
//             >
//               Select a chat
//             </Box>
//           )}
//         </Box>
//       </Grid>
//     </Grid>
//   );
// };

// export default ChatComponent;


import React, { useEffect, useState } from "react";
import {
  useSendbirdStateContext,
  ChannelList,
  Channel,
} from "@sendbird/uikit-react";
import "@sendbird/uikit-react/dist/index.css";
import { Box, Grid } from "@mui/material";

const ChatComponent = ({
  userId,
  recipientId = null,
  recipientNickname = "Recipient",
}) => {
  const [currentChannelUrl, setCurrentChannelUrl] = useState("");

  const { stores } = useSendbirdStateContext();
  const sb = stores?.sdkStore?.sdk;

  useEffect(() => {
    if (!recipientId || !sb || !sb.groupChannel) return;

    const fetchOrCreate = async () => {
      try {
        const query = sb.groupChannel.createMyGroupChannelListQuery({
          userIdsFilter: {
            userIds: [userId, recipientId],
            includeMode: "AND",
            queryType: "EXACT",
          },
          includeEmpty: true,
          limit: 1,
        });

        const channels = await query.next();
        if (channels.length) {
          setCurrentChannelUrl(channels[0].url);
        } else {
          const newChannel = await sb.groupChannel.createChannel({
            invitedUserIds: [recipientId],
            name: `${recipientNickname} & ${userId}`,
            isDistinct: true,
          });
          setCurrentChannelUrl(newChannel.url);
        }
      } catch (e) {
        console.error("Channel error:", e);
      }
    };

    fetchOrCreate();
  }, [sb, userId, recipientId, recipientNickname]);

  return (
    <Grid container sx={{ height: "80vh" }}>
      <Grid item sx={{ flex: "0 0 350px", height: "100%", overflow: "auto" }}>
        <Box sx={{ height: "100%", p: 1 }}>
          <ChannelList
            selectedChannelUrl={currentChannelUrl}
            onChannelSelect={(ch) => {
              if (ch && ch.url) {
                setCurrentChannelUrl(ch.url);
              } else {
                console.warn("Channel is null or undefined:", ch);
              }
            }}
          />
        </Box>
      </Grid>

      <Grid item sx={{ flex: 1, height: "100%", overflow: "auto" }}>
        <Box sx={{ height: "100%", p: 1 }}>
          {currentChannelUrl ? (
            <Channel channelUrl={currentChannelUrl} />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "text.disabled",
              }}
            >
              Select a chat
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChatComponent;
