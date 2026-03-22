import { useEffect } from 'react';

/**
 * Locks body scroll when active (e.g., when a modal is open).
 * Restores the original overflow on cleanup.
 * @param {boolean} isLocked - Whether to lock body scrolling.
 */
const useBodyScrollLock = (isLocked) => {
    useEffect(() => {
        if (!isLocked) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isLocked]);
};

export default useBodyScrollLock;
