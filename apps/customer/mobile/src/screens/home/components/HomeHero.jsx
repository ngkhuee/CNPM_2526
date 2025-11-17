import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function HomeHero({ onExplorePress }) {
    return (
        <ImageBackground
            source={require('../../../../assets/banner.png')}
            style={styles.banner}
            imageStyle={styles.bannerImage}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>Order your favourite food here</Text>
                    <Text style={styles.subtitle}>
                        Choose from a diverse menu featuring delectable dishes crafted with the finest ingredients
                    </Text>

                    {/* <TouchableOpacity style={styles.btn} onPress={onExplorePress}>
                        <MaterialIcons name="search" size={18} color="#ff6b35" />
                        <Text style={styles.btnText}>View Menu</Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    banner: {
        minHeight: 220,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 3,
    },
    bannerImage: {
        borderRadius: 12,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        marginBottom: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
        lineHeight: 18,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 8,
    },
    btnText: {
        color: '#ff6b35',
        fontWeight: '600',
        fontSize: 14,
    },
});
