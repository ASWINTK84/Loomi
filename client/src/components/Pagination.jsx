import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

  
    const numVisiblePages = endPage - startPage + 1;
    if (totalPages > 5 && numVisiblePages < 5) {
      if (currentPage <= 3) { // Near start
        endPage = startPage + 4;
      } else if (currentPage >= totalPages - 2) { // Near end
        startPage = endPage - 4;
      }
    }


    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
        }
    };

    return (
        <nav className="flex justify-center mt-8" aria-label="Pagination">
            <ul className="inline-flex -space-x-px text-base h-10">
                <li>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                </li>
                {startPage > 1 && (
                    <>
                        <li>
                            <button
                                onClick={() => goToPage(1)}
                                className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
                            >
                                1
                            </button>
                        </li>
                        {startPage > 2 && (
                            <li><span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>
                        )}
                    </>
                )}

                {pageNumbers.map(num => (
                    <li key={num}>
                        <button
                            onClick={() => goToPage(num)}
                            className={`flex items-center justify-center px-4 h-10 leading-tight ${
                                num === currentPage
                                    ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            {num}
                        </button>
                    </li>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <li><span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>
                        )}
                        <li>
                            <button
                                onClick={() => goToPage(totalPages)}
                                className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
                            >
                                {totalPages}
                            </button>
                        </li>
                    </>
                )}

                <li>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;