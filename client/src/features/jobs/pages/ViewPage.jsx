import { useGetJobByIdQuery } from "../jobsApi";
import JobOverviewTab from "../components/OverviewTab";
import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { TabView, TabPanel } from "primereact/tabview";
import { useParams } from "react-router-dom";
import JobAssetsTab from "../components/JobAssetsTab";

const JobViewPage = () => {
  const { id } = useParams();

  const { data: job, error, isLoading } = useGetJobByIdQuery(id);

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle title={job.summary} icon="pi pi-briefcase" />

      <TabView>
        <TabPanel header="Overview">
          <JobOverviewTab job={job} />
        </TabPanel>

        <TabPanel header="Assets">
          <JobAssetsTab jobId={job.id} />
        </TabPanel>
      </TabView>
    </>
  );
};

export default JobViewPage;
