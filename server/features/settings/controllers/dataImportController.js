import {
  validHeaders as locationHeaders,
  importLocationData,
} from "../../locations/locationImportService.js";

import {
  validHeaders as assetHeaders,
  importAssetData,
} from "../../assets/assetImportService.js";

import {
  validHeaders as supplierHeaders,
  importSupplierData,
} from "../../suppliers/supplierImportService.js";

import {
  validHeaders as jobHeaders,
  importJobData,
} from "../../jobs/jobImportService.js";

import {
  validHeaders as jobScheduleHeaders,
  importJobScheduleData,
} from "../../jobSchedules/jobScheduleImportService.js";

// Setup import services for header validation and import function mapping

const IMPORT_SERVICES = {
  locations: {
    validHeaders: locationHeaders,
    importData: importLocationData,
  },

  assets: {
    validHeaders: assetHeaders,
    importData: importAssetData,
  },

  suppliers: {
    validHeaders: supplierHeaders,
    importData: importSupplierData,
  },

  suppliers: {
    validHeaders: jobHeaders,
    importData: importJobData,
  },

  jobSchedules: {
    validHeaders: jobScheduleHeaders,
    importData: importJobScheduleData,
  },
};

export async function importData(req, res) {
  try {
    const file = req.file;
    const dataType = req.body.importType;
    const accountId = req.user.accountId;

    // Convert buffer to text
    const text = file.buffer.toString("utf-8");

    const [headerLine] = text.split("\n");
    const headers = headerLine.split(",").map((h) => h.trim());

    const service = IMPORT_SERVICES[dataType];

    if (!service) {
      return res
        .status(400)
        .json({ message: `Invalid data type: ${dataType}` });
    }

    const invalidHeaders = headers.filter(
      (h) => !service.validHeaders.includes(h)
    );
    if (invalidHeaders.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid Headers", invalidHeaders });
    }

    console.log("calling process func");

    const { importErrors, importCount } = await service.importData(
      text,
      accountId
    );

    console.log(importErrors, importCount);

    return res.status(200).json({
      importErrors,
      importCount,
    });
  } catch (error) {
    console.error("Import error:", error);
    return res.status(500).json({
      message: "Import failed",
      error: error.message,
    });
  }
}
