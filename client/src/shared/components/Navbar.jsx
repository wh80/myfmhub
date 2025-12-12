import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuRef = useRef(null);

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

  const userMenuItems = [
    {
      label: "My Profile",
      icon: "pi pi-user",
      command: () => navigate("/profile"),
    },
    {
      label: "Update Password",
      icon: "pi pi-key",
      command: () => navigate("/update-password"),
    },
    {
      separator: true,
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: handleLogout,
    },
  ];

  const end = (
    <>
      <Menu model={userMenuItems} popup ref={menuRef} />
      <Button
        icon="pi pi-user"
        rounded
        text
        severity="secondary"
        onClick={(e) => menuRef.current.toggle(e)}
        aria-label="User menu"
      />
    </>
  );

  return <Menubar model={items} end={end} className="mb-4" />;
};

export default Navbar;
