import React, { useEffect, useState } from "react";
import {
  DetailsList,
  ProgressIndicator,
  SelectionMode,
  DetailsRow,
  ActionButton,
  Link
} from "@fluentui/react";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import { getTableStorage } from "../services/tableStorageService.js";

import { useTranslation } from 'react-i18next';
import { AudioGenerationPath, getPath } from "../services/pathService.js";

const moment = require("moment");
const DATE_FORMAT = "DD.MM.YYYY HH:mm:ss";

export default function AudioGenerationTable() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [audioGenerationJobs, setAudioGenerationJobs] = useState([]);

  const progressClass = { width: "100px" }

  const [columns, setColumns] = useState([
    {
      key: "Delete",
      name: "",
      minWidth: 50,
      maxWidth: 50,
      isResizable: false,
      onRender: (item) => {
        return (
          <ActionButton iconProps={deleteIcon} allowDisabledFocus  >
          </ActionButton>
        )
      },
    },
    {
      name: "Job Name", minWidth: 50, maxWidth: 70, isResizable: true,
      onRender: (item) => {
        return <Link href={getPath(AudioGenerationPath.Results, { rowKey: item.RowKey })}>{item.JobName}</Link>
      }
    },
    {
      fieldName: "Timestamp",
      name: t("BatchProcessing_LastUpdateFieldName"),
      minWidth: 120,
      maxWidth: 120,
      isResizable: true,
      onRender: (item) => {
        return moment(item.Timestamp).format(DATE_FORMAT);
      },
    },
    {
      name: t("BatchProcessing_PercentageFieldName"),
      minWidth: 100,
      maxWidth: 130,
      isMultiline: false,
      onRender: (item) => {
        return (
          <ProgressIndicator className={progressClass} barHeight={4} label={item.CompletionPercentage} percentComplete={parseInt(item.CompletionPercentage.replace("%", "")) / 100} />
        );
      },
      isResizable: true
    },
    {
      name: "Generated", minWidth: 50, maxWidth: 70, isResizable: true,
      onRender: (item) => {
        return <Link href={item.GeneratedFileURL}>{t("General_Download")}</Link>
      }
    },
    {
      name: "Converted", minWidth: 50, maxWidth: 70, isResizable: true,
      onRender: (item) => {
        return <Link href={item.ConvertedFileURL}>{t("General_Download")}</Link>
      }
    },
    {
      name: "Noise", minWidth: 50, maxWidth: 70, isResizable: true,
      onRender: (item) => {
        return <Link href={item.NoiseFileURL}>{t("General_Download")}</Link>
      }
    }
  ]);

  const handleColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.fieldName == currCol.fieldName)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
        console.log(currColumn.fieldName);
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newRows = _copyAndSort(rows, currColumn.fieldName, currColumn.isSortedDescending);
    setColumns(newColumns);
    setRows(newRows)
  };
  const _copyAndSort = (rs: Array, key, isSortedDescending) => {
    return rs.slice(0).sort((a, b) => ((isSortedDescending ? a[key].toString().toLowerCase() < b[key].toString().toLowerCase() : a[key].toString().toLowerCase() > b[key].toString().toLowerCase()) ? 1 : -1));
  };

  const iconClassNames = mergeStyleSets({
    success: [{ color: "green" }],
    created: [{ color: "yellow" }],
    failure: [{ color: "red" }],
  });

  useEffect(() => {
    if (
      audioGenerationJobs &&
      audioGenerationJobs.length > 0
    ) {
      const rawRows = audioGenerationJobs.map((obj, index) => ({
        ...obj,
        id: index,
      }));
      const processedRows = rawRows
        .sort(function (a, b) {
          return (
            new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
          );
        });
      setRows(processedRows);
    }
  }, [audioGenerationJobs, setRows]);


  useEffect(() => {
    initializeScreen()
  }, []);

  useEffect(() => {
    initializeScreen()
  }, []);

  const onRenderRow = props => {
    const customStyles = {};
    if (props) {
      customStyles.cell = { display: 'flex', alignItems: 'center' };


      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
  };

  function initializeScreen() {
    getTableStorage("AudioGenerationJobs")
      .then((result) => {
        setAudioGenerationJobs(result.message);
      })
      .catch((error) => console.log(error));
  }

  const refreshIconProps = { iconName: 'Refresh' };
  const deleteIcon = { iconName: 'Delete' };


  return (
    <>
      <ActionButton
        iconProps={refreshIconProps}
        text={t("General_Refresh")}
        onClick={() => initializeScreen()}
      />
      {rows !== undefined && rows.length > 0 && (
        <DetailsList
          columns={columns}
          items={rows}
          selectionMode={SelectionMode.none}
          onColumnHeaderClick={handleColumnClick}
          onRenderRow={onRenderRow}
        ></DetailsList>
      )}
    </>
  );
}
