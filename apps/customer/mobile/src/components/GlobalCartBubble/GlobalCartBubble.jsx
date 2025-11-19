// import React, { useContext, useMemo } from 'react';
// import {
//     Animated,
//     TouchableOpacity,
//     View,
//     Text,
//     StyleSheet,
// } from 'react-native';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import { CartContext } from '../../contexts/CartContext';

// /**
//  * GlobalCartBubble - Shows global cart (current active restaurant cart)
//  * - Appears on ALL screens (home, restaurant, food detail, etc.)
//  * - Shows total items in GLOBAL cart (not local restaurant cart)
//  * - Clicking navigates to CartScreen
//  * 
//  * Pass animated scale from parent if you want scale animation
//  * Otherwise scale defaults to 1
//  */
// export default function GlobalCartBubble({
//     onPress,
//     animatedScale,
// }) {
//     const { cart, getTotalItems } = useContext(CartContext);

//     // Get total items from global cart
//     const totalItems = useMemo(() => {
//         return getTotalItems?.() || 0;
//     }, [cart, getTotalItems]);

//     // Don't show if no items in global cart
//     if (totalItems <= 0) return null;

//     // Default scale if not provided
//     const scale = animatedScale?.scale || new Animated.Value(1);

//     return (
//         <Animated.View
//             style={[
//                 styles.container,
//                 {
//                     transform: [{ scale }],
//                 },
//             ]}
//         >
//             <TouchableOpacity
//                 style={styles.bubble}
//                 onPress={onPress}
//                 activeOpacity={0.8}
//             >
//                 <View style={styles.iconContainer}>
//                     <MaterialIcons name="shopping-cart" size={20} color="#fff" />

//                     {/* Badge */}
//                     {totalItems > 0 && (
//                         <View style={styles.badge}>
//                             <Text style={styles.badgeText}>
//                                 {totalItems > 99 ? '99+' : totalItems}
//                             </Text>
//                         </View>
//                     )}
//                 </View>
//             </TouchableOpacity>
//         </Animated.View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         position: 'absolute',
//         bottom: 20,
//         right: 20,
//         zIndex: 1000,
//     },
//     bubble: {
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         backgroundColor: '#ff6b35',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     iconContainer: {
//         position: 'relative',
//     },
//     badge: {
//         position: 'absolute',
//         top: -8,
//         right: -8,
//         width: 24,
//         height: 24,
//         borderRadius: 12,
//         backgroundColor: '#d32f2f',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: '#fff',
//     },
//     badgeText: {
//         fontSize: 10,
//         fontWeight: '700',
//         color: '#fff',
//     },
// });
