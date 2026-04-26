import React, { useState, useEffect } from "react";
import {
  Card,
  Box,
  CardContent,
  Typography,
  Button,
  Divider,
  Container,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ConsultationCategorySelector = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const REACT_APP_BACKEND_URL = "http://localhost:5001/api";

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("ispatientLoggedIn");
    const userRole = localStorage.getItem("userRole");

    if (isLoggedIn === "true" && userRole === "patient") {
      navigate("/patient");
    }
  }, []);

  useEffect(() => {
    const isPatientLoggedIn = localStorage.getItem("isPatientLoggedIn");
    setIsLoggedIn(isPatientLoggedIn === "true"); // convert string to boolean
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_BACKEND_URL}/consultationCategory/getAll`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setCategories(result.data);
        } else {
          console.log("Error:", result.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleNext = () => {
    if (selectedCategory) {
      localStorage.setItem("selectedCategory", selectedCategory);
      navigate("/patient/descriptions", { state: { selectedCategory } });
    }
  };

  const handleLogin = () => {
    navigate("/patient/login");
  };

  return (
    <Box p={3} display="flex" justifyContent="center" bgcolor="#f5f5f5" minHeight="100vh">
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <Box sx={{ backgroundColor: "#1976d2", p: 3, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <Typography variant="h5" color="white" textAlign="center">
              Patient Consultation
            </Typography>
          </Box>
          <CardContent>
            {/* Login Button */}
            {!isLoggedIn && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Login
                </Button>

                {/* OR Divider */}
                <Box display="flex" alignItems="center" mt={3} mb={2}>
                  <Divider sx={{ flexGrow: 3, borderColor: "#000000" }} />
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    textAlign="center"
                    sx={{ mx: 2 }}
                  >
                    OR
                  </Typography>
                  <Divider sx={{ flexGrow: 3, borderColor: "#000000" }} />
                </Box>
              </>
            )}


            {/* Category Title with Divider */}
            <Box display="flex" alignItems="center" mt={3} mb={2}>
              <Typography variant="subtitle2" color="black" textAlign="center">
                Select a category to continue
              </Typography>
            </Box>
            {/* Category Cards */}
            <Stack spacing={2}>
              {categories.map((category) => (
                <Card
                  key={category._id}
                  onClick={() => setSelectedCategory(category.key)}
                  sx={{
                    cursor: "pointer",
                    border: selectedCategory === category.key ? "2px solid #1976d2" : "1px solid #ddd",
                    boxShadow: selectedCategory === category.key ? 3 : 1,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{category.category}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.notes}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* Next Button */}
            {selectedCategory && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                fullWidth
                sx={{ mt: 3 }}
              >
                Next
              </Button>
            )}


          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ConsultationCategorySelector;