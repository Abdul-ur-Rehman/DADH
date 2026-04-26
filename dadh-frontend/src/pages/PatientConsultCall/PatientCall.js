import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader, CardTitle } from "reactstrap";

const PatientCall = () => {
  const [callerId, setCallerId] = useState("");
  const [calleeId, setCalleeId] = useState("");

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="w-100 max-w-md shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-center text-primary h4">
            Patient Call
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="mb-3">
            <label className="form-label">Caller's ID:</label>
            <Input
              type="text"
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
              placeholder="Enter caller's user ID"
              className="form-control"
            />
          </div>
          <Button color="primary" className="mb-3">Step 1: Init</Button>
          <div className="mb-3">
            <label className="form-label">Callee's ID:</label>
            <Input
              type="text"
              value={calleeId}
              onChange={(e) => setCalleeId(e.target.value)}
              placeholder="Enter callee's user ID"
              className="form-control"
            />
          </div>
          <Button color="success">Step 2: Call</Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default PatientCall;
