import React, { useEffect, useState } from "react";
import UploadButtons from "./upload.jsx";
import getKnowledgeBases from "../services/knowledgeBaseService.js";
import { useHistory } from "react-router-dom";
import { TestPath } from "../services/pathService.js";
import { generateRunId } from "../services/utils";
import { createJob } from "../services/tableStorageService.js";
import { PrimaryButton, TextField } from "@fluentui/react";
import { Dropdown } from "office-ui-fabric-react/lib/Dropdown";
import { uploadFileToBlob } from "../services/fileUploadService.js";
import triggerTestExecution from "../services/testFunctionService.js";
import { getAllActions as getAllSettings } from "../services/settingService";
import { hasAccessRight } from "../services/accessService";
import { mergeStyles, Stack } from 'office-ui-fabric-react';
import { classes } from "../styles"

export default function NewTest() {
  const history = useHistory();

  const [environment, setEnvironment] = useState("UAT");
  const [knowledgebase, setKnowledgebase] = useState("");
  const [knowdledgeBases, setKnowledgeBases] = useState([]);
  const [testsetName, setTestsetName] = useState("");
  const [file, setFile] = useState(null);
  const [environmentOptions, setEnvironmentOptions] = useState();
  const [isFileValid, setIsFileValid] = useState(true);
  const [, setUploadedBlobs] = useState([]);
  const [, setProgressing] = useState(false);
  const [comment, setComment] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    getAllSettings()
      .then((result) => {
        var envSelection = result.filter(m => m.key == "QNATesting_Environments");

        var envOptions = envSelection[0].options;
        var environmentOptions = Object.keys(envOptions).map(function (key) {
          return { key: key, text: envOptions[key] }
        });
        setEnvironmentOptions(environmentOptions);
      })
      .catch((error) => console.log(error));

    hasAccessRight("BMT_QNA_Tester")
      .then((result) => {
        if (result == true) {
          setHasAccess(true);
        }
      })
      .catch((error) => console.log(error));

  }, []);

  const handleEnvironmentChange = (env, data) => {
    setKnowledgeBases([]);
    console.log(data);
    console.log(data.text.toUpperCase());
    getKnowledgeBases(data.text.toUpperCase())
      .then((result) => {
        console.log(result);
        setKnowledgeBases(
          result.message.knowledgebases.map(
            (kb) => new Object({ key: kb.id, text: kb.name })
          )
        );
      })
      .catch((error) => console.log(error));
  };

  const handleChangeValid = (value) => {
    setIsFileValid(value);
  };

  const handleChangeFile = (value) => {
    setFile(value);
    setTestsetName(value.name);
  };

  const handleFileUpload = async () => {
    setProgressing(true);
    const uploadedBlobs = await uploadFileToBlob(file).then(() => {
      setTestsetName(file.name);
    });
    setUploadedBlobs(uploadedBlobs);
    setFile(null);
    setProgressing(false);
  };

  const handleKnowledegBaseChange = (event, data) => {
    setKnowledgebase(data.key);
  };


  const dropdownStyles = mergeStyles({ width: '300px' })

  const handleRun = () => {
    const runId = generateRunId();

    handleFileUpload();

    const jobToBeProcessed = {
      PartitionKey: runId + "",
      RowKey: "test" + "",
      testset: testsetName,
      username: "username",
      environment: environment + "",
      status: "Angefordert",
      kbId: knowledgebase + "",
      comment: comment,
    };

    createJob("QnABatchTestJobs", jobToBeProcessed);
    triggerTestExecution(
      environment,
      testsetName,
      knowledgebase,
      generateRunId()
    );
    history.push(TestPath.InitialScreen);
  };

  return (
    <div>
      <div className={classes.root}>
        <Stack className={classes.stack} gap={20}>
          <h1>Neuer Test</h1>
          <h4>Umgebung*</h4>
          <Dropdown
            placeholder="Bitte auswählen..."
            onChange={handleEnvironmentChange}
            options={environmentOptions}
            className={dropdownStyles}
          />
          <Stack className={classes.stack} horizontal gap={20}>
            <Stack gap={20}>
              <h4>Knowledge Base*</h4>
              <Dropdown
                placeholder="Bitte auswählen..."
                onChange={handleKnowledegBaseChange}
                options={knowdledgeBases}
                className={dropdownStyles}
              />
            </Stack>
            <Stack gap={20}>
              <h4>Testfälle*</h4>
              <UploadButtons
                onChangeValid={handleChangeValid}
                file={file}
                onChangeFile={handleChangeFile}
                isFileValid={isFileValid}
              />
            </Stack>
          </Stack>
          <TextField
            multiline
            rows={5}
            id="1"
            label="Bemerkung"
            value={comment}
            variant="filled"
            onChange={(event) => setComment(event.target.value)}
          />
          <PrimaryButton
            className={classes.button}
            text="Test starten"
            variant="contained"
            color="primary"
            margin="50px"
            onClick={handleRun}
            disabled={file === null || !isFileValid || testsetName === "" || !hasAccess}
          />
        </Stack>
      </div >
      <span style={{color: 'red'}}>
        {hasAccess ? "" : "Fehlende Rechte, um Test zu starten."}
      </span>
    </div>
  );
}
