import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useAuthentication } from "context/AuthenticationService";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomNotification() {
  const { notification, removeNotification, customNotification } = useAuthentication();
  const { isShow, title, type } = notification;
  const handleClick = (type) => {
    customNotification[type]({ title: "title here" });
  };

  const handleClose = (event, reason) => {
    removeNotification();
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {/* <Button
        variant="outlined"
        onClick={() => {
          handleClick("success");
        }}
      >
        Open success snackbar
      </Button>
      <Button
        onClick={() => {
          handleClick("error");
        }}
        variant="outlined"
      >
        Open error snackbar
      </Button>
      <Button
        onClick={() => {
          handleClick("warning");
        }}
        variant="outlined"
      >
        Open warning snackbar
      </Button>
      <Button
        onClick={() => {
          handleClick("info");
        }}
        variant="outlined"
      >
        Open info snackbar
      </Button> */}
      <Snackbar open={isShow} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={type} sx={{ width: "100%" }}>
          {title}
        </Alert>
      </Snackbar>
      {/* <Alert severity="error">This is an error message!</Alert>
      <Alert severity="warning">This is a warning message!</Alert>
      <Alert severity="info">This is an information message!</Alert>
      <Alert severity="success">This is a success message!</Alert> */}
    </Stack>
  );
}
