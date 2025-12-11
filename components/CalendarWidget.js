import React, { useState, useMemo } from "react";
import { View, Dimensions, Text } from "react-native";
import { Card, useTheme } from "react-native-paper";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { createShadow } from "../utils/shadow";
import { useAppSelector } from "../store/hooks";
import mockTasksData from "../data/mockTasks.json";

// Cấu hình locale cho tiếng Việt
LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthNamesShort: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  dayNames: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

// Flag để bật/tắt mock data (true = dùng mock JSON, false = dùng data từ Redux)
const USE_MOCK_DATA = false;

const months = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export default function CalendarWidget({
  currentDate: propCurrentDate,
  selectedDate: propSelectedDate,
  onSelectDate: propOnSelectDate,
}) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const [internalCurrentDate, setInternalCurrentDate] = useState(
    new Date(2026, 1, 1)
  ); // Tháng 2 năm 2026
  const [internalSelectedDate, setInternalSelectedDate] = useState(
    new Date(2026, 1, 1)
  ); // Ngày 1 tháng 2

  // Sử dụng props nếu có, nếu không dùng state nội bộ
  const currentDate = propCurrentDate || internalCurrentDate;
  const selectedDate = propSelectedDate || internalSelectedDate;
  const setSelectedDate = propOnSelectDate || setInternalSelectedDate;

  // Lấy tasks từ Redux state (chỉ dùng khi USE_MOCK_DATA = false)
  const { todayTasks, tasks } = useAppSelector((state) => state.tasks);

  // Kết hợp tất cả tasks: dùng mock data nếu flag bật, nếu không dùng Redux data
  const allTasks = useMemo(() => {
    if (USE_MOCK_DATA && mockTasksData && Array.isArray(mockTasksData)) {
      return mockTasksData;
    }
    return [...(todayTasks || []), ...(tasks || [])];
  }, [todayTasks, tasks]);

  // Tạo map marked dates từ tasks (key: 'YYYY-MM-DD', value: marked object)
  const markedDates = useMemo(() => {
    const marked = {};
    
    allTasks.forEach((task) => {
      // Lấy ngày từ due_date hoặc created_at
      let dateKey = null;
      if (task.due_date) {
        const date = new Date(task.due_date);
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      } else if (task.created_at) {
        const date = new Date(task.created_at);
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      }

      if (dateKey) {
        if (!marked[dateKey]) {
          marked[dateKey] = {
            marked: true,
            dotColor: theme.colors.success || "#4CAF50",
          };
        }
      }
    });

    // Thêm selected date
    const selectedDateStr = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    
    if (marked[selectedDateStr]) {
      marked[selectedDateStr].selected = true;
      marked[selectedDateStr].selectedColor = theme.colors.primary;
    } else {
      marked[selectedDateStr] = {
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return marked;
  }, [allTasks, selectedDate, theme.colors.primary, theme.colors.success]);

  // Format selected date cho Calendar component
  const selectedDateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  }, [selectedDate]);

  // Format current date cho Calendar component
  const currentDateStr = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-01`;
  }, [currentDate]);

  const handleDayPress = (day) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
  };

  const handleMonthChange = (month) => {
    // Có thể cập nhật currentDate nếu cần
  };

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 3,
  });

  return (
    <View
      style={{
        position: "relative",
        flex: 1,
      }}
    >
      <Card
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness * 1.33,
            borderWidth: 1,
            borderColor: theme.colors.outline || "#E0E0E0",
            flex: 1,
          },
          cardShadow,
        ]}
      >
        <Card.Content
          style={{
            padding: 0,
            flex: 1,
          }}
        >
          <View
            style={{
              padding: 16,
              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: isTablet ? 20 : 18,
                fontWeight: "600",
                color: theme.colors.onSurface,
              }}
            >
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
          </View>
          <Calendar
            current={currentDateStr}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markingType="simple"
            firstDay={0} // 0 = Chủ nhật
            hideExtraDays={false}
            enableSwipeMonths={true}
            hideArrows={false}
            style={{
              flex: 1,
              borderWidth: 0,
            }}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.onSurfaceVariant,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.onSurface,
              textDisabledColor: theme.colors.onSurfaceVariant,
              dotColor: theme.colors.success || "#4CAF50",
              selectedDotColor: "#FFFFFF",
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.onSurface,
              textDayFontWeight: "500",
              textMonthFontWeight: "600",
              textDayHeaderFontWeight: "600",
              textDayFontSize: isTablet ? 16 : 14,
              textMonthFontSize: isTablet ? 20 : 18,
              textDayHeaderFontSize: isTablet ? 13 : 11,
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }
              }
            }}
          />
        </Card.Content>
      </Card>
    </View>
  );
}
