# KN-31: Xây dựng cơ chế kiểm tra quyền truy cập

# Danh sách quyền của từng vai trò
ROLE_PERMISSIONS = {
    "Admin": {
        "xem_nguoi_dung",
        "them_nguoi_dung",
        "sua_nguoi_dung",
        "xoa_nguoi_dung"
    },

    "Recruiter": {
        "xem_nguoi_dung",
        "them_nguoi_dung",
        "sua_nguoi_dung"
    },

    "Candidate": {
        "xem_nguoi_dung"
    }
}


def check_permission(role, permission):
    """
    Kiểm tra một vai trò có được phép thực hiện
    một chức năng hay không.
    """

    # Kiểm tra vai trò có tồn tại không
    if role not in ROLE_PERMISSIONS:
        return False

    # Kiểm tra quyền
    return permission in ROLE_PERMISSIONS[role]


def test_role(role, permission):
    """
    Kiểm tra và hiển thị kết quả truy cập.
    """

    result = check_permission(role, permission)

    if result:
        status = "ĐƯỢC PHÉP"
    else:
        status = "TỪ CHỐI"

    print(
        f"Vai trò: {role:<10} | "
        f"Quyền: {permission:<20} | "
        f"Kết quả: {status}"
    )

    return result

# ==========================================
# KIỂM TRA TỰ ĐỘNG CƠ CHẾ QUYỀN TRUY CẬP
# ==========================================

test_cases = [
    # Vai trò, quyền, kết quả mong đợi
    ("Admin", "xoa_nguoi_dung", True),
    ("Admin", "sua_nguoi_dung", True),
    ("Recruiter", "sua_nguoi_dung", True),
    ("Recruiter", "xoa_nguoi_dung", False),
    ("Candidate", "xem_nguoi_dung", True),
    ("Candidate", "xoa_nguoi_dung", False)
]


print("=" * 80)
print("          KIỂM TRA TỰ ĐỘNG CƠ CHẾ QUYỀN TRUY CẬP")
print("=" * 80)

passed = 0
failed = 0

for role, permission, expected in test_cases:

    actual = check_permission(role, permission)

    if actual == expected:
        result = "PASS"
        passed += 1
    else:
        result = "FAIL"
        failed += 1

    print(
        f"Vai trò: {role:<10} | "
        f"Quyền: {permission:<20} | "
        f"Kết quả: {result}"
    )


print("=" * 80)
print(f"Tổng số kiểm tra : {len(test_cases)}")
print(f"Đạt              : {passed}")
print(f"Không đạt        : {failed}")
print("=" * 80)

if failed == 0:
    print("KẾT LUẬN: TẤT CẢ KIỂM TRA ĐỀU ĐẠT.")
else:
    print("KẾT LUẬN: CÓ KIỂM TRA KHÔNG ĐẠT.")

