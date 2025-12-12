import { useState } from "react";
import { Panel } from "primereact/panel";
import PageTitle from "../../../shared/components/PageTitle";
import LocationCreateModal from "../components/LocationCreateModal";
import LocationTree from "../components/LocationTree";
import LocationViewPanel from "../components/LocationViewPanel";
import { useGetAllLocationsQuery } from "../locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";

const LocationsIndexPage = () => {
  const { data: locations, error, isLoading } = useGetAllLocationsQuery();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [parentLocationId, setParentLocationId] = useState(null);

  const handleViewLocation = (locationId) => {
    // Toggle: if clicking the same location, close the panel
    if (selectedLocationId === locationId) {
      setSelectedLocationId(null);
    } else {
      setSelectedLocationId(locationId);
    }
  };

  const handleAddChild = (parentId) => {
    setParentLocationId(parentId);
    setShowCreateModal(true);
    // Close view panel when creating a new location
    setSelectedLocationId(null);
  };

  return (
    <>
      <PageTitle title="Locations" icon="pi pi-map-marker" />

      <PageLoadingState isLoading={isLoading} error={error} />

      {showCreateModal && (
        <LocationCreateModal
          showModal={showCreateModal}
          closeModal={() => {
            setShowCreateModal(false);
            setParentLocationId(null);
          }}
          parentId={parentLocationId}
        />
      )}

      {locations && (
        <div className="grid">
          <div className="col-12 lg:col-3">
            {/* Collapsible on mobile, always expanded on desktop */}
            <Panel
              header="Location Tree"
              toggleable
              className="lg:hidden"
              collapsed={selectedLocationId !== null}
            >
              <LocationTree
                locations={locations}
                onLocationView={handleViewLocation}
                onLocationAddChild={handleAddChild}
              />
            </Panel>

            {/* Always visible on desktop (no Panel wrapper) */}
            <div className="hidden lg:block">
              <LocationTree
                locations={locations}
                onLocationView={handleViewLocation}
                onLocationAddChild={handleAddChild}
              />
            </div>
          </div>

          {selectedLocationId && (
            <div className="col-12 lg:col-9">
              <LocationViewPanel
                locationId={selectedLocationId}
                closeViewPanel={() => setSelectedLocationId(null)}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LocationsIndexPage;
