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

// Images
import { FormControl, InputLabel, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import CustomToast from "examples/ShowNotification";
import { get } from "api";
import { useAuthentication } from "context/AuthenticationService";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import { post } from "api";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";

export default function data() {
  const context = useAuthentication();
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
      const data = await get(
        "https://backend.internative.in/admin/admin-list",
        context.customNotification,
        true,
        context
      );
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
            // birthDate: (
            //   <MDTypography
            //     component="div"
            //     href="#"
            //     variant="caption"
            //     color="text"
            //     fontWeight="medium"
            //   >
            //     {user.birthDate}
            //   </MDTypography>
            // ),
            isVerified: (
              <MDBox component="div" href="#" variant="caption" color="text" fontWeight="medium">
                <VerificationComponent tag={user.isVerified} id={user._id} />
              </MDBox>
            ),
          };
        })
      );
      CustomToast.success("data fetch done");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const updateVerification = async (userId, isVerified) => {
    const response = await post(
      "https://backend.internative.in/admin/verify-internal",
      { userId, isVerified },
      context.customNotification,
      true,
      context
    );
    if (response.data.acknowledgement) {
      fetchData();
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
  const VerificationComponent = ({ tag, id }) => {
    const [age, setAge] = useState(tag);

    const handleChange = (event) => {
      setAge(event.target.value);
      updateVerification(id, event.target.value);
    };

    return (
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <Select
            sx={{ width: "100%" }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={age}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value={true}>Verified</MenuItem>
            <MenuItem value={false}>Unverified</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  };

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
      { Header: "Name", accessor: "name", width: "35%", align: "left" },
      { Header: "Email", accessor: "email", align: "left" },
      { Header: "Mobile", accessor: "mobileNo", align: "center" },
      // { Header: "Birth Date", accessor: "birthDate", align: "center" },
      { Header: "Verification", accessor: "isVerified", width: "30%", align: "center" },
    ],

    rows: elements,
  };
}
