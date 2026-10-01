package com.example.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã OTP Đặt Lại Mật Khẩu - Hệ thống Tuyển dụng");
        message.setText("Xin chào,\n\n"
                + "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản trên Hệ thống Tuyển dụng Nội bộ.\n\n"
                + "Mã OTP của bạn là: " + otpCode + "\n\n"
                + "Mã OTP này có hiệu lực trong 5 phút.\n\n"
                + "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "Ban quản trị Hệ thống");

        mailSender.send(message);
    }
}
