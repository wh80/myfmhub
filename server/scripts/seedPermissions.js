import prisma from "../config/prisma";
const SYSTEM_PERMISSIONS = [
  // Jobs
  {
    code: "canAccessJobsModule",
    name: "Access Jobs Module",
    description: "Can access jobs module",
    category: "jobs",
  },
  {
    code: "canCreateJob",
    name: "Create Jobs",
    description: "Can create new jobs",
    category: "jobs",
  },
  {
    code: "canEditJob",
    name: "Edit Jobs",
    description: "Can edit existing jobs",
    category: "jobs",
  },
  {
    code: "canDeleteJob",
    name: "Delete Jobs",
    description: "Can delete jobs",
    category: "jobs",
  },
  {
    code: "canViewJob",
    name: "View Jobs",
    description: "Can view job detail",
    category: "jobs",
  },

  // Assets
  {
    code: "canAccessAssetsModule",
    name: "Access Assets Module",
    description: "Can access assets module",
    category: "assets",
  },
  {
    code: "canCreateAsset",
    name: "Create Assets",
    description: "Can create new assets",
    category: "assets",
  },
  {
    code: "canEditAsset",
    name: "Edit Assets",
    description: "Can edit existing assets",
    category: "assets",
  },
  {
    code: "canDeleteAsset",
    name: "Delete Assets",
    description: "Can delete assets",
    category: "assets",
  },
  {
    code: "canViewAsset",
    name: "View Assets",
    description: "Can view asset detail",
    category: "assets",
  },
  // Job Schedules
  {
    code: "canAccessJobSchedulesModule",
    name: "Access Job Schedules Module",
    description: "Can access job schedules module",
    category: "job schedules",
  },

  {
    code: "canCreateJobSchedule",
    name: "Create JobSchedules",
    description: "Can create new job schedules",
    category: "job schedules",
  },
  {
    code: "canEditJobSchedule",
    name: "Edit JobSchedules",
    description: "Can edit existing job schedules",
    category: "job schedules",
  },
  {
    code: "canDeleteJobSchedule",
    name: "Delete JobSchedules",
    description: "Can delete job schedules",
    category: "job schedules",
  },
  {
    code: "canViewJobSchedule",
    name: "View JobSchedules",
    description: "Can view job schedule detail",
    category: "job schedules",
  },
  // Locations
  {
    code: "canAccessLocationsModule",
    name: "Access Locations Module",
    description: "Can access locations module",
    category: "locations",
  },
  {
    code: "canCreateLocation",
    name: "Create Locations",
    description: "Can create new locations",
    category: "locations",
  },
  {
    code: "canEditLocation",
    name: "Edit Locations",
    description: "Can edit existing locations",
    category: "locations",
  },
  {
    code: "canDeleteLocation",
    name: "Delete Locations",
    description: "Can delete locations",
    category: "locations",
  },
  {
    code: "canViewLocation",
    name: "View Locations",
    description: "Can view location detail",
    category: "locations",
  },

  // Suppliers
  {
    code: "canAccessSuppliersModule",
    name: "Access Suppliers Module",
    description: "Can access suppliers module",
    category: "suppliers",
  },
  {
    code: "canCreateSupplier",
    name: "Create Suppliers",
    description: "Can create new suppliers",
    category: "suppliers",
  },
  {
    code: "canEditSupplier",
    name: "Edit Suppliers",
    description: "Can edit existing suppliers",
    category: "suppliers",
  },
  {
    code: "canDeleteSupplier",
    name: "Delete Suppliers",
    description: "Can delete suppliers",
    category: "suppliers",
  },
  {
    code: "canViewSupplier",
    name: "View Suppliers",
    description: "Can view supplier detail",
    category: "suppliers",
  },

  // People
  {
    code: "canAccessPeopleModule",
    name: "Access People Module",
    description: "Can access people module",
    category: "people",
  },
  {
    code: "canCreatePerson",
    name: "Create People",
    description: "Can create new people",
    category: "people",
  },
  {
    code: "canEditPerson",
    name: "Edit People",
    description: "Can edit existing people",
    category: "people",
  },
  {
    code: "canDeletePerson",
    name: "Delete People",
    description: "Can delete people",
    category: "people",
  },
  {
    code: "canViewPerson",
    name: "View People",
    description: "Can view person detail",
    category: "people",
  },

  // Files
  {
    code: "canAccessFilesModule",
    name: "Access Files Module",
    description: "Can access files module",
    category: "files",
  },
  {
    code: "canCreateFile",
    name: "Create File",
    description: "Can create new files",
    category: "files",
  },
  {
    code: "canEditFile",
    name: "Edit Files",
    description: "Can edit existing files",
    category: "files",
  },
  {
    code: "canDeleteFile",
    name: "Delete File",
    description: "Can delete files",
    category: "files",
  },
  {
    code: "canViewFiles",
    name: "View Files",
    description: "Can view file detail",
    category: "files",
  },

  // Account Settings - keep name
  {
    code: "canAccessAccountSettings",
    name: "Account Settings",
    description: "Can access account settings",
    category: "settings",
  },
  {
    code: "canAccessDataCategories",
    name: "Data Categories",
    description: "Can access data categories",
    category: "settings",
  },

  {
    code: "canAccessUserPermissions",
    name: "User Permissions",
    description: "Can access user permissions",
    category: "settings",
  },

  {
    code: "canImportData",
    name: "Import Data",
    description: "Can import data",
    category: "settings",
  },
  {
    code: "canCreateCategory",
    name: "Create Categories",
    description: "Can create new categories",
    category: "settings",
  },
  {
    code: "canEditCategory",
    name: "Edit Categories",
    description: "Can edit existing categories",
    category: "settings",
  },
  {
    code: "canDeleteCategory",
    name: "Delete Categories",
    description: "Can delete categoies",
    category: "settings",
  },
];

async function main() {
  console.log("Seeding permissions...");

  for (const permission of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission,
    });
  }

  console.log("Permissions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
