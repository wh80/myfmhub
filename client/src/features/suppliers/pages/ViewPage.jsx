import { useGetSupplierByIdQuery } from "../suppliersApi";
import SupplierOverviewTab from "../components/OverviewTab";
import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { TabView, TabPanel } from "primereact/tabview";

import { useParams } from "react-router-dom";

const SupplierViewPage = () => {
  const { id } = useParams();

  const { data: supplier, error, isLoading } = useGetSupplierByIdQuery(id);

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle title={supplier.description} icon="pi pi-building" />

      <TabView>
        <TabPanel header="Overview">
          <SupplierOverviewTab supplier={supplier} />
        </TabPanel>
      </TabView>
    </>
  );
};

export default SupplierViewPage;
