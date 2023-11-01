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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import AddIcon from "@mui/icons-material/Add";

import CustomToast from "examples/ShowNotification";
// Material Dashboard 2 React components
import { useDropzone } from "react-dropzone";
import DropzoneWrapper from "layouts/react-dropzone";
import { useForm, Controller } from "react-hook-form";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import FileDocumentOutline from "mdi-material-ui/FileDocumentOutline";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import authorsTableData from "./data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import MDButton from "components/MDButton";
import ReactQuill from "react-quill";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Icon,
  IconButton,
  List,
  ListItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import { ArrowDownDropCircle, Close, Delete } from "mdi-material-ui";
import FileUpload from "examples/FileUpload";
import { useNavigate } from "react-router-dom";
import MDInput from "components/MDInput";
import MUIRichTextEditor from "mui-rte";

function Course() {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    // maxFiles: 2,
    maxSize: 1000000,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      clearErrors("image");
      setValue("image", files);
      setFiles(acceptedFiles.map((file) => Object.assign(file)));
    },
    onDropRejected: () => {
      CustomToast.error("You can only upload a files & maximum size of 1 MB.", {
        duration: 2000,
      });
    },
  });
  const handleRemoveFile = (file) => {
    const uploadedFiles = files;
    const filtered = uploadedFiles.filter((i) => i?.name !== file?.name);
    setFiles([...filtered]);
    setValue("image", undefined);
  };

  const handleRemoveAllFiles = () => {
    setValue("image", undefined);
    setFiles([]);
  };

  const renderFilePreview = (file) => {
    if (file?.type?.startsWith("image")) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />;
    } else {
      if (editRow) {
        return <img width={38} height={38} alt={editRow?.name} src={editRow?.icon} />;
      }
      return <FileDocumentOutline />;
    }
  };
  const [boxes, setBoxes] = useState([
    {
      mainTextFieldValue: "",
      dropdownTextFields: [""],
    },
  ]);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      options: ["", "", "", ""],
      answer: "",
    },
  ]);

  const [courseThumbnail, setCourseThumbnail] = useState([]);
  const [careerPathFile, setCareerPathFile] = useState([]);
  const [techStackFile, setTechStackFile] = useState([]);
  const [describeCourse, setDescribeCourse] = useState("");
  const [description, setDescription] = useState("");
  const [courseLength, setCourseLength] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCourseLengthChange = (event) => {
    setCourseLength(event.target.value);
  };

  const removeQuestion = (id) => {
    const filteredQuestions = questions.filter((question) => question.id !== id);
    const updatedQuestions = filteredQuestions.map((question, index) => {
      return { ...question, id: index + 1 };
    });
    console.log(updatedQuestions);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answer = value;
    setQuestions(updatedQuestions);
  };

  const addNewQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: "",
      options: ["", "", "", ""],
      answer: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  // Function to toggle the dropdown for a specific module
  const toggleDropdown = (index) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index].isDropdownOpen = !updatedBoxes[index].isDropdownOpen;
    setBoxes(updatedBoxes);
  };

  // Function to handle changes in the main text field of a module
  const handleMainTextFieldChange = (event, index) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index].mainTextFieldValue = event.target.value;
    setBoxes(updatedBoxes);
  };

  // Function to add a new text field to a specific module's dropdown
  const addNewTextField = (index) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index].dropdownTextFields.push("");
    setBoxes(updatedBoxes);
  };

  // Function to remove a text field from a specific module's dropdown
  const removeTextField = (boxIndex, textFieldIndex) => {
    const updatedBoxes = [...boxes];
    if (updatedBoxes[boxIndex].dropdownTextFields.length > 1) {
      updatedBoxes[boxIndex].dropdownTextFields.splice(textFieldIndex, 1);
      setBoxes(updatedBoxes);
    }
  };

  // Function to handle changes in the text fields of a module's dropdown
  const handleDropdownTextFieldChange = (boxIndex, textFieldIndex, value) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[boxIndex].dropdownTextFields[textFieldIndex] = value;
    setBoxes(updatedBoxes);
  };

  // Function to add a new module box
  const addNewBox = () => {
    const newBox = {
      mainTextFieldValue: "",
      dropdownTextFields: [""],
    };
    setBoxes([...boxes, newBox]);
  };

  // Function to delete a module box
  const deleteBox = (index) => {
    const updatedBoxes = [...boxes];
    updatedBoxes.splice(index, 1);
    setBoxes(updatedBoxes);
  };

  // useEffect(() => {
  //   if (course !== null && course !== undefined && course !== '') {
  //     getCourseData();
  //   }
  // }, [])
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();

      // Append each field from your object to the formData object
      formData.append("title", event.target.title.value);
      formData.append("tagline", event.target.tagline1.value);
      formData.append("tagline1", event.target.tagline2.value);
      formData.append("duration", event.target.duration.value);
      formData.append("isShort", courseLength === "short");
      formData.append("modules", JSON.stringify(boxes));
      formData.append("questions", JSON.stringify(questions));
      courseThumbnail.map((file) => {
        formData.append("thumbnail", file);
      });
      careerPathFile.map((file) => {
        formData.append("careerPathImage", file);
      });
      techStackFile.map((file) => {
        formData.append("technologies", file);
      });
      formData.append("description", description);
      formData.append("roadMap", describeCourse);

      // Make the Axios POST request
      const response = await axios.post("https://backend.internative.in/course/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);
      CustomToast.success("course added successfully");
      navigate("/course-table");
      // Handle the response data or perform other actions here
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      CustomToast.error("having issue on course create");
      // Handle errors here
    } finally {
      setLoading(false);
    }
  };
  const [files, setFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState([]);
  const fileList = files.map((file) => (
    <ListItem key={file?.name}>
      <div style={{ overflow: "hidden" }} className="file-details">
        <div className="file-preview">{renderFilePreview(file)}</div>
        <div>
          <Typography className="file-name">{file?.name}</Typography>
          <Typography className="file-size" variant="body2">
            {Math.round(file?.size / 100) / 10 > 1000
              ? `${(Math.round(file?.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file?.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <Close fontSize="small" />
      </IconButton>
    </ListItem>
  ));
  const [add, setAdd] = useState(false);
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {add ? (
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                coloredShadow="info"
              >
                <form onSubmit={handleSubmit}>
                  <div className="max-w-3xl mx-auto p-2 md:p-5 shadow-lg my-10">
                    <h1 className="text-blue text-4xl text-center Gray-400 mt-3 mb-6 font-bold uppercase">
                      Course Details
                    </h1>
                    <div>
                      <h6 className="text-blue Gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                        Course Title
                      </h6>
                      <MDInput
                        label="Course Title"
                        variant="outlined"
                        name="title"
                        className="w-full bg-gray-100"
                      />
                    </div>
                    <div className="">
                      <h6 className="text-blue Gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                        Tagline
                      </h6>
                      <TextField
                        name="tagline1"
                        className="w-full bg-gray-100"
                        label="Tagline-1"
                        variant="outlined"
                      />
                      <TextField
                        name="tagline2"
                        className="w-full bg-gray-100 mt-2"
                        label="Tagline-2"
                        variant="outlined"
                      />
                    </div>
                    <div className="">
                      <h6 className="text-blue Gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                        Course Duration
                      </h6>
                      <MDInput
                        type="number"
                        name="duration"
                        label="duration"
                        className="border border-gray-400 rounded-lg outline-none p-3 bg-gray-100"
                        min={0}
                        placeholder="Enter The Duration"
                      />
                    </div>
                    <div className="">
                      <h6 className="text-blue Gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                        Course Short
                      </h6>
                      <RadioGroup aria-label="course-length" name="course-length">
                        <FormControlLabel
                          value="short"
                          control={<Radio />}
                          label="Short"
                          onChange={handleCourseLengthChange}
                        />
                        <FormControlLabel value="not-short" control={<Radio />} label="Long" />
                      </RadioGroup>
                    </div>
                    <h6 className="text-blue Gray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Course CURRICULAM
                    </h6>
                    <div className="flex flex-col  items-center mt-5 ">
                      {boxes.map((box, index) => (
                        <div key={index} className="relative w-full mb-3">
                          <div className="border p-4 flex items-center justify-between">
                            <Grid container spacing={2} alignItems="center">
                              <Grid item>
                                <IconButton onClick={() => toggleDropdown(index)}>
                                  <ArrowDropDownIcon />
                                </IconButton>
                              </Grid>
                              <Grid item xs>
                                <TextField
                                  label="Module"
                                  variant="outlined"
                                  value={box.mainTextFieldValue}
                                  onChange={(event) => handleMainTextFieldChange(event, index)}
                                  fullWidth
                                  style={{ backgroundColor: "#f0f0f0" }}
                                />
                              </Grid>
                            </Grid>
                            {boxes.length > 1 && (
                              <IconButton onClick={() => deleteBox(index)} color="error">
                                <Delete />
                              </IconButton>
                            )}
                          </div>
                          {box.isDropdownOpen && (
                            <div
                              className="border p-2 bg-white w-full"
                              style={{ maxHeight: "300px", overflowY: "auto" }}
                            >
                              {box.dropdownTextFields.map((text, textFieldIndex) => (
                                <Box
                                  key={textFieldIndex}
                                  className="flex items-center space-x-2 mt-2 mb-2"
                                >
                                  <TextField
                                    label="Sub Module"
                                    variant="outlined"
                                    value={text}
                                    onChange={(event) =>
                                      handleDropdownTextFieldChange(
                                        index,
                                        textFieldIndex,
                                        event.target.value
                                      )
                                    }
                                    fullWidth
                                    style={{ backgroundColor: "#f0f0f0", marginTop: 5 }}
                                  />
                                  {box.dropdownTextFields.length > 1 && (
                                    <IconButton
                                      onClick={() => removeTextField(index, textFieldIndex)}
                                      color="error"
                                    >
                                      <Close style={{ color: "red" }} />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                              <Button
                                onClick={() => addNewTextField(index)}
                                variant="contained"
                                color="primary"
                                style={{ color: "white", margin: "20px" }}
                              >
                                Add New SubModule
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="mt-3 flex justify-start">
                        <Button
                          onClick={addNewBox}
                          variant="contained"
                          color="primary"
                          style={{ color: "white", margin: "5px 0px" }}
                        >
                          Add New Module
                        </Button>
                      </div>
                    </div>

                    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Course Description
                    </h6>
                    <Grid item xs={12}>
                      <MUIRichTextEditor
                        toolbar
                        style={{ height: "500px" }}
                        defaultValue={description}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FileUpload
                        control={control}
                        setValue={setValue}
                        errors={errors}
                        files={thumbnail}
                        setFiles={setThumbnail}
                        fieldName={"thumbnail"}
                        isMultiple
                      />
                    </Grid>

                    <hr className="mb-6 border-b-1 border-blueGray-300" />
                    <div className="flex flex-wrap">
                      <div className="w-full lg:w-12/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-sm font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Course Curriculam
                          </label>
                          <ReactQuill
                            className="bg-white"
                            modules={{
                              toolbar: [
                                [{ header: [1, 2, false] }],
                                ["bold", "italic", "underline", "strike", "blockquote"],
                                [
                                  { list: "ordered" },
                                  { list: "bullet" },
                                  { indent: "-1" },
                                  { indent: "+1" },
                                ],
                                ["link", "image"],
                                ["clean"],
                              ],
                            }}
                            value={describeCourse}
                            placeholder="Enter Course Curriculam"
                            onChange={setDescribeCourse}
                          />
                        </div>
                      </div>
                    </div>
                    <hr className="mt-20 sm:mt-12 border-b-1 border-blueGray-300" />

                    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Course Quiz
                    </h6>
                    <div>
                      <div>
                        {questions.map((question, index) => (
                          <div key={index} className="mx-auto mb-6 p-6 rounded-md ">
                            <div className="flex flex-wrap">
                              <div className="w-full lg:w-12/12 px-4">
                                <div className="relative w-full mb-3">
                                  <label
                                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                    htmlFor="grid-password"
                                  >
                                    Question {index + 1}
                                  </label>
                                  <input
                                    type="text"
                                    id={`question-${index}`}
                                    name={`question-${index}`}
                                    value={question.question}
                                    onChange={(event) =>
                                      handleQuestionChange(index, event.target.value)
                                    }
                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="mb-4 flex flex-wrap">
                                <div className="w-full lg:w-12/12 px-4">
                                  <label
                                    htmlFor={`option-${index}-${optionIndex}`}
                                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                  >
                                    Option {optionIndex + 1}
                                  </label>
                                  <input
                                    type="text"
                                    id={`option-${index}-${optionIndex}`}
                                    name={`option-${index}-${optionIndex}`}
                                    value={option}
                                    onChange={(event) =>
                                      handleOptionChange(index, optionIndex, event.target.value)
                                    }
                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                    required
                                  />
                                </div>
                              </div>
                            ))}

                            <div className="mb-4 flex flex-wrap">
                              <div className="w-full lg:w-12/12 px-4">
                                <label
                                  htmlFor={`answer-${index}`}
                                  className="block text-gray-700 font-bold mb-2"
                                >
                                  Answer
                                </label>
                                <select
                                  id={`answer-${index}`}
                                  name={`answer-${index}`}
                                  value={question.answer}
                                  onChange={(event) =>
                                    handleAnswerChange(index, event.target.value)
                                  }
                                  className="border border-gray-400 bg-gray-100 p-2 w-full rounded-md"
                                  required
                                >
                                  <option value="">Select the correct answer</option>
                                  {question.options.map((option, optionIndex) => (
                                    <option key={optionIndex} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={addNewQuestion}
                              className="bg-[#282D48] text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                            >
                              Add New Question
                            </button>

                            {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(question.id)}
                                className="bg-[#282D48] text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                              >
                                Remove Question
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="bg-[#282D48] text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 hover:bg-[#1b1e30]"
                        variant="outlined"
                        color="primary"
                        size="large"
                      >
                        {loading ? <CircularProgress /> : "Submit"}
                      </Button>
                    </div>
                  </div>
                </form>
              </MDBox>
            ) : (
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <MDTypography variant="h6" color="white">
                        User List
                      </MDTypography>
                    </Grid>
                    {/* <Grid item xs={6} align="right">
                      <MDButton color="info" onClick={() => setAdd(true)}>
                        <AddIcon sx={{ fontWeight: 300 }} /> &nbsp;&nbsp; New Course
                      </MDButton>
                    </Grid> */}
                  </Grid>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                </MDBox>
              </Card>
            )}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Course;
