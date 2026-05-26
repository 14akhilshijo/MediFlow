import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-8xl font-bold text-primary-200">404</h1>
    <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
    <p className="text-gray-500 mt-2 mb-8">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
