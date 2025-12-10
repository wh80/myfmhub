// components/PageLoadingState.jsx
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

export const PageLoadingState = ({
  isLoading,
  error,
  errorMessage,
  minHeight = "400px",
}) => {
  if (isLoading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ minHeight }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Message
          severity="error"
          text={errorMessage || error?.data?.message || "Failed to load data"}
          className="w-full"
        />
      </div>
    );
  }

  return null;
};
