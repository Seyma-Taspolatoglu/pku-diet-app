import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  white: '#FFFFFF',
  text: '#1E1B4B',
  textSecondary: '#6366F1',
  border: '#E0E7FF',
  bg: '#F8FAFC',
};

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DAYS = ['Pt', 'Sa', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function CalendarModal({ visible, onClose, selectedDate, onDateSelect }: CalendarModalProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  useEffect(() => {
    if (visible) {
      setViewDate(new Date(selectedDate));
    }
  }, [visible, selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const changeYear = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year + delta);
    setViewDate(newDate);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(month + delta);
    setViewDate(newDate);
  };

  const handleDateClick = (dayNum: number) => {
    const newDate = new Date(year, month, dayNum);
    onDateSelect(newDate);
    onClose();
  };

  const renderDays = () => {
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty spaces for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = 
        d === selectedDate.getDate() && 
        month === selectedDate.getMonth() && 
        year === selectedDate.getFullYear();
      
      const isToday = 
        d === new Date().getDate() && 
        month === new Date().getMonth() && 
        year === new Date().getFullYear();

      days.push(
        <TouchableOpacity
          key={`day-${d}`}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
            isToday && !isSelected && styles.todayCell
          ]}
          onPress={() => handleDateClick(d)}
        >
          <Text style={[
            styles.dayText, 
            isSelected && styles.selectedDayText,
            isToday && !isSelected && styles.todayText
          ]}>
            {d}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header Area: Controls */}
          <View style={styles.controlsHeader}>
            {/* Year Row */}
            <View style={styles.controlRow}>
              <TouchableOpacity onPress={() => changeYear(-1)} style={styles.miniArrow}>
                <Ionicons name="chevron-back" size={20} color={COLORS.indigo} />
              </TouchableOpacity>
              <Text style={styles.controlTitle}>{year}</Text>
              <TouchableOpacity onPress={() => changeYear(1)} style={styles.miniArrow}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.indigo} />
              </TouchableOpacity>
            </View>

            {/* Month Row */}
            <View style={[styles.controlRow, { marginTop: 12 }]}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.miniArrow}>
                <Ionicons name="chevron-back" size={20} color={COLORS.indigo} />
              </TouchableOpacity>
              <Text style={[styles.controlTitle, { color: COLORS.indigo }]}>{MONTHS[month]}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.miniArrow}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.indigo} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days Weekday Legend */}
          <View style={styles.daysLegend}>
            {DAYS.map(d => (
              <Text key={d} style={styles.legendText}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.gridContainer}>
            {renderDays()}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.todayBtn} 
              onPress={() => {
                const today = new Date();
                onDateSelect(today);
                onClose();
              }}
            >
              <Text style={styles.todayBtnText}>Bugüne Git</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Math.min(width * 0.9, 360),
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 24,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  controlsHeader: {
    marginBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 6,
  },
  miniArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  daysLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  legendText: {
    width: (Math.min(width * 0.9, 360) - 48) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: (Math.min(width * 0.9, 360) - 48) / 7,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedDayCell: {
    backgroundColor: COLORS.indigo,
    shadowColor: COLORS.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: '800',
  },
  todayCell: {
    backgroundColor: COLORS.indigoLight,
    borderWidth: 1,
    borderColor: COLORS.indigo,
  },
  todayText: {
    color: COLORS.indigo,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    gap: 12,
  },
  closeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  todayBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.indigo,
    alignItems: 'center',
  },
  todayBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
