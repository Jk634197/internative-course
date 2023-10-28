// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// export default Notifications;
import React, { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Notification({ message, type, onClose }) {
  const [open, setOpen] = useState(true);

  const closeNotification = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const renderNotification = (
    <MDSnackbar
      color={type}
      title="Material Dashboard"
      content={message}
      dateTime="11 mins ago"
      open={open}
      onClose={closeNotification}
      close={closeNotification}
      bgWhite
    />
  );

  return renderNotification;
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type) => {
    const newNotification = {
      message,
      type,
      id: Date.now(), // Unique identifier for each notification
    };
    setNotifications([...notifications, newNotification]);
  };

  const removeNotification = (id) => {
    const updatedNotifications = notifications.filter((notification) => notification.id !== id);
    setNotifications(updatedNotifications);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          {/* ... Other components */}
        </Grid>
      </MDBox>
      <Footer />
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </DashboardLayout>
  );
}
Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

Notification.defaultProps = {
  message: "",
  type: "success",
};
export { Notifications, Notification };
