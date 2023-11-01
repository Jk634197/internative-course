/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CustomToast from "examples/ShowNotification";

export default function data() {
  const [data, setData] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [elements, setElements] = useState([]);
  // const handleDelete = async (key) => {
  //   try {
  //     const updatedData = data.map((item) =>
  //       item.key === key ? { ...item, isDeleting: true } : item
  //     );

  //     setData(updatedData);

  //     console.log(`Delete button clicked for key: ${key}`);
  //     // await axios
  //     //   .delete(`https://backend.internative.in/course/${key}`)
  //     //   .then(() => {
  //     //     CustomToast.success("course deleted successfully");
  //     //     fetchData();
  //     //   })
  //     //   .catch((error) => {
  //     //     CustomToast.error("delete course failed");
  //     //     console.error("Error fetching data:", error);
  //     //   });
  //   } catch (error) {
  //     CustomToast.error("delete course failed");
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     // Reset the deletion state after the operation (whether success or failure)
  //     const updatedData = data.map((item) =>
  //       item.key === key ? { ...item, isDeleting: false } : item
  //     );

  //     setData(updatedData);
  //   }
  // };
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/user-list");
      const data = await response.json();
      setData(data);
      setElements(
        data.map((user) => {
          return {
            name: (
              <MDTypography
                component="div"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                {`${user.first} ${user.last}`}
              </MDTypography>
            ),
            email: (
              <MDTypography
                component="div"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                {user.email}
              </MDTypography>
            ),
            mobileNo: (
              <MDTypography
                component="div"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                {user.mobileNo}
              </MDTypography>
            ),
            birthDate: (
              <MDTypography
                component="div"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                {user.birthDate}
              </MDTypography>
            ),
            isVerified: (
              <MDTypography
                component="div"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
              >
                {user.isVerified ? "Verified" : "Unverified"}
              </MDTypography>
            ),
          };
        })
      );
      CustomToast.success("data fetch done");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Job = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "Name", accessor: "name", width: "45%", align: "left" },
      { Header: "Email", accessor: "email", align: "left" },
      { Header: "Mobile", accessor: "mobileNo", align: "center" },
      { Header: "Birth Date", accessor: "birthDate", align: "center" },
      { Header: "Verification", accessor: "isVerified", align: "center" },
    ],

    rows: elements,
  };
}
