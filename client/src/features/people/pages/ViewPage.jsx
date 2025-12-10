import { useGetPersonByIdQuery } from "../peopleApi";

import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { TabView, TabPanel } from "primereact/tabview";
import PersonJobsTab from "../components/PersonJobsTab";
import { useParams } from "react-router-dom";
import PersonOverviewTab from "../components/OverviewTab";

const PersonViewPage = () => {
  const { id } = useParams();

  const { data: person, error, isLoading } = useGetPersonByIdQuery(id);

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle
        title={`${person.user.firstName} ${person.user.lastName}`}
        icon="pi pi-users"
      />

      <TabView>
        <TabPanel header="Overview">
          <PersonOverviewTab person={person} />
        </TabPanel>

        <TabPanel header="Jobs">
          <PersonJobsTab personId={person.id} />
        </TabPanel>
      </TabView>
    </>
  );
};

export default PersonViewPage;
