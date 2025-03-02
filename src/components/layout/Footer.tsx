
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t py-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-semibold text-lg mb-3">About Us</h3>
            <p className="text-sm text-gray-600">
              Helping individuals and organizations understand and elevate their moral development through scientific assessment and AI-powered analysis.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              </li>
              <li>
                <Link to="/assessment" className="text-gray-600 hover:text-gray-900">Assessment</Link>
              </li>
              <li>
                <Link to="/book" className="text-gray-600 hover:text-gray-900">Book</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms-of-service" className="text-gray-600 hover:text-gray-900">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Contact</h3>
            <p className="text-sm text-gray-600">
              Have questions? Reach out to us at <a href="mailto:info@moralhierarchy.com" className="text-blue-600 hover:underline">info@moralhierarchy.com</a>
            </p>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} The Moral Hierarchy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
