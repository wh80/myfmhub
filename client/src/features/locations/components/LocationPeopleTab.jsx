import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";

import { useGetPeopleForLocationQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";

const LocationPeopleTab = ({ locationId }) => {
  // Load related assets queries for relevant resource
  const {
    data: locationPeople,
    error: locError,
    isLoading: locLoading,
  } = useGetPeopleForLocationQuery(locationId, { skip: !locationId });

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/jobs/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const people = locationPeople;
  const error = locError;
  const isLoading = locLoading;

  return (
    <>
      <PageLoadingState isLoading={isLoading} error={error} />

      {people && (
        <DataTable value={people}>
          <Column field="user.firstName" header="First Name" />
          <Column field="user.lastName" header="Last Name" />

          <Column
            header="Location"
            body={(rowData) =>
              getMaterialisedPathAsString(rowData.location?.materialisedPath)
            }
          />

          <Column field="user.email" header="Email" />

          <Column field="user.jobTitle" header="Job Title" />
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

export default LocationPeopleTab;
