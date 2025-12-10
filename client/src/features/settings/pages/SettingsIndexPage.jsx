import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const SettingsIndexPage = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "User Groups",
      description: "Manage user groups and assign permissions",
      icon: "pi pi-users",
      path: "/settings/user-groups",
    },
    {
      title: "Account Management",
      description: "Manage account settings and billing",
      icon: "pi pi-building",
      path: "/settings/account",
    },
    {
      title: "Data Categories",
      description: "Create and manage data categorization",
      icon: "pi pi-tags",
      path: "/settings/data-categories",
    },
    {
      title: "Data Import",
      description: "Import data from external sources",
      icon: "pi pi-upload",
      path: "/settings/data-import",
    },
  ];

  return (
    <div className="p-4">
      <h1>Settings</h1>
      <p className="text-color-secondary mb-4">
        Manage system configuration and preferences
      </p>

      <div className="grid">
        {settingsSections.map((section) => (
          <div key={section.path} className="col-12 md:col-6 lg:col-4">
            <Card className="h-full">
              <div className="flex flex-column gap-3">
                <div className="flex align-items-center gap-3">
                  <i
                    className={section.icon}
                    style={{ fontSize: "2rem", color: "var(--primary-color)" }}
                  />
                  <h3 className="m-0">{section.title}</h3>
                </div>
                <p className="text-color-secondary m-0">
                  {section.description}
                </p>
                <Button
                  label="Manage"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  onClick={() => navigate(section.path)}
                  className="align-self-start"
                />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsIndexPage;
