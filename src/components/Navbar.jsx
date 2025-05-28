import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import { FiCode, FiSettings, FiCpu, FiGitBranch } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const { currentModel } = useAI();

  return (
    <header className="bg-surface border-b border-editor-line">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <FiCpu className="mr-2 text-primary text-2xl" />
              <h1 className="text-xl font-bold">AI Code Editor</h1>
            </Link>

            <div className="ml-8 flex space-x-4">
              <NavLink to="/" currentPath={location.pathname} icon={<FiCode />}>
                Editor
              </NavLink>
              <NavLink to="/models" currentPath={location.pathname} icon={<FiGitBranch />}>
                Models
              </NavLink>
              <NavLink to="/settings" currentPath={location.pathname} icon={<FiSettings />}>
                Settings
              </NavLink>
            </div>
          </div>

          <div className="flex items-center">
            {currentModel && (
              <div className="px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                {currentModel.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, currentPath, icon, children }) => {
  const isActive = currentPath === to;
  const baseClasses = "flex items-center px-3 py-2 rounded-md transition-colors";
  const activeClasses = isActive
    ? "bg-primary/10 text-primary font-medium"
    : "text-gray-300 hover:bg-surface/80 hover:text-white";

  return (
    <Link to={to} className={`${baseClasses} ${activeClasses}`}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );
};

export default Navbar;