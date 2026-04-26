import React, { useState, useEffect } from "react";
import {
  SendBirdProvider,
  useSendbirdStateContext,
} from "@sendbird/uikit-react";
import { GroupChannel } from "@sendbird/uikit-react/GroupChannel";
import "@sendbird/uikit-react/dist/index.css";
import { GroupChannelList } from "@sendbird/uikit-react/GroupChannelList";
import { Button } from 'reactstrap';
import { FaArrowLeft } from 'react-icons/fa';

const ChatComponent = ({
  userId,
  userNickname,
  recipientId,
  recipientNickname,
}) => {
  // ✅ Use props first, fallback to localStorage only if not passed
  const finalUserId = userId || localStorage.getItem("sendBirdUserId") || "User";
  const finalUserNickname = userNickname || localStorage.getItem("sendBirdUserName") || "User";
  const finalRecipientId = recipientId || "test";
  const finalRecipientNickname = recipientNickname || "Recipient";

  const [showChat, setShowChat] = useState(true);
  const [currentChannelUrl, setCurrentChannelUrl] = useState("");
  const APP_ID = "0C9C0093-D483-46BC-9D98-938BE5FE8A84";

  const { stores } = useSendbirdStateContext();
  const sb = stores?.sdkStore?.sdk;

  useEffect(() => {
    if (finalRecipientId && sb && sb.groupChannel) {
      const fetchOrCreateChannel = async () => {
        try {
          const userExactFilter = {
            userIds: [finalUserId, finalRecipientId],
            includeMode: true,
            queryType: "AND",
          };

          const query = sb.groupChannel.createMyGroupChannelListQuery({
            userIdsFilter: userExactFilter,
            includeEmpty: true,
            limit: 5,
          });

          const channels = await query.next();

          if (channels.length > 0) {
            setCurrentChannelUrl(channels[0].url);
          } else {
            const params = {
              invitedUserIds: [finalUserId, finalRecipientId],
            };

            const newChannel = await sb.groupChannel.createChannel(params);
            setCurrentChannelUrl(newChannel.url);
          }
        } catch (error) {
          console.error("Error creating or fetching channel:", error);
        }
      };

      fetchOrCreateChannel();
    }
  }, [finalRecipientId, sb]);

  return (
    <SendBirdProvider
      appId={APP_ID}
      userId={finalUserId}
      nickname={finalUserNickname}
    >
      <div
        className="d-flex flex-column flex-sm-row"
        style={{
          height: "calc(100vh - 40px)",
          margin: "20px",
          padding: "16px",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* Channel List */}
        <div
          className={`${showChat ? "d-none d-sm-block" : ""}`}
          style={{
            width: "100%",
            maxWidth: "350px",
            height: "100%",
            padding: "16px 12px",
            overflow: "hidden",
            borderRadius: "0 8px 8px 0",
            position: "relative",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <GroupChannelList
            selectedChannelUrl={currentChannelUrl}
            onChannelCreated={(channel) => setCurrentChannelUrl(channel.url)}
            onChannelSelect={(channel) => {
              setCurrentChannelUrl(channel.url);
              setShowChat(true);
            }}
          />
        </div>

        {/* Chat Window */}
        <div
          className="flex-grow-1"
          style={{
            height: "100%",
            overflow: "hidden",
            position: "relative",
            padding: "12px",
            borderRadius: "0 8px 8px 0",
          }}
        >
          {showChat && currentChannelUrl ? (
            <>
              <Button
                color="link"
                className="d-sm-none"
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  zIndex: 2,
                  fontSize: "1.2rem",
                  color: "#333",
                }}
                onClick={() => setShowChat(false)}
              >
                <FaArrowLeft /> Back
              </Button>

              <GroupChannel channelUrl={currentChannelUrl} />
            </>
          ) : (
            <div
              className="d-flex align-items-center justify-content-center text-center"
              style={{ height: "100%", color: "#999" }}
            >
              <p className="mb-0">
                {window.innerWidth < 576
                  ? "Select a conversation"
                  : "Select a chat to start conversation"}
              </p>
            </div>
          )}
        </div>
      </div>
    </SendBirdProvider>
  );
};

export default ChatComponent;
