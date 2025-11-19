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
        const sectionIndex = sectionIndexMap.current[categoryId];
        if (sectionIndex !== undefined && sectionListRef.current) {
            sectionListRef.current.scrollToLocation({
                sectionIndex,
                itemIndex: 0,
                animated: true,
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
