import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleViewMenu = () => {
    navigate("/menu");
  };

  return (
    <div className="header">
      <div className="header-contents">
        <h2>Đặt món ăn yêu thích của bạn tại đây</h2>
        <p>
          Lựa chọn từ thực đơn đa dạng với nhiều món ngon được chế biến từ
          nguyên liệu tươi ngon và kỹ năng nấu ăn chuyên nghiệp. Sứ mệnh của
          chúng tôi là thỏa mãn khẩu vị và nâng tầm trải nghiệm ẩm thực của
          bạn, từng bữa ăn ngon mỗi ngày.
        </p>
        <button onClick={handleViewMenu}>Xem thực đơn</button>
      </div>
    </div>
  );
};

export default Header;
