import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * CategoryFilterV2 - Shopee style
 * - Sticky horizontal category list at top
 * - Filter button to show all categories in modal
 * - Current category highlighted
 * - Click category → scroll to section (not filter)
 */
export default function CategoryFilter({
    categories = [],
    currentCategoryId,
    onSelectCategory,
}) {
    const [showModal, setShowModal] = useState(false);
    const listRef = useRef(null);

    const handleSelectCategory = (categoryId) => {
        console.log('[CategoryFilter] Category selected:', categoryId);
        onSelectCategory(categoryId);
        setShowModal(false);
    };

    const renderCategoryItem = ({ item }) => {
        const isActive = currentCategoryId === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                ]}
                onPress={() => handleSelectCategory(item.id)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.categoryChipText,
                        isActive && styles.categoryChipTextActive,
                    ]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderModalCategory = ({ item }) => {
        const isActive = currentCategoryId === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.modalCategory,
                    isActive && styles.modalCategoryActive,
                ]}
                onPress={() => handleSelectCategory(item.id)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.modalCategoryText,
                        isActive && styles.modalCategoryTextActive,
                    ]}
                >
                    {item.name}
                </Text>
                {isActive && (
                    <MaterialIcons name="check" size={20} color="#ff6b35" />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <>
            {/* Sticky Horizontal Category List */}
            <View style={styles.container}>
                {/* Filter Button (Left) */}
                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => setShowModal(true)}
                    activeOpacity={0.6}
                >
                    <MaterialIcons name="filter-list" size={20} color="#ff6b35" />
                </TouchableOpacity>

                {/* Horizontal Categories (Scrollable) */}
                <FlatList
                    ref={listRef}
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={categories.length > 4}
                    nestedScrollEnabled={true}
                    style={{ flex: 1 }}
                />
            </View>

            {/* Modal - All Categories (Bottom Sheet Style) */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Backdrop */}
                    <TouchableOpacity
                        style={styles.backdrop}
                        onPress={() => setShowModal(false)}
                        activeOpacity={1}
                    />

                    {/* Bottom Sheet */}
                    <View style={styles.bottomSheet}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh mục</Text>
                            <TouchableOpacity
                                onPress={() => setShowModal(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MaterialIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Categories List */}
                        <FlatList
                            data={categories}
                            renderItem={renderModalCategory}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled
                            style={styles.modalList}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#eee',
    },
    listContent: {
        paddingHorizontal: 8,
        gap: 6,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 32,
        justifyContent: 'center',
    },
    categoryChipActive: {
        backgroundColor: '#ffe8dd',
        borderColor: '#ff6b35',
    },
    categoryChipText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        maxWidth: 100,
    },
    categoryChipTextActive: {
        color: '#ff6b35',
        fontWeight: '700',
    },
    // Modal Styles - Bottom Sheet
    modalContainer: {
        flex: 1,
        flexDirection: 'column-reverse',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    modalList: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalCategory: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    modalCategoryActive: {
        backgroundColor: '#fffbf9',
    },
    modalCategoryText: {
        fontSize: 14,
        color: '#666',
    },
    modalCategoryTextActive: {
        color: '#ff6b35',
        fontWeight: '700',
    },
});
