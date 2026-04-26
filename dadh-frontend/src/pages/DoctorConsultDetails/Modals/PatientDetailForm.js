import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";

const PatientDetailForm = ({ open, handleClose, patientData }) => {
  const [patient, setPatient] = useState({
    ...patientData,
  });

  const { id } = useParams();
  const patientId = location.state?.patientId;

  useEffect(() => {
    if (patientData) {
      setPatient({
        name: patientData.name || "",
        DOB: patientData.DOB || "",
        // IRN: patientData.IRN || "",
        email: patientData.email || "",
        phone: patientData.phone || "",
        medicareNumber: patientData.medicareNumber || "",
        gender: patientData.gender || "",
        address: patientData.address || "",
        hasConcession: patientData.hasConcession || false,
      });
    }
  }, [patientData]);

  useEffect(() => {
    if (!patientData && patientId) {
      const getPatientById = async () => {
        try {
          const response = await fetch(
            `/api/patient/auth/getOneById/${patientId}`
          );
          if (response.ok) {
            const data = await response.json();
            setPatient(data.data);
          } else {
            console.error("Failed to fetch patient data");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      };
      getPatientById();
    }
  }, [patientData, patientId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatient({
      ...patient,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdate = async () => {
    if (!patientData._id) {
      // alert("Patient ID is missing, cannot update.");
      return;
    }
    try {
      const response = await fetch(
        `/api/patient/auth/update/${patientData._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patient),
        }
      );
      if (response.status === 200) {
        // alert("Patient updated successfully!");
        handleClose();
      } else {
        // alert("Failed to update patient. Server error.");
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      // alert("Failed to update patient.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Patient Details
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }} clasname="text-xs" >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} className="text-xs">
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                className="text-xs"
                size="small"
                name="name"
                value={patient?.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                size="small"
                name="email"
                value={patient?.email}
                // onChange={handleChange}
                disabled
              />
            </Grid>

            {/* DOB & IRN */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                name="DOB"
                value={patient?.DOB}
                onChange={handleChange}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IRN"
                variant="outlined"
                size="small"
                name="IRN"
                type="number"
                value={patient?.IRN}
                onChange={handleChange}
              />
            </Grid> */}

            {/* Phone & Medicare */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                variant="outlined"
                size="small"
                name="phone"
                type="number"
                value={patient?.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medicare Number"
                variant="outlined"
                size="small"
                type="number"
                name="medicareNumber"
                value={patient?.medicareNumber}
                onChange={handleChange}
              />
            </Grid>

            {/* Gender Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup row name="gender" value={patient?.gender} onChange={handleChange}>
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="undisclosed" control={<Radio />} label="Undisclosed" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                size="small"
                name="address"
                value={patient?.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Concession Checkbox */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox name="hasConcession" checked={patient.hasConcession} onChange={handleChange} />}
                label="Has Concession"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="error" variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleUpdate}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientDetailForm;
