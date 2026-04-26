import React from "react";
import ChatWrapper from "components/ChatComponent/ChatWrapper";

export default function AdminInbox() {

  const adminData = JSON.parse(localStorage.getItem("data") || "{}");
  const adminId = adminData?.data?._id;
  const adminName = adminData?.data?.username;


  const patient = JSON.parse(localStorage.getItem("patientData") || "{}");
  const recipientId = patient?._id || null;
  const recipientName = patient?.name || "Recipient";

  return (

    <div
      className="w-100 d-flex justify-content-center"
      style={{
        paddingTop: "90px",           // ✅ spacing from top
        height: "calc(100vh - 60px)", // adjusts height after top spacing
        overflow: "hidden",
      }}
    >
      <div
        className="w-100"
        style={{
          maxWidth: "1200px",
          height: "100%",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <ChatWrapper
          userId={adminId}
          userNickname={adminName}
          recipientId={recipientId}
          recipientNickname={recipientName}
        />
      </div>
    </div>




  );
}
