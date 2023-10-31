import { useState } from "react";

// Material Dashboard 2 PRO React Components
import MDButton from "components/MDButton";

import Snackbar from "@mui/material/Snackbar";
import { useAuthentication } from "context/AuthenticationService";
import { Alert } from "mdi-material-ui";

function CustomNotification() {
  const { removeNotification, notification } = useAuthentication();
  const { isShow, title, description, type } = notification;
  console.log(notification);
  return (
    <>
      <Snackbar
        color={type}
        icon="notifications"
        dateTime={null}
        open={isShow !== undefined && isShow}
        autoHideDuration={6000}
        onClose={removeNotification}
      >
        <Alert onClose={removeNotification} severity={type} sx={{ width: "100%" }}>
          {title}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CustomNotification;
