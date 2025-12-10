import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "../../hooks/useToast";
import Navbar from "../components/Navbar";
import { useValidateAuthQuery } from "../../features/auth/authApi";
import { setUser, logout } from "../../features/auth/authSlice";

const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const toast = useToast();

  // console.log(`Is Authenticated: ${isAuthenticated}`);

  // Skip validation if already authenticated OR coming from login
  const skipValidation =
    isAuthenticated || (location.state?.fromLogin && isAuthenticated);

  // console.log(`Skip validation: ${skipValidation}`);

  const { data, error, isLoading } = useValidateAuthQuery(undefined, {
    skip: skipValidation,
  });

  useEffect(() => {
    // If already authenticated, no need to do anything
    if (isAuthenticated) return;

    // Wait for validation to complete
    if (isLoading) return;

    // Validation succeeded
    if (data?.user) {
      dispatch(setUser(data.user));
      return;
    }

    // Validation failed - redirect to login
    // Server will return 401 if no valid token on request
    if (error) {
      // console.log("Validation Failed - Logging out");
      // console.log(`Error:`, error);
      toast.error("Authentication expired. Please login to access this page.");
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  }, [data, error, isLoading, isAuthenticated, dispatch, navigate, toast]);

  // Show loading while validating (only if not already authenticated)
  if (isLoading && !isAuthenticated) return <p>Loading...</p>;

  // Show loading if validation succeeded but Redux hasn't updated yet
  if (data?.user && !isAuthenticated) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="px-2">
        <Outlet />
      </div>
    </>
  );
};

export default AuthenticatedLayout;
