import { getAllAncestorLocations } from "./locationUtils.js";

export async function getLocationAlertsForJob(locationId, prisma) {
  console.log(locationId);
  // Get ancestors of the job location
  const ancestors = await getAllAncestorLocations(locationId, prisma);

  // Collect all location IDs: the job's location + ancestor locations
  const locationIds = [locationId, ...ancestors.map((loc) => loc.id)];

  // Load any locationAlerts related to job's location or ancestreal locations
  const locationAlerts = await prisma.locationAlert.findMany({
    where: {
      locationId: { in: locationIds },
    },
    include: {
      locationAlertCategory: true,
    },
  });

  return locationAlerts;
}
