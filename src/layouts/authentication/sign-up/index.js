/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
// import bgImage from "/bg-sign-up-cover.jpeg";
import BasicLayout from "../components/BasicLayout";
import { useState } from "react";
import axios from "axios";
import { useAuthentication } from "context/AuthenticationService";
import { Box, CircularProgress } from "@mui/material";

function Cover() {
  const [isLoading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
    mobileNo: "",
    cpassword: "",
    isTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
    cpassword: "",
    isTerms: "",
  });
  const { customNotification } = useAuthentication();
  const navigate = useNavigate();
  function validateForm(data) {
    let errors = {};

    if (!data.first) {
      errors.first = "First Name is required";
    }

    if (!data.last) {
      errors.last = "Last Name is required";
    }

    if (!data.email) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.mobileNo) {
      errors.mobile = "Mobile phone is required";
    } else if (!/^\d{10}$/.test(data.mobileNo)) {
      errors.mobile = "Mobile phone is invalid"; // Customize the validation rule
    }
    if (!data.password) {
      errors.password = "Password is required";
    }

    if (data.password !== data.cpassword) {
      errors.cpassword = "Passwords do not match";
    }

    if (!data.isTerms) {
      customNotification.info({ title: "please accept terms and condition" });
      errors.isTerms = "Please accept terms and condition";
    }
    return errors;
  }

  const handleRegister = (event) => {
    try {
      setLoading(true);
      event.preventDefault(); // Prevent the default form submission behavior
      const errors = validateForm(registerData);
      setValidationErrors(errors);

      if (Object.keys(errors).length === 0) {
        axios
          .post("https://backend.internative.in/admin/signUp", registerData)
          .then((response) => {
            if (response.data.acknowledgement === false) {
              customNotification.error({ title: response.data.message });
            } else {
              customNotification.success({ title: "registration successful" });
              // Handle the successful login response here
              navigate("/authentication/sign-in", { replace: true });
            }
          })
          .catch((error) => {
            customNotification.error({ title: "error while doing registration" });
            // Handle any errors or failed login attempts
            console.error("Login failed:", error);
          });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <BasicLayout image={"/bg-sign-up-cover.jpeg"}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" onSubmit={handleRegister} role="form">
            <MDBox mb={2}>
              <MDInput
                onChange={(e) => {
                  setRegisterData({ ...registerData, ...{ first: e.target.value } });
                }}
                type="text"
                id="first"
                name="first"
                label="First Name"
                variant="standard"
                error={!!validationErrors.first}
                helperText={validationErrors.first}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                onChange={(e) => {
                  setRegisterData({ ...registerData, ...{ last: e.target.value } });
                }}
                type="text"
                id="last"
                name="last"
                label="Last Name"
                error={!!validationErrors.last}
                helperText={validationErrors.last}
                variant="standard"
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                onChange={(e) => {
                  setRegisterData({ ...registerData, ...{ email: e.target.value } });
                }}
                type="email"
                id="email"
                name="email"
                label="Email"
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                variant="standard"
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                onChange={(e) => {
                  setRegisterData({ ...registerData, mobileNo: e.target.value });
                }}
                type="text"
                id="mobile"
                name="mobile"
                label="Mobile Phone"
                variant="standard"
                fullWidth
                error={!!validationErrors.mobile}
                helperText={validationErrors.mobile}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                onChange={(e) => {
                  setRegisterData({ ...registerData, ...{ password: e.target.value } });
                }}
                type="password"
                id="password"
                name="password"
                label="Password"
                variant="standard"
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                onChange={(e) => {
                  setRegisterData({ ...registerData, ...{ cpassword: e.target.value } });
                }}
                type="password"
                id="cpassword"
                name="cpassword"
                label="Confirm Password"
                variant="standard"
                error={!!validationErrors.cpassword}
                helperText={validationErrors.cpassword}
                fullWidth
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox
                onChange={(e) => {
                  setRegisterData({ ...registerData, ...{ isTerms: e.target.value } });
                }}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                disabled={isLoading}
                type="submit"
                variant="gradient"
                color="info"
                fullWidth
              >
                {isLoading ? (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(255, 255, 255, 0.7)" // Semi-transparent white overlay
                  >
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  "Register"
                )}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Cover;
