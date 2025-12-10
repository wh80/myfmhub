import { useGetJobScheduleByIdQuery } from "../jobSchedulesApi";
import JobScheduleOverviewTab from "../components/OverviewTab";
import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { TabView, TabPanel } from "primereact/tabview";
import JobScheduleAssetsTab from "../components/JobScheduleAssetsTab";
import JobScheduleJobsTab from "../components/JobScheduleJobsTab";

import { useParams } from "react-router-dom";

const JobScheduleViewPage = () => {
  const { id } = useParams();

  const { data: schedule, error, isLoading } = useGetJobScheduleByIdQuery(id);

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle title={schedule.summary} icon="pi pi-calendar" />

      <TabView>
        <TabPanel header="Overview">
          <JobScheduleOverviewTab schedule={schedule} />
        </TabPanel>

        <TabPanel header="Assets">
          <JobScheduleAssetsTab scheduleId={schedule.id} />
        </TabPanel>

        <TabPanel header="Jobs">
          <JobScheduleJobsTab scheduleId={schedule.id} />
        </TabPanel>
      </TabView>
    </>
  );
};

export default JobScheduleViewPage;
