import React from "react";
import { SendBirdProvider } from "@sendbird/uikit-react";
import ChatComponent from "./ChatComponent";

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID;

export default function ChatWrapper({
  userId,
  userNickname,
  recipientId,
  recipientNickname,
}) {
  return (
    <SendBirdProvider appId={APP_ID} userId={userId} nickname={userNickname}>
      <ChatComponent
        userId={userId}
        recipientId={recipientId}
        recipientNickname={recipientNickname}
      />
    </SendBirdProvider>
  );
}
