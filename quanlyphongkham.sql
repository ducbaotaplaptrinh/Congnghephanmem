-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2026 at 04:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanlyphongkham`
--

-- --------------------------------------------------------

--
-- Table structure for table `bacsi`
--

CREATE TABLE `bacsi` (
  `MaBS` int(11) NOT NULL,
  `MaCK` int(11) NOT NULL,
  `SoGiayPhepHanhNghe` varchar(50) NOT NULL,
  `HocHam` varchar(50) DEFAULT NULL,
  `KinhNghiem` int(11) NOT NULL DEFAULT 0
) ;

-- --------------------------------------------------------

--
-- Table structure for table `benhnhan`
--

CREATE TABLE `benhnhan` (
  `MaBN` int(11) NOT NULL,
  `MaTK` int(11) DEFAULT NULL,
  `HoTen` varchar(100) NOT NULL,
  `GioiTinh` enum('Nam','Nu','Khac') NOT NULL,
  `NgaySinh` date NOT NULL,
  `SDT` varchar(15) NOT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `CCCD` varchar(12) DEFAULT NULL,
  `SoBHYT` varchar(20) DEFAULT NULL,
  `NgayDangKy` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calamviec`
--

CREATE TABLE `calamviec` (
  `MaCa` int(11) NOT NULL,
  `Ngay` date NOT NULL,
  `GioBatDau` time NOT NULL,
  `GioKetThuc` time NOT NULL,
  `MaPhong` int(11) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `chitietdichvukham`
--

CREATE TABLE `chitietdichvukham` (
  `MaCTDVK` int(11) NOT NULL,
  `MaLSK` int(11) NOT NULL,
  `MaDV` int(11) NOT NULL,
  `KetQua` text DEFAULT NULL,
  `SoLuong` int(11) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Table structure for table `chitietdonthuoc`
--

CREATE TABLE `chitietdonthuoc` (
  `MaCTDT` int(11) NOT NULL,
  `MaDT` int(11) NOT NULL,
  `MaThuoc` int(11) NOT NULL,
  `SoLuong` int(11) NOT NULL,
  `LieuDung` varchar(100) DEFAULT NULL,
  `ThoiGianSuDung` varchar(100) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `chitiethoadon`
--

CREATE TABLE `chitiethoadon` (
  `MaCTHD` int(11) NOT NULL,
  `MaHD` int(11) NOT NULL,
  `MaThuoc` int(11) DEFAULT NULL,
  `MaDV` int(11) DEFAULT NULL,
  `MaDT` int(11) DEFAULT NULL,
  `SoLuong` int(11) NOT NULL,
  `DonGia` decimal(12,2) NOT NULL,
  `ThanhTien` decimal(14,2) GENERATED ALWAYS AS (`SoLuong` * `DonGia`) STORED
) ;

--
-- Triggers `chitiethoadon`
--
DELIMITER $$
CREATE TRIGGER `trg_cthd_after_delete` AFTER DELETE ON `chitiethoadon` FOR EACH ROW BEGIN
    UPDATE HoaDon
    SET TongTien = (SELECT COALESCE(SUM(ThanhTien),0) FROM ChiTietHoaDon WHERE MaHD = OLD.MaHD)
    WHERE MaHD = OLD.MaHD;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_cthd_after_insert` AFTER INSERT ON `chitiethoadon` FOR EACH ROW BEGIN
    UPDATE HoaDon
    SET TongTien = (SELECT COALESCE(SUM(ThanhTien),0) FROM ChiTietHoaDon WHERE MaHD = NEW.MaHD)
    WHERE MaHD = NEW.MaHD;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_cthd_after_update` AFTER UPDATE ON `chitiethoadon` FOR EACH ROW BEGIN
    UPDATE HoaDon
    SET TongTien = (SELECT COALESCE(SUM(ThanhTien),0) FROM ChiTietHoaDon WHERE MaHD = NEW.MaHD)
    WHERE MaHD = NEW.MaHD;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chuyenkhoa`
--

CREATE TABLE `chuyenkhoa` (
  `MaCK` int(11) NOT NULL,
  `TenChuyenKhoa` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dichvu`
--

CREATE TABLE `dichvu` (
  `MaDV` int(11) NOT NULL,
  `TenDichVu` varchar(100) NOT NULL,
  `DonGia` decimal(12,2) NOT NULL,
  `MaCK` int(11) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `donthuoc`
--

CREATE TABLE `donthuoc` (
  `MaDT` int(11) NOT NULL,
  `MaLSK` int(11) NOT NULL,
  `NgayKe` date NOT NULL DEFAULT curdate(),
  `GhiChuBacSi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hoadon`
--

CREATE TABLE `hoadon` (
  `MaHD` int(11) NOT NULL,
  `MaBN` int(11) NOT NULL,
  `MaLSK` int(11) NOT NULL,
  `NgayLap` datetime NOT NULL DEFAULT current_timestamp(),
  `TongTien` decimal(14,2) NOT NULL DEFAULT 0.00,
  `TrangThaiThanhToan` enum('ChuaThanhToan','DaThanhToan','DaHuy') NOT NULL DEFAULT 'ChuaThanhToan',
  `PhuongThucTT` enum('TienMat','ChuyenKhoan','TheThanhToan','ViDienTu') DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `hosobenhan`
--

CREATE TABLE `hosobenhan` (
  `MaHSBA` int(11) NOT NULL,
  `NhomMau` enum('A','B','AB','O','ChuaRo') DEFAULT 'ChuaRo',
  `TienSuBenh` text DEFAULT NULL,
  `DiUng` text DEFAULT NULL,
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lichhen`
--

CREATE TABLE `lichhen` (
  `MaLH` int(11) NOT NULL,
  `MaBN` int(11) NOT NULL,
  `MaBS` int(11) NOT NULL,
  `NgayHen` date NOT NULL,
  `GioHen` time NOT NULL,
  `TrangThai` enum('ChoXacNhan','DaXacNhan','DaKham','DaHuy') NOT NULL DEFAULT 'ChoXacNhan',
  `LyDoKham` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `lichhen`
--
DELIMITER $$
CREATE TRIGGER `trg_lichhen_check_ngay` BEFORE INSERT ON `lichhen` FOR EACH ROW BEGIN
    IF NEW.NgayHen < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày hẹn không được là ngày trong quá khứ';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `lichsukham`
--

CREATE TABLE `lichsukham` (
  `MaLSK` int(11) NOT NULL,
  `MaBN` int(11) NOT NULL,
  `MaBS` int(11) NOT NULL,
  `Ngay` datetime NOT NULL DEFAULT current_timestamp(),
  `TrieuChung` text DEFAULT NULL,
  `ChanDoan` text DEFAULT NULL,
  `KetLuan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nhanvien`
--

CREATE TABLE `nhanvien` (
  `MaNV` int(11) NOT NULL,
  `MaTK` int(11) DEFAULT NULL,
  `HoTen` varchar(100) NOT NULL,
  `GioiTinh` enum('Nam','Nu','Khac') NOT NULL,
  `NgaySinh` date NOT NULL,
  `SDT` varchar(15) NOT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `ChucVu` enum('BacSi','YTa','LeTan','QuanLy') NOT NULL,
  `NgayVaoLam` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `phanconglamviec`
--

CREATE TABLE `phanconglamviec` (
  `MaPCLV` int(11) NOT NULL,
  `MaNV` int(11) NOT NULL,
  `MaCa` int(11) NOT NULL,
  `VaiTroTrongCa` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `phongkham`
--

CREATE TABLE `phongkham` (
  `MaPhong` int(11) NOT NULL,
  `TenPhong` varchar(50) NOT NULL,
  `MaCK` int(11) NOT NULL,
  `TrangThai` enum('SanSang','DangSuDung','BaoTri') NOT NULL DEFAULT 'SanSang'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taikhoan`
--

CREATE TABLE `taikhoan` (
  `MaTK` int(11) NOT NULL,
  `TenDangNhap` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `VaiTro` enum('Admin','BacSi','YTa','LeTan','BenhNhan') NOT NULL,
  `TrangThai` enum('HoatDong','KhoaTaiKhoan') NOT NULL DEFAULT 'HoatDong',
  `NgayTao` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `thuoc`
--

CREATE TABLE `thuoc` (
  `MaThuoc` int(11) NOT NULL,
  `TenThuoc` varchar(150) NOT NULL,
  `DonViTinh` varchar(20) NOT NULL,
  `DonGia` decimal(12,2) NOT NULL,
  `SoLuongTon` int(11) NOT NULL DEFAULT 0,
  `HanSuDung` date NOT NULL,
  `NhaSanXuat` varchar(100) DEFAULT NULL
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bacsi`
--
ALTER TABLE `bacsi`
  ADD PRIMARY KEY (`MaBS`),
  ADD UNIQUE KEY `SoGiayPhepHanhNghe` (`SoGiayPhepHanhNghe`),
  ADD KEY `fk_bacsi_chuyenkhoa` (`MaCK`);

--
-- Indexes for table `benhnhan`
--
ALTER TABLE `benhnhan`
  ADD PRIMARY KEY (`MaBN`),
  ADD UNIQUE KEY `MaTK` (`MaTK`),
  ADD UNIQUE KEY `CCCD` (`CCCD`),
  ADD UNIQUE KEY `SoBHYT` (`SoBHYT`);

--
-- Indexes for table `calamviec`
--
ALTER TABLE `calamviec`
  ADD PRIMARY KEY (`MaCa`),
  ADD KEY `fk_calamviec_phongkham` (`MaPhong`);

--
-- Indexes for table `chitietdichvukham`
--
ALTER TABLE `chitietdichvukham`
  ADD PRIMARY KEY (`MaCTDVK`),
  ADD KEY `fk_ctdvk_lichsukham` (`MaLSK`),
  ADD KEY `fk_ctdvk_dichvu` (`MaDV`);

--
-- Indexes for table `chitietdonthuoc`
--
ALTER TABLE `chitietdonthuoc`
  ADD PRIMARY KEY (`MaCTDT`),
  ADD UNIQUE KEY `uq_ctdt_dt_thuoc` (`MaDT`,`MaThuoc`),
  ADD KEY `fk_ctdt_thuoc` (`MaThuoc`);

--
-- Indexes for table `chitiethoadon`
--
ALTER TABLE `chitiethoadon`
  ADD PRIMARY KEY (`MaCTHD`),
  ADD KEY `fk_cthd_hoadon` (`MaHD`),
  ADD KEY `fk_cthd_thuoc` (`MaThuoc`),
  ADD KEY `fk_cthd_dichvu` (`MaDV`),
  ADD KEY `fk_cthd_donthuoc` (`MaDT`);

--
-- Indexes for table `chuyenkhoa`
--
ALTER TABLE `chuyenkhoa`
  ADD PRIMARY KEY (`MaCK`),
  ADD UNIQUE KEY `TenChuyenKhoa` (`TenChuyenKhoa`);

--
-- Indexes for table `dichvu`
--
ALTER TABLE `dichvu`
  ADD PRIMARY KEY (`MaDV`),
  ADD KEY `fk_dichvu_chuyenkhoa` (`MaCK`);

--
-- Indexes for table `donthuoc`
--
ALTER TABLE `donthuoc`
  ADD PRIMARY KEY (`MaDT`),
  ADD UNIQUE KEY `MaLSK` (`MaLSK`);

--
-- Indexes for table `hoadon`
--
ALTER TABLE `hoadon`
  ADD PRIMARY KEY (`MaHD`),
  ADD UNIQUE KEY `MaLSK` (`MaLSK`),
  ADD KEY `fk_hoadon_benhnhan` (`MaBN`);

--
-- Indexes for table `hosobenhan`
--
ALTER TABLE `hosobenhan`
  ADD PRIMARY KEY (`MaHSBA`);

--
-- Indexes for table `lichhen`
--
ALTER TABLE `lichhen`
  ADD PRIMARY KEY (`MaLH`),
  ADD KEY `fk_lichhen_benhnhan` (`MaBN`),
  ADD KEY `fk_lichhen_bacsi` (`MaBS`);

--
-- Indexes for table `lichsukham`
--
ALTER TABLE `lichsukham`
  ADD PRIMARY KEY (`MaLSK`),
  ADD KEY `fk_lichsukham_benhnhan` (`MaBN`),
  ADD KEY `fk_lichsukham_bacsi` (`MaBS`);

--
-- Indexes for table `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD PRIMARY KEY (`MaNV`),
  ADD UNIQUE KEY `SDT` (`SDT`),
  ADD UNIQUE KEY `MaTK` (`MaTK`);

--
-- Indexes for table `phanconglamviec`
--
ALTER TABLE `phanconglamviec`
  ADD PRIMARY KEY (`MaPCLV`),
  ADD UNIQUE KEY `uq_pclv_nv_ca` (`MaNV`,`MaCa`),
  ADD KEY `fk_pclv_calamviec` (`MaCa`);

--
-- Indexes for table `phongkham`
--
ALTER TABLE `phongkham`
  ADD PRIMARY KEY (`MaPhong`),
  ADD UNIQUE KEY `TenPhong` (`TenPhong`),
  ADD KEY `fk_phongkham_chuyenkhoa` (`MaCK`);

--
-- Indexes for table `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`MaTK`),
  ADD UNIQUE KEY `TenDangNhap` (`TenDangNhap`);

--
-- Indexes for table `thuoc`
--
ALTER TABLE `thuoc`
  ADD PRIMARY KEY (`MaThuoc`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `benhnhan`
--
ALTER TABLE `benhnhan`
  MODIFY `MaBN` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `calamviec`
--
ALTER TABLE `calamviec`
  MODIFY `MaCa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitietdichvukham`
--
ALTER TABLE `chitietdichvukham`
  MODIFY `MaCTDVK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitietdonthuoc`
--
ALTER TABLE `chitietdonthuoc`
  MODIFY `MaCTDT` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitiethoadon`
--
ALTER TABLE `chitiethoadon`
  MODIFY `MaCTHD` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chuyenkhoa`
--
ALTER TABLE `chuyenkhoa`
  MODIFY `MaCK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dichvu`
--
ALTER TABLE `dichvu`
  MODIFY `MaDV` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donthuoc`
--
ALTER TABLE `donthuoc`
  MODIFY `MaDT` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hoadon`
--
ALTER TABLE `hoadon`
  MODIFY `MaHD` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lichhen`
--
ALTER TABLE `lichhen`
  MODIFY `MaLH` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lichsukham`
--
ALTER TABLE `lichsukham`
  MODIFY `MaLSK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `phanconglamviec`
--
ALTER TABLE `phanconglamviec`
  MODIFY `MaPCLV` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `phongkham`
--
ALTER TABLE `phongkham`
  MODIFY `MaPhong` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taikhoan`
--
ALTER TABLE `taikhoan`
  MODIFY `MaTK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `thuoc`
--
ALTER TABLE `thuoc`
  MODIFY `MaThuoc` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bacsi`
--
ALTER TABLE `bacsi`
  ADD CONSTRAINT `fk_bacsi_chuyenkhoa` FOREIGN KEY (`MaCK`) REFERENCES `chuyenkhoa` (`MaCK`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bacsi_nhanvien` FOREIGN KEY (`MaBS`) REFERENCES `nhanvien` (`MaNV`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `benhnhan`
--
ALTER TABLE `benhnhan`
  ADD CONSTRAINT `fk_benhnhan_taikhoan` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `calamviec`
--
ALTER TABLE `calamviec`
  ADD CONSTRAINT `fk_calamviec_phongkham` FOREIGN KEY (`MaPhong`) REFERENCES `phongkham` (`MaPhong`) ON UPDATE CASCADE;

--
-- Constraints for table `chitietdichvukham`
--
ALTER TABLE `chitietdichvukham`
  ADD CONSTRAINT `fk_ctdvk_dichvu` FOREIGN KEY (`MaDV`) REFERENCES `dichvu` (`MaDV`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ctdvk_lichsukham` FOREIGN KEY (`MaLSK`) REFERENCES `lichsukham` (`MaLSK`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chitietdonthuoc`
--
ALTER TABLE `chitietdonthuoc`
  ADD CONSTRAINT `fk_ctdt_donthuoc` FOREIGN KEY (`MaDT`) REFERENCES `donthuoc` (`MaDT`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ctdt_thuoc` FOREIGN KEY (`MaThuoc`) REFERENCES `thuoc` (`MaThuoc`) ON UPDATE CASCADE;

--
-- Constraints for table `chitiethoadon`
--
ALTER TABLE `chitiethoadon`
  ADD CONSTRAINT `fk_cthd_dichvu` FOREIGN KEY (`MaDV`) REFERENCES `dichvu` (`MaDV`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cthd_donthuoc` FOREIGN KEY (`MaDT`) REFERENCES `donthuoc` (`MaDT`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cthd_hoadon` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cthd_thuoc` FOREIGN KEY (`MaThuoc`) REFERENCES `thuoc` (`MaThuoc`) ON UPDATE CASCADE;

--
-- Constraints for table `dichvu`
--
ALTER TABLE `dichvu`
  ADD CONSTRAINT `fk_dichvu_chuyenkhoa` FOREIGN KEY (`MaCK`) REFERENCES `chuyenkhoa` (`MaCK`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `donthuoc`
--
ALTER TABLE `donthuoc`
  ADD CONSTRAINT `fk_donthuoc_lichsukham` FOREIGN KEY (`MaLSK`) REFERENCES `lichsukham` (`MaLSK`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hoadon`
--
ALTER TABLE `hoadon`
  ADD CONSTRAINT `fk_hoadon_benhnhan` FOREIGN KEY (`MaBN`) REFERENCES `benhnhan` (`MaBN`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hoadon_lichsukham` FOREIGN KEY (`MaLSK`) REFERENCES `lichsukham` (`MaLSK`) ON UPDATE CASCADE;

--
-- Constraints for table `hosobenhan`
--
ALTER TABLE `hosobenhan`
  ADD CONSTRAINT `fk_hosobenhan_benhnhan` FOREIGN KEY (`MaHSBA`) REFERENCES `benhnhan` (`MaBN`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lichhen`
--
ALTER TABLE `lichhen`
  ADD CONSTRAINT `fk_lichhen_bacsi` FOREIGN KEY (`MaBS`) REFERENCES `bacsi` (`MaBS`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichhen_benhnhan` FOREIGN KEY (`MaBN`) REFERENCES `benhnhan` (`MaBN`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lichsukham`
--
ALTER TABLE `lichsukham`
  ADD CONSTRAINT `fk_lichsukham_bacsi` FOREIGN KEY (`MaBS`) REFERENCES `bacsi` (`MaBS`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsukham_benhnhan` FOREIGN KEY (`MaBN`) REFERENCES `benhnhan` (`MaBN`) ON UPDATE CASCADE;

--
-- Constraints for table `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD CONSTRAINT `fk_nhanvien_taikhoan` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `phanconglamviec`
--
ALTER TABLE `phanconglamviec`
  ADD CONSTRAINT `fk_pclv_calamviec` FOREIGN KEY (`MaCa`) REFERENCES `calamviec` (`MaCa`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pclv_nhanvien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `phongkham`
--
ALTER TABLE `phongkham`
  ADD CONSTRAINT `fk_phongkham_chuyenkhoa` FOREIGN KEY (`MaCK`) REFERENCES `chuyenkhoa` (`MaCK`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
