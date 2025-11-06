export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: "Email không được để trống" };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valid: false, message: "Email không hợp lệ" };
  }
  return { valid: true };
};

export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: "Số điện thoại không được để trống" };
  }
  const re = /^(0|\+84)[0-9]{9}$/;
  if (!re.test(phone)) {
    return {
      valid: false,
      message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)",
    };
  }
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Mật khẩu không được để trống" };
  }
  if (password.length < 6) {
    return { valid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }
  return { valid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return { valid: false, message: `${fieldName} không được để trống` };
  }
  return { valid: true };
};

export const validatePositiveNumber = (value, fieldName) => {
  if (value === null || value === undefined || value === "") {
    return { valid: false, message: `${fieldName} không được để trống` };
  }
  if (isNaN(value)) {
    return { valid: false, message: `${fieldName} phải là số` };
  }
  if (Number(value) <= 0) {
    return { valid: false, message: `${fieldName} phải lớn hơn 0` };
  }
  return { valid: true };
};

export const validateMinMax = (value, min, max, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} phải là số` };
  }
  if (num < min || num > max) {
    return { valid: false, message: `${fieldName} phải từ ${min} đến ${max}` };
  }
  return { valid: true };
};
