// hooks/useRestaurantScroll.js - Quản lý scroll & category navigation
import { useState, useRef, useEffect } from 'react';

export const useRestaurantScroll = (categories, allFoods, highlightedFoodId) => {
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const sectionListRef = useRef(null);
    const sectionIndexMap = useRef({});

    // Build section index map
    useEffect(() => {
        categories.forEach((category, index) => {
            sectionIndexMap.current[category.id] = index;
        });
    }, [categories]);

    // Auto-scroll to highlighted food
    useEffect(() => {
        if (highlightedFoodId && sectionListRef.current && allFoods.length > 0) {
            const foodIndex = allFoods.findIndex((f) => f.id === highlightedFoodId);
            if (foodIndex >= 0) {
                const food = allFoods[foodIndex];
                const categoryIndex = categories.findIndex((c) => c.id === food.categoryId);
                if (categoryIndex >= 0) {
                    setTimeout(() => {
                        sectionListRef.current?.scrollToLocation({
                            sectionIndex: categoryIndex,
                            itemIndex: allFoods.filter((f) => f.categoryId === food.categoryId).indexOf(food),
                            animated: true,
                        });
                    }, 300);
                }
            }
        }
    }, [highlightedFoodId, allFoods, categories]);

    const handleScrollToCategory = (categoryId) => {
        console.log('[useRestaurantScroll] Scrolling to category:', categoryId);

        // Update current category immediately for UI feedback
        setCurrentCategoryId(categoryId);

        const sectionIndex = sectionIndexMap.current[categoryId];
        console.log('[useRestaurantScroll] Section index:', sectionIndex);

        if (sectionIndex !== undefined && sectionListRef.current) {
            // Use setTimeout to ensure SectionList is ready
            setTimeout(() => {
                try {
                    // Scroll so that section header appears right below the sticky category filter
                    // viewOffset should account for:
                    // - Header height (~200-280px)
                    // - Search bar (~50px)
                    // - Category filter (~50px)
                    sectionListRef.current?.scrollToLocation({
                        sectionIndex,
                        itemIndex: 0,
                        animated: true,
                        viewPosition: 0, // Position at top
                        viewOffset: -350, // Negative offset to show section header below sticky filter
                    });
                    console.log('[useRestaurantScroll] Scroll executed to section:', sectionIndex);
                } catch (error) {
                    console.error('[useRestaurantScroll] Scroll error:', error);
                }
            }, 100);
        } else {
            console.warn('[useRestaurantScroll] Cannot scroll - ref or index missing', {
                sectionIndex,
                hasRef: !!sectionListRef.current
            });
        }
    };

    const handleViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const firstViewable = viewableItems[0];
            if (firstViewable.section?.categoryId) {
                setCurrentCategoryId(firstViewable.section.categoryId);
            }
        }
    });

    const handleScroll = (event) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        const STICKY_THRESHOLD = 280;
        setShowStickyHeader(scrollY > STICKY_THRESHOLD);
    };

    return {
        currentCategoryId,
        showStickyHeader,
        sectionListRef,
        handleScrollToCategory,
        handleViewableItemsChanged,
        handleScroll,
    };
};
