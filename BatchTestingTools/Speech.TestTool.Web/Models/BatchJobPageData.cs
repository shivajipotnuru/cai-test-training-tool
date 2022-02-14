﻿using Speech.TestTool.Web.CrisClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Daimler.Speech.Web.Models
{
    public class BatchJobPageData
    {
        public StorageDetails StorageInfo { get; set; }

        public List<Project> AllProjects { get; set; }

        public List<string> BaseModelsLanguages { get; set; }

        public List<ModelV3> BaseModels { get; set; }

    }
}
