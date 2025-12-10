import { useGetAssetByIdQuery } from "../assetsApi";
import AssetOverviewTab from "../components/OverviewTab";
import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { TabView, TabPanel } from "primereact/tabview";
import AssetJobSchedulesTab from "../components/AssetJobSchedulesTab";
import AssetJobsTab from "../components/AssetJobsTab";

import { useParams } from "react-router-dom";

const AssetViewPage = () => {
  const { id } = useParams();

  const { data: asset, error, isLoading } = useGetAssetByIdQuery(id);

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle title={asset.description} icon="pi pi-box" />

      <TabView>
        <TabPanel header="Overview">
          <AssetOverviewTab asset={asset} />
        </TabPanel>

        <TabPanel header="Jobs">
          <AssetJobsTab assetId={asset.id} />
        </TabPanel>

        <TabPanel header="Job Schedules">
          <AssetJobSchedulesTab assetId={asset.id} />
        </TabPanel>
      </TabView>
    </>
  );
};

export default AssetViewPage;
