import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const items = [
    {
      label: "Dashboard",
      icon: "pi pi-th-large",
      command: () => navigate("/dashboard"),
    },
    {
      label: "Locations",
      icon: "pi pi-map-marker",
      command: () => navigate("/locations"),
    },
    {
      label: "Assets",
      icon: "pi pi-box",
      command: () => navigate("/assets"),
    },
    {
      label: "Jobs",
      icon: "pi pi-briefcase",
      command: () => navigate("/jobs"),
    },
    {
      label: "Job Schedules",
      icon: "pi pi-calendar",
      command: () => navigate("/job-schedules"),
    },
    {
      label: "People",
      icon: "pi pi-users",
      command: () => navigate("/people"),
    },
    {
      label: "Suppliers",
      icon: "pi pi-building",
      command: () => navigate("/suppliers"),
    },
    {
      label: "Reports",
      icon: "pi pi-chart-bar",
      command: () => navigate("/reports"),
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => navigate("/settings"),
    },
  ];

  const end = (
    <Button label="Logout" icon="pi pi-sign-out" onClick={handleLogout} text />
  );

  return <Menubar model={items} end={end} className="mb-4" />;
};

export default Navbar;
