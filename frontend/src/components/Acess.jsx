import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Access() {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.role === "admin") {
      navigate("/admindb");
    }
  }, [navigate]);

  const handleGoBack = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/");
      return;
    }

    switch (userData.role) {
      case "student":
        navigate("/studentdb");
        break;
      case "parent":
        navigate("/guardiandb");
        break;
      case "teacher":
        navigate("/teacherdb");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page. You're not authorized to access this content.
        </p>
        <button
          onClick={handleGoBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Access;