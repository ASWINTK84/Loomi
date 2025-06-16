import React from 'react';
import { Link } from 'react-router-dom'; 

const PageHeader = ({ title, breadcrumbs }) => {
  return (
    <div className="bg-white py-6 shadow-sm"> 
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
          {title}
        </h1>

        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.link ? (
                  <Link to={crumb.link} className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 font-medium">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageHeader;