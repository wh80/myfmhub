import { useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { useImportDataMutation } from "../dataImportsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { useToast } from "../../../hooks/useToast";

const DataImportPage = () => {
  const [selectedDataType, setSelectedDataType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileUploadRef = useRef(null);
  const toast = useToast();

  const [importData, { isLoading, error }] = useImportDataMutation();

  const importDataOptions = [
    { value: "locations", name: "Locations" },
    { value: "assets", name: "Assets" },
    { value: "jobs", name: "Jobs" },
    { value: "jobschedules", name: "Job Schedules" },
    { value: "suppliers", name: "Suppliers" },
    { value: "people", name: "People" },
  ];

  const onSelect = (e) => {
    setSelectedFile(e.files[0]);
  };

  const onClear = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!selectedDataType) {
      toast.error("Please select a data type");
      return;
    }

    try {
      await importData({
        file: selectedFile,
        importType: selectedDataType,
      }).unwrap();
      toast.success("Import successful");
      // Reset form
      setSelectedFile(null);
      setSelectedDataType(null);
      fileUploadRef.current.clear();
    } catch (err) {
      toast.error("Import failed");
      console.error("Import error:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-extrabold mb-4">Data Import</h1>

      <PageLoadingState
        isLoading={isLoading}
        error={error}
        errorMessage={"Error importing data."}
      />

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="dataType" className="block mb-2 font-medium">
            Data Type
          </label>
          <Dropdown
            id="dataType"
            value={selectedDataType}
            options={importDataOptions}
            onChange={(e) => setSelectedDataType(e.value)}
            optionLabel="name"
            optionValue="value"
            placeholder="Select a data type"
            className="w-full"
            showClear
          />
        </div>
        {selectedDataType && (
          <>
            <div className="mb-6">
              <label htmlFor="file" className="block mb-2 font-medium">
                Data File (CSV)
              </label>
              <FileUpload
                ref={fileUploadRef}
                mode="basic"
                accept=".csv"
                maxFileSize={5000000}
                onSelect={onSelect}
                onClear={onClear}
                auto={false}
                chooseLabel="Choose File"
                className="w-full"
              />
            </div>
            {selectedFile && (
              <Button
                type="submit"
                disabled={!selectedFile || !selectedDataType || isLoading}
                label={isLoading ? "Importing..." : "Import Data"}
              />
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default DataImportPage;
