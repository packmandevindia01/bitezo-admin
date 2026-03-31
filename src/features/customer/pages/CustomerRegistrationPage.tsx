import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common";
import CustomerForm from "../components/CustomerForm";

const CustomerRegistrationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">

      <div className="w-full max-w-6xl bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-md">
        <div className="mb-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/customers")}
          >
            Back
          </Button>
        </div>

        <h1 className="text-center text-xl sm:text-2xl font-bold mb-6 md:mb-8">
          CUSTOMER REGISTRATION
        </h1>

        <CustomerForm />

      </div>
    </div>
  );
};

export default CustomerRegistrationPage;
