/// Dữ liệu đơn vị hành chính Việt Nam (Tỉnh/Thành phố -> Quận/Huyện -> Phường/Xã)
/// Phục vụ cho bộ chọn địa chỉ 3 cấp chuẩn xác.
library;

class Ward {
  final String name;
  final String code;

  const Ward({required this.name, required this.code});
}

class District {
  final String name;
  final String code;
  final List<Ward> wards;

  const District({
    required this.name,
    required this.code,
    required this.wards,
  });
}

class Province {
  final String name;
  final String code;
  final List<District> districts;

  const Province({
    required this.name,
    required this.code,
    required this.districts,
  });
}

const List<Province> vietnamProvinces = [
  // 1. THÀNH PHỐ HỒ CHÍ MINH
  Province(
    name: 'Thành phố Hồ Chí Minh',
    code: '79',
    districts: [
      District(
        name: 'Quận 1',
        code: '760',
        wards: [
          Ward(name: 'Phường Bến Nghé', code: '26734'),
          Ward(name: 'Phường Bến Thành', code: '26740'),
          Ward(name: 'Phường Cô Giang', code: '26746'),
          Ward(name: 'Phường Cầu Kho', code: '26749'),
          Ward(name: 'Phường Cầu Ông Lãnh', code: '26743'),
          Ward(name: 'Phường Đa Kao', code: '26737'),
          Ward(name: 'Phường Nguyễn Cư Trinh', code: '26752'),
          Ward(name: 'Phường Nguyễn Thái Bình', code: '26755'),
          Ward(name: 'Phường Phạm Ngũ Lão', code: '26758'),
          Ward(name: 'Phường Tân Định', code: '26731'),
        ],
      ),
      District(
        name: 'Quận 3',
        code: '770',
        wards: [
          Ward(name: 'Phường 1', code: '27145'),
          Ward(name: 'Phường 2', code: '27148'),
          Ward(name: 'Phường 3', code: '27151'),
          Ward(name: 'Phường 4', code: '27154'),
          Ward(name: 'Phường 5', code: '27157'),
          Ward(name: 'Phường 9', code: '27160'),
          Ward(name: 'Phường 10', code: '27163'),
          Ward(name: 'Phường 11', code: '27166'),
          Ward(name: 'Phường 12', code: '27169'),
          Ward(name: 'Phường 13', code: '27172'),
          Ward(name: 'Phường 14', code: '27175'),
          Ward(name: 'Phường Võ Thị Sáu', code: '27139'),
        ],
      ),
      District(
        name: 'Quận 4',
        code: '773',
        wards: [
          Ward(name: 'Phường 1', code: '27265'),
          Ward(name: 'Phường 2', code: '27268'),
          Ward(name: 'Phường 3', code: '27271'),
          Ward(name: 'Phường 4', code: '27274'),
          Ward(name: 'Phường 6', code: '27280'),
          Ward(name: 'Phường 8', code: '27286'),
          Ward(name: 'Phường 9', code: '27289'),
          Ward(name: 'Phường 10', code: '27292'),
          Ward(name: 'Phường 13', code: '27301'),
          Ward(name: 'Phường 14', code: '27304'),
          Ward(name: 'Phường 15', code: '27307'),
          Ward(name: 'Phường 16', code: '27310'),
          Ward(name: 'Phường 18', code: '27316'),
        ],
      ),
      District(
        name: 'Quận 5',
        code: '774',
        wards: [
          Ward(name: 'Phường 1', code: '27319'),
          Ward(name: 'Phường 2', code: '27322'),
          Ward(name: 'Phường 3', code: '27325'),
          Ward(name: 'Phường 4', code: '27328'),
          Ward(name: 'Phường 5', code: '27331'),
          Ward(name: 'Phường 6', code: '27334'),
          Ward(name: 'Phường 7', code: '27337'),
          Ward(name: 'Phường 8', code: '27340'),
          Ward(name: 'Phường 9', code: '27343'),
          Ward(name: 'Phường 10', code: '27346'),
          Ward(name: 'Phường 11', code: '27349'),
          Ward(name: 'Phường 12', code: '27352'),
          Ward(name: 'Phường 13', code: '27355'),
          Ward(name: 'Phường 14', code: '27358'),
        ],
      ),
      District(
        name: 'Quận 7',
        code: '778',
        wards: [
          Ward(name: 'Phường Tân Thuận Đông', code: '27481'),
          Ward(name: 'Phường Tân Thuận Tây', code: '27484'),
          Ward(name: 'Phường Tân Kiểng', code: '27487'),
          Ward(name: 'Phường Tân Hưng', code: '27490'),
          Ward(name: 'Phường Bình Thuận', code: '27493'),
          Ward(name: 'Phường Tân Quy', code: '27496'),
          Ward(name: 'Phường Phú Thuận', code: '27499'),
          Ward(name: 'Phường Tân Phú', code: '27502'),
          Ward(name: 'Phường Tân Phong', code: '27505'),
          Ward(name: 'Phường Phú Mỹ', code: '27508'),
        ],
      ),
      District(
        name: 'Quận 10',
        code: '771',
        wards: [
          Ward(name: 'Phường 1', code: '27181'),
          Ward(name: 'Phường 2', code: '27184'),
          Ward(name: 'Phường 4', code: '27190'),
          Ward(name: 'Phường 5', code: '27193'),
          Ward(name: 'Phường 6', code: '27196'),
          Ward(name: 'Phường 7', code: '27199'),
          Ward(name: 'Phường 8', code: '27202'),
          Ward(name: 'Phường 9', code: '27205'),
          Ward(name: 'Phường 10', code: '27208'),
          Ward(name: 'Phường 11', code: '27211'),
          Ward(name: 'Phường 12', code: '27214'),
          Ward(name: 'Phường 13', code: '27217'),
          Ward(name: 'Phường 14', code: '27220'),
          Ward(name: 'Phường 15', code: '27223'),
        ],
      ),
      District(
        name: 'Quận Bình Thạnh',
        code: '765',
        wards: [
          Ward(name: 'Phường 1', code: '26845'),
          Ward(name: 'Phường 2', code: '26848'),
          Ward(name: 'Phường 3', code: '26851'),
          Ward(name: 'Phường 5', code: '26857'),
          Ward(name: 'Phường 6', code: '26860'),
          Ward(name: 'Phường 7', code: '26863'),
          Ward(name: 'Phường 11', code: '26875'),
          Ward(name: 'Phường 12', code: '26878'),
          Ward(name: 'Phường 13', code: '26881'),
          Ward(name: 'Phường 14', code: '26884'),
          Ward(name: 'Phường 15', code: '26887'),
          Ward(name: 'Phường 17', code: '26890'),
          Ward(name: 'Phường 19', code: '26893'),
          Ward(name: 'Phường 21', code: '26896'),
          Ward(name: 'Phường 22', code: '26899'),
          Ward(name: 'Phường 24', code: '26902'),
          Ward(name: 'Phường 25', code: '26905'),
          Ward(name: 'Phường 26', code: '26908'),
          Ward(name: 'Phường 27', code: '26911'),
          Ward(name: 'Phường 28', code: '26914'),
        ],
      ),
      District(
        name: 'Thành phố Thủ Đức',
        code: '769',
        wards: [
          Ward(name: 'Phường Thảo Điền', code: '26923'),
          Ward(name: 'Phường An Phú', code: '26926'),
          Ward(name: 'Phường An Khánh', code: '26929'),
          Ward(name: 'Phường Bình An', code: '26932'),
          Ward(name: 'Phường Thủ Thiêm', code: '26935'),
          Ward(name: 'Phường Linh Trung', code: '26767'),
          Ward(name: 'Phường Linh Chiểu', code: '26770'),
          Ward(name: 'Phường Linh Tây', code: '26773'),
          Ward(name: 'Phường Linh Đông', code: '26776'),
          Ward(name: 'Phường Hiệp Phú', code: '26830'),
          Ward(name: 'Phường Phước Long A', code: '26833'),
          Ward(name: 'Phường Phước Long B', code: '26836'),
          Ward(name: 'Phường Tăng Nhơn Phú A', code: '26839'),
          Ward(name: 'Phường Tăng Nhơn Phú B', code: '26842'),
        ],
      ),
      District(
        name: 'Quận Phú Nhuận',
        code: '768',
        wards: [
          Ward(name: 'Phường 1', code: '27091'),
          Ward(name: 'Phường 2', code: '27094'),
          Ward(name: 'Phường 3', code: '27097'),
          Ward(name: 'Phường 4', code: '27100'),
          Ward(name: 'Phường 5', code: '27103'),
          Ward(name: 'Phường 7', code: '27106'),
          Ward(name: 'Phường 8', code: '27109'),
          Ward(name: 'Phường 9', code: '27112'),
          Ward(name: 'Phường 10', code: '27115'),
          Ward(name: 'Phường 11', code: '27118'),
          Ward(name: 'Phường 13', code: '27124'),
          Ward(name: 'Phường 15', code: '27130'),
          Ward(name: 'Phường 17', code: '27136'),
        ],
      ),
      District(
        name: 'Quận Tân Bình',
        code: '766',
        wards: [
          Ward(name: 'Phường 1', code: '26941'),
          Ward(name: 'Phường 2', code: '26944'),
          Ward(name: 'Phường 3', code: '26947'),
          Ward(name: 'Phường 4', code: '26950'),
          Ward(name: 'Phường 5', code: '26953'),
          Ward(name: 'Phường 6', code: '26956'),
          Ward(name: 'Phường 7', code: '26959'),
          Ward(name: 'Phường 8', code: '26962'),
          Ward(name: 'Phường 9', code: '26965'),
          Ward(name: 'Phường 10', code: '26968'),
          Ward(name: 'Phường 11', code: '26971'),
          Ward(name: 'Phường 12', code: '26974'),
          Ward(name: 'Phường 13', code: '26977'),
          Ward(name: 'Phường 14', code: '26980'),
          Ward(name: 'Phường 15', code: '26983'),
        ],
      ),
      District(
        name: 'Quận Gò Vấp',
        code: '764',
        wards: [
          Ward(name: 'Phường 1', code: '26791'),
          Ward(name: 'Phường 3', code: '26794'),
          Ward(name: 'Phường 4', code: '26797'),
          Ward(name: 'Phường 5', code: '26800'),
          Ward(name: 'Phường 6', code: '26803'),
          Ward(name: 'Phường 7', code: '26806'),
          Ward(name: 'Phường 8', code: '26809'),
          Ward(name: 'Phường 9', code: '26812'),
          Ward(name: 'Phường 10', code: '26815'),
          Ward(name: 'Phường 11', code: '26818'),
          Ward(name: 'Phường 12', code: '26821'),
          Ward(name: 'Phường 14', code: '26827'),
          Ward(name: 'Phường 15', code: '26830'),
          Ward(name: 'Phường 16', code: '26833'),
          Ward(name: 'Phường 17', code: '26836'),
        ],
      ),
      District(
        name: 'Quận Tân Phú',
        code: '767',
        wards: [
          Ward(name: 'Phường Tân Sơn Nhì', code: '26989'),
          Ward(name: 'Phường Tây Thạnh', code: '26992'),
          Ward(name: 'Phường Sơn Kỳ', code: '26995'),
          Ward(name: 'Phường Tân Quý', code: '26998'),
          Ward(name: 'Phường Tân Thành', code: '27001'),
          Ward(name: 'Phường Phú Thọ Hòa', code: '27004'),
          Ward(name: 'Phường Phú Thạnh', code: '27007'),
          Ward(name: 'Phường Phú Trung', code: '27010'),
          Ward(name: 'Phường Hòa Thạnh', code: '27013'),
          Ward(name: 'Phường Hiệp Tân', code: '27016'),
          Ward(name: 'Phường Tân Thới Hòa', code: '27019'),
        ],
      ),
      District(
        name: 'Quận Bình Tân',
        code: '777',
        wards: [
          Ward(name: 'Phường Bình Hưng Hòa', code: '27451'),
          Ward(name: 'Phường Bình Hưng Hòa A', code: '27454'),
          Ward(name: 'Phường Bình Hưng Hòa B', code: '27457'),
          Ward(name: 'Phường Bình Trị Đông', code: '27460'),
          Ward(name: 'Phường Bình Trị Đông A', code: '27463'),
          Ward(name: 'Phường Bình Trị Đông B', code: '27466'),
          Ward(name: 'Phường Tân Tạo', code: '27469'),
          Ward(name: 'Phường Tân Tạo A', code: '27472'),
          Ward(name: 'Phường An Lạc', code: '27475'),
          Ward(name: 'Phường An Lạc A', code: '27478'),
        ],
      ),
      District(
        name: 'Quận 12',
        code: '761',
        wards: [
          Ward(name: 'Phường Thạnh Xuân', code: '26761'),
          Ward(name: 'Phường Thạnh Lộc', code: '26764'),
          Ward(name: 'Phường Hiệp Thành', code: '26767'),
          Ward(name: 'Phường Thới An', code: '26770'),
          Ward(name: 'Phường Tân Chánh Hiệp', code: '26773'),
          Ward(name: 'Phường An Phú Đông', code: '26776'),
          Ward(name: 'Phường Tân Thới Hiệp', code: '26779'),
          Ward(name: 'Phường Trung Mỹ Tây', code: '26782'),
          Ward(name: 'Phường Tân Hưng Thuận', code: '26785'),
          Ward(name: 'Phường Đông Hưng Thuận', code: '26788'),
        ],
      ),
    ],
  ),

  // 2. THÀNH PHỐ HÀ NỘI
  Province(
    name: 'Thành phố Hà Nội',
    code: '01',
    districts: [
      District(
        name: 'Quận Ba Đình',
        code: '001',
        wards: [
          Ward(name: 'Phường Phúc Xá', code: '00001'),
          Ward(name: 'Phường Trúc Bạch', code: '00004'),
          Ward(name: 'Phường Vĩnh Phúc', code: '00006'),
          Ward(name: 'Phường Cống Vị', code: '00007'),
          Ward(name: 'Phường Liễu Giai', code: '00008'),
          Ward(name: 'Phường Nguyễn Trung Trực', code: '00010'),
          Ward(name: 'Phường Quán Thánh', code: '00013'),
          Ward(name: 'Phường Ngọc Hà', code: '00016'),
          Ward(name: 'Phường Điện Biên', code: '00019'),
          Ward(name: 'Phường Đội Cấn', code: '00022'),
          Ward(name: 'Phường Ngọc Khánh', code: '00025'),
          Ward(name: 'Phường Kim Mã', code: '00028'),
          Ward(name: 'Phường Giảng Võ', code: '00031'),
          Ward(name: 'Phường Thành Công', code: '00034'),
        ],
      ),
      District(
        name: 'Quận Hoàn Kiếm',
        code: '002',
        wards: [
          Ward(name: 'Phường Đồng Xuân', code: '00037'),
          Ward(name: 'Phường Hàng Mã', code: '00040'),
          Ward(name: 'Phường Hàng Buồm', code: '00043'),
          Ward(name: 'Phường Hàng Đào', code: '00046'),
          Ward(name: 'Phường Hàng Bồ', code: '00049'),
          Ward(name: 'Phường Cửa Đông', code: '00052'),
          Ward(name: 'Phường Lý Thái Tổ', code: '00055'),
          Ward(name: 'Phường Hàng Bạc', code: '00058'),
          Ward(name: 'Phường Hàng Gai', code: '00061'),
          Ward(name: 'Phường Chương Dương', code: '00064'),
          Ward(name: 'Phường Hàng Trống', code: '00067'),
          Ward(name: 'Phường Cửa Nam', code: '00070'),
          Ward(name: 'Phường Hàng Bông', code: '00073'),
          Ward(name: 'Phường Tràng Tiền', code: '00076'),
          Ward(name: 'Phường Trần Hưng Đạo', code: '00079'),
          Ward(name: 'Phường Phan Chu Trinh', code: '00082'),
          Ward(name: 'Phường Hàng Bài', code: '00085'),
        ],
      ),
      District(
        name: 'Quận Cầu Giấy',
        code: '005',
        wards: [
          Ward(name: 'Phường Nghĩa Đô', code: '00157'),
          Ward(name: 'Phường Nghĩa Tân', code: '00160'),
          Ward(name: 'Phường Mai Dịch', code: '00163'),
          Ward(name: 'Phường Dịch Vọng', code: '00166'),
          Ward(name: 'Phường Dịch Vọng Hậu', code: '00167'),
          Ward(name: 'Phường Quan Hoa', code: '00169'),
          Ward(name: 'Phường Yên Hòa', code: '00172'),
          Ward(name: 'Phường Trung Hòa', code: '00175'),
        ],
      ),
      District(
        name: 'Quận Đống Đa',
        code: '006',
        wards: [
          Ward(name: 'Phường Cát Linh', code: '00178'),
          Ward(name: 'Phường Văn Miếu', code: '00181'),
          Ward(name: 'Phường Quốc Tử Giám', code: '00184'),
          Ward(name: 'Phường Láng Thượng', code: '00187'),
          Ward(name: 'Phường Ô Chợ Dừa', code: '00190'),
          Ward(name: 'Phường Văn Chương', code: '00193'),
          Ward(name: 'Phường Hàng Bột', code: '00196'),
          Ward(name: 'Phường Láng Hạ', code: '00199'),
          Ward(name: 'Phường Khâm Thiên', code: '00202'),
          Ward(name: 'Phường Thổ Quan', code: '00205'),
          Ward(name: 'Phường Nam Đồng', code: '00208'),
          Ward(name: 'Phường Trung Phụng', code: '00211'),
          Ward(name: 'Phường Quang Trung', code: '00214'),
          Ward(name: 'Phường Trung Liệt', code: '00217'),
          Ward(name: 'Phường Phương Liên', code: '00220'),
          Ward(name: 'Phường Thịnh Quang', code: '00223'),
          Ward(name: 'Phường Trung Tự', code: '00226'),
          Ward(name: 'Phường Kim Liên', code: '00229'),
          Ward(name: 'Phường Phương Mai', code: '00232'),
          Ward(name: 'Phường Ngã Tư Sở', code: '00235'),
          Ward(name: 'Phường Khương Thượng', code: '00238'),
        ],
      ),
      District(
        name: 'Quận Hai Bà Trưng',
        code: '007',
        wards: [
          Ward(name: 'Phường Nguyễn Du', code: '00241'),
          Ward(name: 'Phường Bạch Đằng', code: '00244'),
          Ward(name: 'Phường Phạm Đình Hổ', code: '00247'),
          Ward(name: 'Phường Lê Đại Hành', code: '00256'),
          Ward(name: 'Phường Đồng Nhân', code: '00259'),
          Ward(name: 'Phường Phố Huế', code: '00262'),
          Ward(name: 'Phường Đống Mác', code: '00265'),
          Ward(name: 'Phường Thanh Lương', code: '00268'),
          Ward(name: 'Phường Thanh Nhàn', code: '00271'),
          Ward(name: 'Phường Cầu Dền', code: '00274'),
          Ward(name: 'Phường Bách Khoa', code: '00277'),
          Ward(name: 'Phường Đồng Tâm', code: '00280'),
          Ward(name: 'Phường Vĩnh Tuy', code: '00283'),
          Ward(name: 'Phường Bạch Mai', code: '00286'),
          Ward(name: 'Phường Quỳnh Mai', code: '00289'),
          Ward(name: 'Phường Quỳnh Lôi', code: '00292'),
          Ward(name: 'Phường Minh Khai', code: '00295'),
          Ward(name: 'Phường Trương Định', code: '00298'),
        ],
      ),
      District(
        name: 'Quận Tây Hồ',
        code: '003',
        wards: [
          Ward(name: 'Phường Phú Thượng', code: '00091'),
          Ward(name: 'Phường Nhật Tân', code: '00094'),
          Ward(name: 'Phường Tứ Liên', code: '00097'),
          Ward(name: 'Phường Quảng An', code: '00100'),
          Ward(name: 'Phường Xuân La', code: '00103'),
          Ward(name: 'Phường Yên Phụ', code: '00106'),
          Ward(name: 'Phường Bưởi', code: '00109'),
          Ward(name: 'Phường Thụy Khuê', code: '00112'),
        ],
      ),
    ],
  ),

  // 3. THÀNH PHỐ ĐÀ NẴNG
  Province(
    name: 'Thành phố Đà Nẵng',
    code: '48',
    districts: [
      District(
        name: 'Quận Hải Châu',
        code: '490',
        wards: [
          Ward(name: 'Phường Hải Châu I', code: '20194'),
          Ward(name: 'Phường Hải Châu II', code: '20197'),
          Ward(name: 'Phường Thạch Thang', code: '20200'),
          Ward(name: 'Phường Thanh Bình', code: '20203'),
          Ward(name: 'Phường Thuận Phước', code: '20206'),
          Ward(name: 'Phường Hòa Thuận Tây', code: '20207'),
          Ward(name: 'Phường Hòa Thuận Đông', code: '20208'),
          Ward(name: 'Phường Nam Dương', code: '20209'),
          Ward(name: 'Phường Bình Hiên', code: '20212'),
          Ward(name: 'Phường Bình Thuận', code: '20215'),
          Ward(name: 'Phường Hòa Cường Bắc', code: '20218'),
          Ward(name: 'Phường Hòa Cường Nam', code: '20221'),
        ],
      ),
      District(
        name: 'Quận Thanh Khê',
        code: '491',
        wards: [
          Ward(name: 'Phường Tam Thuận', code: '20224'),
          Ward(name: 'Phường Thanh Khê Tây', code: '20227'),
          Ward(name: 'Phường Thanh Khê Đông', code: '20230'),
          Ward(name: 'Phường Xuân Hà', code: '20233'),
          Ward(name: 'Phường Tân Chính', code: '20236'),
          Ward(name: 'Phường Chính Gián', code: '20239'),
          Ward(name: 'Phường Vĩnh Trung', code: '20242'),
          Ward(name: 'Phường Thạc Gián', code: '20245'),
          Ward(name: 'Phường An Khê', code: '20248'),
          Ward(name: 'Phường Hòa Khê', code: '20251'),
        ],
      ),
      District(
        name: 'Quận Sơn Trà',
        code: '492',
        wards: [
          Ward(name: 'Phường Thọ Quang', code: '20254'),
          Ward(name: 'Phường Nại Hiên Đông', code: '20257'),
          Ward(name: 'Phường Mân Thái', code: '20260'),
          Ward(name: 'Phường An Hải Bắc', code: '20263'),
          Ward(name: 'Phường Phước Mỹ', code: '20266'),
          Ward(name: 'Phường An Hải Tây', code: '20269'),
          Ward(name: 'Phường An Hải Đông', code: '20272'),
        ],
      ),
      District(
        name: 'Quận Ngũ Hành Sơn',
        code: '493',
        wards: [
          Ward(name: 'Phường Mỹ An', code: '20275'),
          Ward(name: 'Phường Khuê Mỹ', code: '20278'),
          Ward(name: 'Phường Hòa Quý', code: '20281'),
          Ward(name: 'Phường Hòa Hải', code: '20284'),
        ],
      ),
    ],
  ),

  // 4. TỈNH BÌNH DƯƠNG
  Province(
    name: 'Tỉnh Bình Dương',
    code: '74',
    districts: [
      District(
        name: 'Thành phố Thủ Dầu Một',
        code: '718',
        wards: [
          Ward(name: 'Phường Hiệp Thành', code: '25681'),
          Ward(name: 'Phường Phú Lợi', code: '25684'),
          Ward(name: 'Phường Phú Cường', code: '25687'),
          Ward(name: 'Phường Phú Hòa', code: '25690'),
          Ward(name: 'Phường Phú Thọ', code: '25693'),
          Ward(name: 'Phường Chánh Nghĩa', code: '25696'),
          Ward(name: 'Phường Định Hòa', code: '25699'),
          Ward(name: 'Phường Hòa Phú', code: '25700'),
          Ward(name: 'Phường Phú Tân', code: '25701'),
        ],
      ),
      District(
        name: 'Thành phố Thuận An',
        code: '724',
        wards: [
          Ward(name: 'Phường Lái Thiêu', code: '25837'),
          Ward(name: 'Phường An Thạnh', code: '25840'),
          Ward(name: 'Phường Vĩnh Phú', code: '25843'),
          Ward(name: 'Phường Bình Hòa', code: '25846'),
          Ward(name: 'Phường Thuận Giao', code: '25849'),
          Ward(name: 'Phường An Phú', code: '25852'),
        ],
      ),
      District(
        name: 'Thành phố Dĩ An',
        code: '725',
        wards: [
          Ward(name: 'Phường Dĩ An', code: '25867'),
          Ward(name: 'Phường Tân Đông Hiệp', code: '25870'),
          Ward(name: 'Phường Tân Bình', code: '25873'),
          Ward(name: 'Phường Đông Hòa', code: '25876'),
          Ward(name: 'Phường Bình An', code: '25879'),
          Ward(name: 'Phường Bình Thắng', code: '25882'),
          Ward(name: 'Phường An Bình', code: '25885'),
        ],
      ),
    ],
  ),

  // 5. TỈNH ĐỒNG NAI
  Province(
    name: 'Tỉnh Đồng Nai',
    code: '75',
    districts: [
      District(
        name: 'Thành phố Biên Hòa',
        code: '731',
        wards: [
          Ward(name: 'Phường Trảng Dài', code: '26002'),
          Ward(name: 'Phường Tân Phong', code: '26005'),
          Ward(name: 'Phường Tân Biên', code: '26008'),
          Ward(name: 'Phường Hố Nai', code: '26011'),
          Ward(name: 'Phường Tân Hòa', code: '26014'),
          Ward(name: 'Phường Tân Hiệp', code: '26017'),
          Ward(name: 'Phường Bửu Long', code: '26020'),
          Ward(name: 'Phường Tân Tiến', code: '26023'),
          Ward(name: 'Phường Tam Hiệp', code: '26026'),
          Ward(name: 'Phường Long Bình', code: '26029'),
          Ward(name: 'Phường Quang Vinh', code: '26032'),
          Ward(name: 'Phường Trung Dũng', code: '26038'),
          Ward(name: 'Phường Thống Nhất', code: '26044'),
          Ward(name: 'Phường Quyết Thắng', code: '26050'),
        ],
      ),
    ],
  ),

  // 6. THÀNH PHỐ CẦN THƠ
  Province(
    name: 'Thành phố Cần Thơ',
    code: '92',
    districts: [
      District(
        name: 'Quận Ninh Kiều',
        code: '916',
        wards: [
          Ward(name: 'Phường Cái Khế', code: '31147'),
          Ward(name: 'Phường An Hòa', code: '31150'),
          Ward(name: 'Phường Thới Bình', code: '31153'),
          Ward(name: 'Phường An Nghiệp', code: '31156'),
          Ward(name: 'Phường An Cư', code: '31159'),
          Ward(name: 'Phường Tân An', code: '31165'),
          Ward(name: 'Phường Xuân Khánh', code: '31171'),
          Ward(name: 'Phường Hưng Lợi', code: '31174'),
          Ward(name: 'Phường An Bình', code: '31177'),
        ],
      ),
      District(
        name: 'Quận Cái Răng',
        code: '918',
        wards: [
          Ward(name: 'Phường Lê Bình', code: '31189'),
          Ward(name: 'Phường Hưng Phú', code: '31192'),
          Ward(name: 'Phường Hưng Thạnh', code: '31195'),
          Ward(name: 'Phường Ba Láng', code: '31198'),
        ],
      ),
    ],
  ),

  // 7. THÀNH PHỐ HẢI PHÒNG
  Province(
    name: 'Thành phố Hải Phòng',
    code: '31',
    districts: [
      District(
        name: 'Quận Hồng Bàng',
        code: '303',
        wards: [
          Ward(name: 'Phường Quán Toan', code: '11185'),
          Ward(name: 'Phường Hùng Vương', code: '11188'),
          Ward(name: 'Phường Sở Dầu', code: '11191'),
          Ward(name: 'Phường Thượng Lý', code: '11194'),
          Ward(name: 'Phường Hạ Lý', code: '11197'),
          Ward(name: 'Phường Minh Khai', code: '11200'),
          Ward(name: 'Phường Hoàng Văn Thụ', code: '11206'),
          Ward(name: 'Phường Phan Bội Châu', code: '11209'),
        ],
      ),
      District(
        name: 'Quận Ngô Quyền',
        code: '304',
        wards: [
          Ward(name: 'Phường Máy Chai', code: '11218'),
          Ward(name: 'Phường Máy Tơ', code: '11221'),
          Ward(name: 'Phường Vạn Mỹ', code: '11224'),
          Ward(name: 'Phường Cầu Tre', code: '11227'),
          Ward(name: 'Phường Lạc Viên', code: '11230'),
          Ward(name: 'Phường Cầu Đất', code: '11236'),
        ],
      ),
    ],
  ),

  // CÁC TỈNH THÀNH KHÁC (Đại diện 63 tỉnh thành để bao phủ toàn quốc)
  Province(name: 'Tỉnh Bà Rịa - Vũng Tàu', code: '77', districts: [
    District(name: 'Thành phố Vũng Tàu', code: '747', wards: [
      Ward(name: 'Phường 1', code: '26470'),
      Ward(name: 'Phường Thắng Nhì', code: '26473'),
      Ward(name: 'Phường 7', code: '26476'),
      Ward(name: 'Phường 8', code: '26479'),
    ]),
  ]),
  Province(name: 'Tỉnh Khánh Hòa', code: '56', districts: [
    District(name: 'Thành phố Nha Trang', code: '568', wards: [
      Ward(name: 'Phường Lộc Thọ', code: '22384'),
      Ward(name: 'Phường Phước Hải', code: '22387'),
      Ward(name: 'Phường Phước Tân', code: '22390'),
      Ward(name: 'Phường Vĩnh Nguyên', code: '22393'),
    ]),
  ]),
  Province(name: 'Tỉnh Lâm Đồng', code: '68', districts: [
    District(name: 'Thành phố Đà Lạt', code: '672', wards: [
      Ward(name: 'Phường 1', code: '24760'),
      Ward(name: 'Phường 2', code: '24763'),
      Ward(name: 'Phường 3', code: '24766'),
      Ward(name: 'Phường 4', code: '24769'),
    ]),
  ]),
  Province(name: 'Tỉnh Quảng Ninh', code: '22', districts: [
    District(name: 'Thành phố Hạ Long', code: '193', wards: [
      Ward(name: 'Phường Bãi Cháy', code: '06880'),
      Ward(name: 'Phường Hòn Gai', code: '06883'),
      Ward(name: 'Phường Bạch Đằng', code: '06886'),
    ]),
  ]),
  Province(name: 'Tỉnh Thừa Thiên Huế', code: '46', districts: [
    District(name: 'Thành phố Huế', code: '474', wards: [
      Ward(name: 'Phường Phú Hội', code: '19816'),
      Ward(name: 'Phường Vĩnh Ninh', code: '19819'),
      Ward(name: 'Phường Thuận Thành', code: '19822'),
    ]),
  ]),
  Province(name: 'Tỉnh Kiên Giang', code: '91', districts: [
    District(name: 'Thành phố Phú Quốc', code: '914', wards: [
      Ward(name: 'Phường Dương Đông', code: '31135'),
      Ward(name: 'Phường An Thới', code: '31138'),
      Ward(name: 'Xã Gành Dầu', code: '31141'),
    ]),
  ]),
];

/// Helper tìm Province theo tên
Province? findProvinceByName(String name) {
  final clean = name.trim().toLowerCase();
  for (final p in vietnamProvinces) {
    final pName = p.name.toLowerCase();
    if (pName == clean || pName.contains(clean) || clean.contains(pName)) {
      return p;
    }
  }
  return null;
}
