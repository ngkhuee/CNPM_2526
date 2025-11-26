import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.footer} alt="" />
          <p>
            Chúng tôi mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời
            với thực đơn đa dạng từ các nhà hàng đối tác. Đặt món dễ dàng,
            giao hàng nhanh chóng bằng drone, thưởng thức bữa ăn ngon
            ngay tại nhà.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>CÔNG TY</h2>
          <ul>
            <li>Trang chủ</li>
            <li>Về chúng tôi</li>
            <li>Giao hàng</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>LIÊN HỆ</h2>
          <ul>
            <li>+84-909-123-456</li>
            <li>lienhe@yummy.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Bản quyền 2024 © yummy.com - Tất cả quyền được bảo lưu.
      </p>
    </div>
  );
};

export default Footer;
