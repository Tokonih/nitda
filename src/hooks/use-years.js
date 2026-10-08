import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchYears } from "@/Slices/yearSlice";

export const useYears = () => {
    const dispatch = useDispatch();
    const { list: years, loading, error } = useSelector((state) => state.years);

    useEffect(() => {
        // Only fetch if we don't have enough years and no request is in flight
        if (years.length === 0 && !loading) {
            dispatch(fetchYears({ per_page: 20, all: true, is_active: true }));
        }
    }, [dispatch, years.length, loading]);

    // Sort years descending or ascending? Usually descending for recent years first.
    const sortedYears = [...years].sort((a, b) => b.year - a.year);

    return {
        years: sortedYears,
        loading,
        error,
    };
};
