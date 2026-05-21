import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-gray-900 text-lg hover:text-indigo-600 transition-colors">
            <span className="text-2xl">🎫</span>
            <span className="hidden sm:inline">HelpDesk</span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/tickets"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              All Tickets
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              Analytics
            </NavLink>
          </div>

          <Link to="/tickets/new" className="btn-primary">
            <span>+</span>
            <span className="hidden sm:inline">New Ticket</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
