class DateUtils {
    static monthNames =["Jan","Feb","Mar","Apr",
        "May","Jun","Jul","Aug",
        "Sep", "Oct","Nov","Dec"];

    static toDayMonthFormat(date: Date) {
        let day = date.getDate();
        let monthIndex = date.getMonth();
        let monthName = DateUtils.monthNames[monthIndex];
        return `${day}-${monthName}`;
    }

    static toShortFormat(date: Date) {
        let day = date.getDate();
        let monthIndex = date.getMonth();
        let monthName = DateUtils.monthNames[monthIndex];
        let year = date.getFullYear();

        return `${day} ${monthName} ${year}`;
    }
}

export default DateUtils;
