export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0đ";
    // Use toLocaleString for vi-VN formatting and add đ suffix
    return amount.toLocaleString("vi-VN") + "đ";
};

export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
};

export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

export const formatRating = (rating) => {
    if (rating === null || rating === undefined) return "0.0";
    const num = parseFloat(rating);
    return isNaN(num) ? "0.0" : num.toFixed(1);
};
