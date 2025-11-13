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
      newErrors.amount = "Please enter a valid amount";
    } else if (amountNum <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (amountNum < 1000) {
      newErrors.amount = "Minimum withdrawal amount is 1,000₫";
    } else if (amountNum % 1000 !== 0) {
      newErrors.amount = "Amount must be a multiple of 1,000₫";
    } else if (amountNum > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance (${formatCurrency(availableBalance)})`;
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
        <h3>Request Withdrawal</h3>
        <p className="info-text">
          Available balance: <strong>{formatCurrency(availableBalance)}</strong>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="amount">Withdrawal Amount *</label>
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
              <strong>Note:</strong> Your withdrawal request will be processed
              and your account will be updated once approved by the admin.
            </p>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            <MdSend /> {loading ? "Submitting..." : "Submit Withdrawal Request"}
          </button>
        </form>
      </div>

      {/* Quick Amount Buttons */}
      <div className="quick-amounts">
        <p className="quick-label">Quick amounts:</p>
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
