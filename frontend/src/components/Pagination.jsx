import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, showInfo = true }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = Math.min(maxVisible, totalPages - 1);
            } else if (currentPage >= totalPages - 2) {
                start = Math.max(totalPages - maxVisible + 1, 2);
                end = totalPages - 1;
            }

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container">
            {showInfo && totalItems > 0 && (
                <span className="pagination-info">
                    Showing {startItem}–{endItem} of {totalItems}
                </span>
            )}
            <div className="pagination-controls">
                <button
                    className="pagination-btn pagination-nav"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="First page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    className="pagination-btn pagination-nav"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="pagination-pages">
                    {getPageNumbers().map((page, idx) =>
                        page === '...' ? (
                            <span key={`dots-${idx}`} className="pagination-dots">···</span>
                        ) : (
                            <button
                                key={page}
                                className={`pagination-btn pagination-page ${currentPage === page ? 'active' : ''}`}
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    className="pagination-btn pagination-nav"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Next page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    className="pagination-btn pagination-nav"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Last page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
