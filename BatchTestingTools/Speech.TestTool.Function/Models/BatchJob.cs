﻿using Microsoft.WindowsAzure.Storage.Table;
using Speech.TestTool.Function.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Daimler.Speech.Function.Models
{
    public class BatchJob: TableEntity
    {
        public BatchJob()
        {
        }
        public BatchJob(string rowKey)
        {
            this.PartitionKey = "BatchJob";
            this.RowKey = rowKey;
        }
        public string JobName { get; set; }
        public double WER { get; set; }

        public double WRR { get; set; }

        public double SER { get; set; }

        public double LPR { get; set; }

        public string Status { get; set; }

        public string CompletionPercentage { get; set; }

        public int FilesCount { get; set; }

        public string TranscriptFileName { get; set; }

        public string TestResults { get; set; }

        public string SpeechLanguageModelId { get; set; }

        public string SpeechAcousticModelId { get; set; }

        public string SpeechLanguageModelName { get; set; }

        public string SpeechAcousticModelName { get; set; }

        public string LPReferenceFilename { get; set; }
    }
}
