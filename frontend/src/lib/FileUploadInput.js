import { useState, useContext } from "react";
import { Grid, Button, TextField, LinearProgress } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import axios from "axios";

import { SetPopupContext } from "../App";

const FileUploadInput = (props) => {
  const setPopup = useContext(SetPopupContext);

  const { uploadTo, identifier, handleInput } = props;

  const [file, setFile] = useState(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const handleUpload = () => {
    if (!file) {
      setPopup({
        open: true,
        severity: "error",
        message: "Please select a file to upload",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post(uploadTo, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
          );
        },
      })
      .then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        handleInput(identifier, response.data.url);
        setUploadPercentage(0);
        setFile(null);
      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response?.data?.message || "Error uploading file",
        });
        setUploadPercentage(0);
        setFile(null);
      });
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (identifier === "resume" && selectedFile.type !== "application/pdf") {
      setPopup({
        open: true,
        severity: "error",
        message: "Please upload a PDF file",
      });
      return;
    }

    if (
      identifier === "profile" &&
      !["image/jpeg", "image/png"].includes(selectedFile.type)
    ) {
      setPopup({
        open: true,
        severity: "error",
        message: "Please upload a JPG or PNG file",
      });
      return;
    }

    setFile(selectedFile);
    setUploadPercentage(0);
  };

  return (
    <Grid container item xs={12} direction="column" className={props.className}>
      <Grid container item xs={12} spacing={0}>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            component="label"
            style={{ width: "100%", height: "100%" }}
          >
            {props.icon}
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleFileSelect}
              accept={identifier === "resume" ? ".pdf" : "image/jpeg,image/png"}
            />
          </Button>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={props.label}
            value={file ? file.name : ""}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={handleUpload}
            disabled={!file}
          >
            <CloudUpload />
          </Button>
        </Grid>
      </Grid>
      {uploadPercentage > 0 && (
        <Grid item xs={12} style={{ marginTop: "10px" }}>
          <LinearProgress variant="determinate" value={uploadPercentage} />
        </Grid>
      )}
    </Grid>
  );
};

export default FileUploadInput;