import { StyleSheet, Easing } from 'react-native';

export const styles = StyleSheet.create({
    // Overlay - semi-transparent dark background
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    // Drawer main container
    drawerContainer: {
        position: 'absolute',
        paddingTop: 40,
        top: 0,
        left: 0,
        bottom: 0,
        width: '70%',
        backgroundColor: '#fff',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 5, height: 0 },
    },

    // Header section
    drawerHeader: {
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    drawerHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    drawerHeaderIcon: {
        marginRight: 12,
    },

    drawerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },

    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Menu items container
    menuItemsContainer: {
        paddingVertical: 12,
    },

    // Single menu item
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },

    menuItemIcon: {
        marginRight: 16,
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },

    menuItemLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },

    // Divider between menu sections
    menuDivider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
        marginHorizontal: 12,
    },
});

export const animationConfig = {
    duration: 300,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
};
