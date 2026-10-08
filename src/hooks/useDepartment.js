import { useSelector } from 'react-redux';

/**
 * Custom hook to access the current user's department information
 * Useful for stakeholder users who need to auto-fill department data
 */
export const useDepartment = () => {
    const user = useSelector((state) => state.auth.user);

    return {
        departmentId: user?.department?.id || null,
        departmentName: user?.department?.name || null,
        department: user?.department || null,
        isStakeholder: user?.role_id === "8",
        isNitda: user?.role_id !== "8", // Any non-stakeholder is NITDA
        userId: user?.id || null,
        userName: user?.name || null,
    };
};
