import { useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../../shared/components/PageTitle";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useGetAllAssetsQuery } from "../assetsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import AssetCreateModal from "../components/CreateModal";
import { getMaterialisedPathAsString } from "../../../utils";

const AssetsIndexPage = () => {
  const { data: assets, error, isLoading } = useGetAllAssetsQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log(assets);

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/assets/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  return (
    <>
      <PageTitle
        title="Assets"
        icon="pi pi-box"
        onCreateClick={() => {
          setShowCreateModal(true);
        }}
      />

      <PageLoadingState isLoading={isLoading} error={error} />

      {showCreateModal && (
        <AssetCreateModal
          showModal={showCreateModal}
          closeModal={() => {
            setShowCreateModal(false);
          }}
        />
      )}

      {assets && (
        <DataTable value={assets}>
          <Column field="description" header="Description" />
          <Column
            header="Location"
            body={(rowData) =>
              getMaterialisedPathAsString(rowData.location?.materialisedPath)
            }
          />
          <Column
            header="Category"
            body={(rowData) => rowData.category?.description}
          />
          <Column field="assetNumber" header="Asset Number" />
          <Column field="serialNumber" header="Serial Number" />
          <Column field="make" header="Make" />
          <Column field="model" header="Model" />

          <Column
            header="Actions"
            body={actionsBodyTemplate}
            style={{ width: "5rem" }}
          />
        </DataTable>
      )}
    </>
  );
};

export default AssetsIndexPage;
