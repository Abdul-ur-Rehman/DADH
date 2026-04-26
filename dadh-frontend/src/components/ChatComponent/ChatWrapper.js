import React from "react";
import { SendBirdProvider } from "@sendbird/uikit-react";
import ChatComponent from "./ChatComponent";

const APP_ID = "0C9C0093-D483-46BC-9D98-938BE5FE8A84";

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
