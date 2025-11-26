import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DatePickerModal({
    visible,
    selectedDate,
    onDateChange,
    onConfirm,
    onCancel,
}) {
    const [year, setYear] = useState(selectedDate.getFullYear());
    const [month, setMonth] = useState(selectedDate.getMonth());
    const [day, setDay] = useState(selectedDate.getDate());

    useEffect(() => {
        setYear(selectedDate.getFullYear());
        setMonth(selectedDate.getMonth());
        setDay(selectedDate.getDate());
    }, [selectedDate, visible]);

    const months = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const getDaysInMonth = (m, y) => {
        return new Date(y, m + 1, 0).getDate();
    };

    const maxDay = getDaysInMonth(month, year);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();

    // Check if date is in future
    const isFutureDate = () => {
        if (year > currentYear) return true;
        if (year === currentYear && month > currentMonth) return true;
        if (year === currentYear && month === currentMonth && day > currentDay) return true;
        return false;
    };

    const handleConfirm = () => {
        const newDate = new Date(year, month, day);
        if (!isFutureDate()) {
            onConfirm(newDate);
        }
    };

    const years = Array.from({ length: 100 }, (_, i) => currentYear - 100 + i);
    const days = Array.from({ length: maxDay }, (_, i) => i + 1);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={styles.cancelBtn}>Hủy</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Chọn ngày sinh</Text>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={isFutureDate()}
                        >
                            <Text style={[
                                styles.confirmBtn,
                                isFutureDate() && styles.confirmBtnDisabled
                            ]}>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Display */}
                    <View style={styles.dateDisplay}>
                        <Text style={styles.dateDisplayText}>
                            {months[month]} {day}, {year}
                        </Text>
                    </View>

                    {/* Pickers */}
                    <View style={styles.pickerContainer}>
                        {/* Month */}
                        <View style={styles.pickerColumn}>
                            <Text style={styles.columnLabel}>Tháng</Text>
                            <ScrollView
                                style={styles.picker}
                                showsVerticalScrollIndicator={true}
                            >
                                {months.map((m, index) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.pickerItem,
                                            index === month && styles.pickerItemSelected
                                        ]}
                                        onPress={() => setMonth(index)}
                                    >
                                        <Text style={[
                                            styles.pickerItemText,
                                            index === month && styles.pickerItemTextSelected
                                        ]}>
                                            {m.slice(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Day */}
                        <View style={styles.pickerColumn}>
                            <Text style={styles.columnLabel}>Ngày</Text>
                            <ScrollView
                                style={styles.picker}
                                showsVerticalScrollIndicator={true}
                            >
                                {days.map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        style={[
                                            styles.pickerItem,
                                            d === day && styles.pickerItemSelected
                                        ]}
                                        onPress={() => setDay(d)}
                                    >
                                        <Text style={[
                                            styles.pickerItemText,
                                            d === day && styles.pickerItemTextSelected
                                        ]}>
                                            {d.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Year */}
                        <View style={styles.pickerColumn}>
                            <Text style={styles.columnLabel}>Năm</Text>
                            <ScrollView
                                style={styles.picker}
                                showsVerticalScrollIndicator={true}
                            >
                                {years.map((y) => (
                                    <TouchableOpacity
                                        key={y}
                                        style={[
                                            styles.pickerItem,
                                            y === year && styles.pickerItemSelected
                                        ]}
                                        onPress={() => setYear(y)}
                                    >
                                        <Text style={[
                                            styles.pickerItemText,
                                            y === year && styles.pickerItemTextSelected
                                        ]}>
                                            {y}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Warning for future date */}
                    {isFutureDate() && (
                        <View style={styles.warningContainer}>
                            <MaterialIcons name="warning" size={16} color="#f44336" />
                            <Text style={styles.warningText}>
                                Ngày sinh không thể ở tương lai
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    cancelBtn: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    confirmBtn: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
    confirmBtnDisabled: {
        color: '#ccc',
    },
    dateDisplay: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dateDisplayText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    pickerContainer: {
        flexDirection: 'row',
        height: 240,
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    pickerColumn: {
        flex: 1,
        marginHorizontal: 4,
    },
    columnLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textAlign: 'center',
        marginBottom: 8,
    },
    picker: {
        flex: 1,
        marginHorizontal: 0,
    },
    pickerItem: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
    },
    pickerItemSelected: {
        backgroundColor: '#FFE8DC',
    },
    pickerItemText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    pickerItemTextSelected: {
        color: '#FF6B35',
        fontWeight: '700',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#f44336',
    },
    warningText: {
        marginLeft: 8,
        color: '#f44336',
        fontWeight: '500',
        fontSize: 13,
    },
});
