import prisma from "../config/dbConnection.js";

/**
 * Need the longer names (i.e. personCategory) as these are used in the data import select input UI
 * Can't just use 'person' there as that will clash for actual person upload
 */
//

// Used in categories controller to sethe model based on the assetType
export function setPrismaModel(categoryType) {
  const modelMap = {
    location: prisma.locationCategory,
    job: prisma.jobCategory,
    asset: prisma.assetCategory,
    assetCondition: prisma.assetConditionCategory,
    file: prisma.fileCategory,
    supplier: prisma.supplierCategory,
    jobSchedule: prisma.jobScheduleCategory,

    locationAlert: prisma.locationAlertCategory,
  };

  return modelMap[categoryType];
}
