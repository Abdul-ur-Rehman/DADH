import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextareaAutosize,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
  Grid
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';

const PatientStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory } = location.state || {};

  const [description, setDescription] = useState("");
  const [teleHealthOption, setTeleHealthOption] = useState("videoCall");

  const BACKEND_URL = "http://localhost:5001/api";

  const handleSubmit = async () => {
    try {
      const storedData = JSON.parse(localStorage.getItem("data"));
      const patientId = storedData?.data?._id;

      if (!selectedCategory || !description || !teleHealthOption) {
        Swal.fire({
          icon: 'error',
          title: 'Incomplete Information',
          confirmButtonColor: '#1976d2',
          width: 400,
        });
        return;
      }

      if (!patientId) {
        Swal.fire({
          icon: 'error',
          title: 'Login Required',
          confirmButtonColor: '#1976d2',
          width: 400,
        });

        localStorage.setItem("CategoryDescription", description);
        localStorage.setItem("teleHealthOptions", teleHealthOption);
        navigate("/patient/login", { state: { description, teleHealthOption } });
        return;
      }

      const patientCheckRes = await fetch(`${BACKEND_URL}/consultations/getConsulationByPatient/${patientId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!patientCheckRes.ok) {
        Swal.fire({
          icon: 'info',
          title: 'Patient Not Found',
          text: 'Please register first.',
          confirmButtonColor: '#1976d2',
          width: 400,
        });

        navigate("/patient/Login");

        return;
      }


      const res = await fetch(`${BACKEND_URL}/consultations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationCategory: selectedCategory,
          notes: description,
          type: teleHealthOption,
          patientId,
          doctorId: "",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("consultationId", data?.data?._id);
        Swal.fire({
          icon: 'success',
          title: 'Consultation Added!',
          confirmButtonColor: '#1976d2',
          width: 400,
        }).then(() => {
          navigate("/patient");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data?.message || 'Failed to add consultation.',
          confirmButtonColor: '#1976d2',
          width: 400,
        });
      }
    } catch (err) {
      console.error("Error while adding consultation:", err);
      Swal.fire({
        icon: 'error',
        title: 'Something Went Wrong',
        confirmButtonColor: '#1976d2',
        width: 400,
      });
    }
  };

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <Card sx={{ overflow: "hidden" }}>
            <Box sx={{ backgroundColor: "#1976d2", textAlign: "center", p: 2 }}>
              <Typography variant="h5" color="white">
                Patient Consultation
              </Typography>
            </Box>

            <CardContent>
              <Typography variant="body1" gutterBottom>
                Please provide the details below:
              </Typography>

              {selectedCategory && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Selected Category: <strong>{selectedCategory}</strong>
                </Typography>
              )}

              <FormLabel>Description</FormLabel>
              <TextareaAutosize
                minRows={6}
                placeholder="Describe your condition, symptoms here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginTop: "8px"
                }}
              />

              <FormLabel sx={{ mt: 2 }}>Consultation Preference</FormLabel>
              <RadioGroup
                name="teleHealthOption"
                value={teleHealthOption}
                onChange={(e) => setTeleHealthOption(e.target.value)}
              >
                <FormControlLabel value="videoCall" label="Video Call" control={<Radio />} />
                <FormControlLabel value="textChat" label="Text Chat" control={<Radio />} />
                <FormControlLabel value="phoneCall" label="Phone Call" control={<Radio />} />
              </RadioGroup>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                <strong>Note:</strong> Your Telehealth consultation selection is not guaranteed. Based on your symptoms, the doctor may recommend another mode.
              </Typography>

              <Box textAlign="center" sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                  Done
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientStep2;
