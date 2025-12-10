import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";

import { useGetAssetsForLocationQuery } from "../../locations/locationsApi";

import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";

const LocationAssetsTab = ({ locationId }) => {
  const {
    data: currentAssets,
    error: currentAssetsError,
    isLoading: currentAssetsLoading,
  } = useGetAssetsForLocationQuery(locationId);

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/assets/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const assets = currentAssets;
  const error = currentAssetsError;
  const isLoading = currentAssetsLoading;

  return (
    <>
      <PageLoadingState isLoading={isLoading} error={error} />

      {assets && (
        <DataTable value={assets}>
          <Column field="description" header="Description" />
          <Column
            header="Location"
            body={(rowData) =>
              getMaterialisedPathAsString(rowData.location?.materialisedPath)
            }
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

export default LocationAssetsTab;
