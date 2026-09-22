import { Navigate } from "react-router-dom";

export default function CreateCapsule() {
  // Seamlessly redirect to the unified dashboard with the Create tab active
  return <Navigate to="/home?tab=create" replace />;
}
