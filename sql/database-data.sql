INSERT INTO roles (id, name)
VALUES (1, "role_name");

INSERT INTO users(id, name, display_name, profile_image, description, role_id) VALUES 
("2", "name", "display_name", "profile_iamge", "desc", 1),
("1", "name", "display_name", "profile_iamge", "desc", 1);

INSERT INTO agent_categories (id, name) VALUES 
('1', 'Trợ lý'),
('2','Anime'),
('3','Sáng tạo & Viết lách'),
('4','Giải trí & Trò chơi'),
('5','Lịch sử'),
('6','Hài hước'),
('7','Học tập'),
('8','Phong cách sống'),
('9','Sao chép'),
('10','RPG & Câu đố');

INSERT INTO report_categories (id, name, severity) VALUES 
(1, 'Đe dọa & Quấy rối', 3),
(2, 'Bạo lực Quá mức', 3),
(3, 'Phát ngôn Sai sự thật', 2),
(4, 'Ngôn từ Thù hận', 2),
(5, 'Nội dung Không phù hợp', 2),
(6, 'Quấy rối Tình dục', 3),
(7, 'Bóc lột Trẻ em', 3),
(8, 'Tự gây hại', 2),
(9, 'Khủng bố & Cực đoan', 3),
(10, 'Hoạt động Bất hợp pháp', 3),
(11, 'Giao dịch Ma túy', 3),
(12, 'Xâm phạm Quyền riêng tư', 2),
(13, 'Mạo danh', 2),
(14, 'Spam Thương mại', 1);

INSERT INTO ai_reviews (id, description, rating, ai_agent_id, reporter_id, report_categories_id) VALUES 
('1', 'Phát hiện nội dung đe dọa và quấy rối người dùng khác', '1', '2USMTGR26X', '1', 1),
('2', 'Agent tạo ra nội dung bạo lực không phù hợp', '1', '3KXD8GRDJ1', '1', 2),
('3', 'Cung cấp thông tin sai lệch về sức khỏe', '2', 'AFTHGMNZDC', '1', 3),
('4', 'Sử dụng ngôn từ phân biệt chủng tộc', '1', 'NVHJN2GH70', '1', 4),
('5', 'Tạo nội dung người lớn không được kiểm duyệt', '2', 'GHAJU5HESC', '1', 5),
('6', 'Có hành vi quấy rối tình dục trong cuộc trò chuyện', '1', 'DJXKGUDAOH', '1', 6),
('7', 'Tạo nội dung có thể gây hại đến trẻ em', '1', 'WLB3IXEWAS', '1', 7),
('8', 'Khuyến khích hành vi tự làm tổn thương bản thân', '1', 'XFVUNGBC7J', '1', 8),
('9', 'Tuyên truyền tư tưởng cực đoan', '1', 'XODVBFEI3V', '1', 9),
('10', 'Hướng dẫn các hoạt động bất hợp pháp', '1', 'Y4REGVGPC2', '1', 10),
('11', 'Cung cấp thông tin về ma túy và cách sử dụng', '1', '2USMTGR26X', '2', 11),
('12', 'Chia sẻ thông tin cá nhân của người khác', '2', '3KXD8GRDJ1', '2', 12),
('13', 'Giả mạo danh tính của người nổi tiếng', '2', 'AFTHGMNZDC', '2', 13),
('14', 'Gửi tin nhắn quảng cáo spam liên tục', '3', 'NVHJN2GH70', '2', 14),
('15', 'Đe dọa gây hại thể chất cho người dùng', '1', 'GHAJU5HESC', '2', 1),
('16', 'Mô tả chi tiết cảnh bạo lực đẫm máu', '1', 'DJXKGUDAOH', '2', 2),
('17', 'Tạo tin tức giả về sự kiện chính trị', '2', 'WLB3IXEWAS', '2', 3),
('18', 'Sử dụng từ ngữ kỳ thị tôn giáo', '1', 'XFVUNGBC7J', '2', 4),
('19', 'Nội dung khiêu dâm không phù hợp độ tuổi', '2', 'XODVBFEI3V', '2', 5),
('20', 'Yêu cầu thông tin nhạy cảm cá nhân', '2', 'Y4REGVGPC2', '2', 6);

INSERT INTO user_likes (user_id, ai_agent_id, liked, create_at) VALUES
('1', '2USMTGR26X', 1, NOW()),
('1', '3KXD8GRDJ1', 0, NOW()),
('1', 'AFTHGMNZDC', 1, NOW()),
('1', 'DJXKGUDAOH', 1, NOW()),
('1', 'GHAJU5HESC', 0, NOW()),
('1', 'NVHJN2GH70', 1, NOW()),
('1', 'WLB3IXEWAS', 1, NOW()),
('1', 'XFVUNGBC7J', 0, NOW()),
('1', 'XODVBFEI3V', 1, NOW()),
('1', 'Y4REGVGPC2', 1, NOW()),
('2', '2USMTGR26X', 0, NOW()),
('2', '3KXD8GRDJ1', 1, NOW()),
('2', 'AFTHGMNZDC', 1, NOW()),
('2', 'DJXKGUDAOH', 0, NOW()),
('2', 'GHAJU5HESC', 1, NOW()),
('2', 'NVHJN2GH70', 0, NOW()),
('2', 'WLB3IXEWAS', 1, NOW()),
('2', 'XFVUNGBC7J', 1, NOW()),
('2', 'XODVBFEI3V', 0, NOW()),
('2', 'Y4REGVGPC2', 0, NOW());

