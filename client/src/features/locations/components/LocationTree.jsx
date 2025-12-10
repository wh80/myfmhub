import { Tree } from "primereact/tree";
import { Button } from "primereact/button";

const LocationTree = ({ locations, onLocationView, onLocationAddChild }) => {
  const nodeTemplate = (node) => {
    return (
      <div className="flex align-items-center justify-content-between w-full">
        <span>{node.label}</span>
        <div className="flex gap-2">
          <Button
            icon="pi pi-eye"
            rounded
            text
            size="small"
            severity="info"
            onClick={(e) => {
              e.stopPropagation();
              onLocationView && onLocationView(node.id);
            }}
            tooltip="View Location"
            tooltipOptions={{ position: "top" }}
          />
          <Button
            icon="pi pi-plus"
            rounded
            text
            size="small"
            severity="success"
            onClick={(e) => {
              e.stopPropagation();
              onLocationAddChild && onLocationAddChild(node.id);
            }}
            tooltip="Add Child Location"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>
    );
  };

  return (
    <Tree
      value={locations}
      filter
      filterMode="lenient"
      filterPlaceholder="Search locations..."
      nodeTemplate={nodeTemplate}
      className="w-full"
    />
  );
};

export default LocationTree;
