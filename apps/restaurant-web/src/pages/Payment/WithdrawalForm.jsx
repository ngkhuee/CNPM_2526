import React, { useState } from "react";
import { MdSend, MdError } from "react-icons/md";
import { formatCurrency } from "@utils/formatters";

const WithdrawalForm = ({ availableBalance, onSubmit, loading }) => {
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const amountNum = parseFloat(amount);

    if (!amount || amount.trim() === "" || isNaN(amountNum)) {
      newErrors.amount = "Vui lòng nhập số tiền hợp lệ";
    } else if (amountNum <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    } else if (amountNum < 1000) {
      newErrors.amount = "Số tiền rút tối thiểu là 1.000₫";
    } else if (amountNum % 1000 !== 0) {
      newErrors.amount = "Số tiền phải là bội số của 1.000₫";
    } else if (amountNum > availableBalance) {
      newErrors.amount = `Số tiền không thể vượt quá số dư khả dụng (${formatCurrency(availableBalance)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(parseFloat(amount));
    setAmount("");
    setErrors({});
  };

  return (
    <div className="withdrawal-form-container">
      <div className="withdrawal-form-card">
        <h3>Yêu cầu rút tiền</h3>
        <p className="info-text">
          Số dư khả dụng: <strong>{formatCurrency(availableBalance)}</strong>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="amount">Số tiền rút *</label>
            <div className="input-wrapper">
              <span className="currency-symbol">₫</span>
              <input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string, numbers, and remove any non-numeric except decimal point
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setAmount(value);
                    // Clear errors when user types
                    if (errors.amount) {
                      setErrors({});
                    }
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  validateForm();
                }}
                disabled={loading}
                min="1000"
                step="1000"
              />
            </div>
            {errors.amount && (
              <p className="error-message">
                <MdError /> {errors.amount}
              </p>
            )}
          </div>

          <div className="form-info">
            <p>
              <strong>Lưu ý:</strong> Yêu cầu rút tiền của bạn sẽ được xử lý
              và tài khoản sẽ được cập nhật khi được quản trị viên phê duyệt.
            </p>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            <MdSend /> {loading ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
          </button>
        </form>
      </div>

      {/* Quick Amount Buttons */}
      <div className="quick-amounts">
        <p className="quick-label">Số tiền nhanh:</p>
        <div className="quick-buttons">
          {[1000000, 2000000, 5000000, 10000000].map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              className="quick-btn"
              onClick={() => {
                if (quickAmount <= availableBalance) {
                  setAmount(quickAmount.toString());
                  setErrors({});
                }
              }}
              disabled={quickAmount > availableBalance || loading}
            >
              {formatCurrency(quickAmount)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalForm;
