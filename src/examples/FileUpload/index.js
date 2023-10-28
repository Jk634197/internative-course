import React, { useState, Fragment } from "react";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close, FileDocumentOutline } from "mdi-material-ui";
import { Controller } from "react-hook-form";
import DropzoneWrapper from "layouts/react-dropzone";
import { red } from "@mui/material/colors";

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(red[500]),
  backgroundColor: red[500],
  "&:hover": {
    backgroundColor: red[700],
  },
}));

const Img = styled("img")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    marginRight: theme.spacing(10),
  },
  [theme.breakpoints.down("md")]: {
    marginBottom: theme.spacing(4),
  },
  [theme.breakpoints.down("sm")]: {
    width: 250,
  },
}));
// Styled component for the heading inside the dropzone area
const HeadingTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(4),
  },
}));
function FileUpload({ control, setValue, errors, files, setFiles, isMultiple, fieldName }) {
  console.log(files);
  const onDrop = (acceptedFiles) => {
    setValue(fieldName, acceptedFiles[0]);
    setFiles([...acceptedFiles]);
  };

  const handleRemoveFile = (file) => {
    const updatedFiles = files.filter((f) => f.name !== file.name);
    setFiles(updatedFiles);
    setValue(fieldName, undefined);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
    setValue(fieldName, undefined);
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: isMultiple,
    accept: ["image/jpeg", "image/jpg", "image/png"],
    onDrop,
  });

  const fileList = files.map((file, index) => (
    <ListItem key={index}>
      <div style={{ overflow: "hidden" }} className="file-details">
        <div className="file-preview">
          {file.type.startsWith("image") ? (
            <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
          ) : (
            <Typography variant="body1">
              <FileDocumentOutline />
            </Typography>
          )}
        </div>
        <div>
          <Typography className="file-name">{file.name}</Typography>
          <Typography className="file-size" variant="body2">
            {Math.round(file.size / 1000)} KB
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <Close fontSize="small" />
      </IconButton>
    </ListItem>
  ));

  return (
    <FormControl fullWidth sx={{ mb: 6 }}>
      <Controller
        name={fieldName}
        render={(props) => (
          <DropzoneWrapper error={Boolean(errors.image)}>
            <Fragment>
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <Box>
                  <Img width={300} alt="Upload img" src="/upload.png" />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      textAlign: ["center", "center", "center"],
                    }}
                  >
                    <HeadingTypography variant="h5">
                      Drop files here or click to upload.
                    </HeadingTypography>
                    <Typography color="textSecondary">Allowed *.jpeg, *.jpg, *.png</Typography>
                  </Box>
                </Box>
              </div>
              {files.length ? (
                <Fragment>
                  <List>{fileList}</List>
                  <div className="buttons">
                    <ColorButton sx={{ mr: 3 }} variant="contained" onClick={handleRemoveAllFiles}>
                      Remove
                    </ColorButton>
                  </div>
                </Fragment>
              ) : null}
            </Fragment>
          </DropzoneWrapper>
        )}
        control={control}
      />
      {errors.image && (
        <FormHelperText sx={{ color: "error.main" }}>{errors.image.message}</FormHelperText>
      )}
    </FormControl>
  );
}

// Define prop types for the FileUpload component
FileUpload.propTypes = {
  control: PropTypes.object.isRequired, // should be a react-hook-form control object
  setValue: PropTypes.func.isRequired, // should be a function
  errors: PropTypes.object.isRequired, // should be an object
  files: PropTypes.array.isRequired, // should be an array
  setFiles: PropTypes.func.isRequired, // should be a function
  isMultiple: PropTypes.bool,
  fieldName: PropTypes.string,
};

FileUpload.defaultProps = {
  isMultiple: false,
  fieldName: "image",
};
export default FileUpload;
