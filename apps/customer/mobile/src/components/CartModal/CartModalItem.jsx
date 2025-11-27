import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency } from '../../shared/formatters';
import { getImageUrl } from '../../shared/imageHelper';

export default function CartModalItem({
    item,
    onUpdateQuantity,
    onRemove,
}) {
    const imageUrl = getImageUrl(item.image);
    // Support multiple ID fields: item_id (API), menu_id, food_id, id
    const itemId = item.item_id || item.menu_id || item.food_id || item.id;

    return (
        <View style={styles.container}>
            {/* Item Image */}
            <Image
                source={{ uri: imageUrl || 'https://via.placeholder.com/60' }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Item Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.price}>
                    {formatCurrency(item.price)}
                </Text>
            </View>

            {/* Qty Control */}
            <View style={styles.qtyControl}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onUpdateQuantity(itemId, item.quantity - 1)}
                >
                    <MaterialIcons name="remove" size={16} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.qty}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onUpdateQuantity(itemId, item.quantity + 1)}
                >
                    <MaterialIcons name="add" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Item Total */}
            <Text style={styles.total}>
                {formatCurrency(item.price * item.quantity)}
            </Text>

            {/* Delete Button */}
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onRemove(itemId)}
            >
                <MaterialIcons name="close" size={18} color="#ff6b35" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    price: {
        fontSize: 13,
        color: '#ff6b35',
        fontWeight: '600',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff6b35',
    },
    qty: {
        width: 30,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    total: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
        minWidth: 70,
        textAlign: 'right',
        marginRight: 8,
    },
    deleteBtn: {
        padding: 8,
    },
});
