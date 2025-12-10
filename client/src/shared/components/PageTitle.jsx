import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const PageTitle = ({
  title,
  subtitle,
  icon,
  onCreateClick,
  createUrl,
  createLabel = "Create",
}) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    if (onCreateClick) {
      onCreateClick();
    } else if (createUrl) {
      navigate(createUrl);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="flex align-items-center gap-3">
          {icon && <i className={`${icon} text-4xl text-primary`}></i>}
          <div>
            <h1 className="text-4xl font-bold text-800 m-0">{title}</h1>
            {subtitle && (
              <p className="text-lg text-600 mt-1 mb-0">{subtitle}</p>
            )}
          </div>
        </div>

        {(createUrl || onCreateClick) && (
          <Button
            label={createLabel}
            icon="pi pi-plus"
            onClick={handleCreate}
            severity="success"
          />
        )}
      </div>
    </div>
  );
};

export default PageTitle;
