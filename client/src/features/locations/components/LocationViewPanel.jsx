import { useGetLocationByIdQuery } from "../locationsApi";
import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { TabView, TabPanel } from "primereact/tabview";
import LocationOverviewTab from "./LocationOverviewTab";
import LocationAssetsTab from "./LocationAssetsTab";
import LocationJobsTab from "./LocationJobsTab";
import LocationJobSchedulesTab from "./LocationJobSchedulesTab";
import LocationPeopleTab from "./LocationPeopleTab";

const LocationViewPanel = ({ locationId }) => {
  const {
    data: location,
    error,
    isLoading,
  } = useGetLocationByIdQuery(locationId);

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle title={location.description} icon="pi pi-map-marker" />

      <TabView>
        <TabPanel header="Overview">
          <LocationOverviewTab location={location} />
        </TabPanel>

        <TabPanel header="Assets">
          <LocationAssetsTab locationId={location.id} />
        </TabPanel>

        <TabPanel header="Jobs">
          <LocationJobsTab locationId={location.id} />
        </TabPanel>

        <TabPanel header="Job Schedules">
          <LocationJobSchedulesTab locationId={location.id} />
        </TabPanel>

        <TabPanel header="People">
          <LocationPeopleTab locationId={location.id} />
        </TabPanel>
      </TabView>
    </>
  );
};

export default LocationViewPanel;
