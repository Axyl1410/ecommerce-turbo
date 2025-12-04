# Use Case Flow: Update Cart Item (Cập nhật sản phẩm trong giỏ hàng)

## Thông tin Use Case
- **UC Name:** Update Cart Item (Cập nhật sản phẩm trong giỏ hàng)
- **Actor:** User (Người dùng)

## Flow (Luồng)

1. **User nhấn vào nút cập nhật số lượng trong giỏ hàng**
2. **Phần mềm kiểm tra số lượng có hợp lệ không (>= 0)**
   - **2.1. Số lượng hợp lệ (>= 0)**
   - **2.2. Số lượng không hợp lệ (< 0)**
     - **2.2.1. Trả về lỗi "Quantity must be zero or greater"**
3. **Phần mềm kiểm tra cart item có tồn tại không**
   - **3.1. Cart item tồn tại**
   - **3.2. Cart item không tồn tại**
     - **3.2.1. Trả về lỗi "Cart item not found"**
4. **Phần mềm kiểm tra số lượng user chỉ định**
   - **4.1. Số lượng = 0**
     - **4.1.1. Xóa item khỏi giỏ hàng**
     - **4.1.2. Xóa cache giỏ hàng**
     - **4.1.3. Trả về null (item đã bị xóa)**
   - **4.2. Số lượng > 0**
     - **4.2.1. Kiểm tra trạng thái sản phẩm (PUBLISHED)**
       - **4.2.1.1. Sản phẩm không available (status != PUBLISHED)**
         - **4.2.1.1.1. Trả về lỗi "Product is not available"**
       - **4.2.1.2. Sản phẩm available (status = PUBLISHED)**
         - **4.2.1.2.1. Kiểm tra số lượng trong kho**
           - **4.2.1.2.1.1. Số lượng trong kho >= số lượng user chỉ định**
             - **4.2.1.2.1.1.1. Cập nhật số lượng item trong giỏ hàng**
             - **4.2.1.2.1.1.2. Xóa cache giỏ hàng**
             - **4.2.1.2.1.1.3. Trả về item đã cập nhật**
           - **4.2.1.2.1.2. Số lượng trong kho < số lượng user chỉ định**
             - **4.2.1.2.1.2.1. Trả về lỗi "Insufficient stock"**
5. **Phản hồi cho user**
6. **User thấy được phản hồi**

## Kịch bản (Scenarios)

### Kịch bản 1: Số lượng không hợp lệ (< 0)
- **Flow:** `1 -> 2 -> 2.2 -> 2.2.1 -> 5 -> 6`
- **Mô tả:** User nhấn cập nhật -> Phần mềm kiểm tra -> Số lượng không hợp lệ -> Trả về lỗi -> Phản hồi cho user -> User thấy lỗi

### Kịch bản 2: Cart item không tồn tại
- **Flow:** `1 -> 2 -> 2.1 -> 3 -> 3.2 -> 3.2.1 -> 5 -> 6`
- **Mô tả:** User nhấn cập nhật -> Số lượng hợp lệ -> Kiểm tra cart item -> Không tồn tại -> Trả về lỗi -> Phản hồi cho user -> User thấy lỗi

### Kịch bản 3: Xóa item khỏi giỏ hàng (số lượng = 0)
- **Flow:** `1 -> 2 -> 2.1 -> 3 -> 3.1 -> 4 -> 4.1 -> 4.1.1 -> 4.1.2 -> 4.1.3 -> 5 -> 6`
- **Mô tả:** User nhấn cập nhật -> Số lượng hợp lệ -> Cart item tồn tại -> Số lượng = 0 -> Xóa item -> Xóa cache -> Trả về null -> Phản hồi cho user -> User thấy item đã bị xóa

### Kịch bản 4: Sản phẩm không available (status != PUBLISHED)
- **Flow:** `1 -> 2 -> 2.1 -> 3 -> 3.1 -> 4 -> 4.2 -> 4.2.1 -> 4.2.1.1 -> 4.2.1.1.1 -> 5 -> 6`
- **Mô tả:** User nhấn cập nhật -> Số lượng hợp lệ -> Cart item tồn tại -> Số lượng > 0 -> Kiểm tra trạng thái -> Không available -> Trả về lỗi -> Phản hồi cho user -> User thấy lỗi

### Kịch bản 5: Số lượng vượt quá tồn kho
- **Flow:** `1 -> 2 -> 2.1 -> 3 -> 3.1 -> 4 -> 4.2 -> 4.2.1 -> 4.2.1.2 -> 4.2.1.2.1 -> 4.2.1.2.1.2 -> 4.2.1.2.1.2.1 -> 5 -> 6`
- **Mô tả:** User nhấn cập nhật -> Số lượng hợp lệ -> Cart item tồn tại -> Số lượng > 0 -> Sản phẩm available -> Kiểm tra tồn kho -> Số lượng vượt quá -> Trả về lỗi "Insufficient stock" -> Phản hồi cho user -> User thấy lỗi

### Kịch bản 6: Cập nhật thành công (số lượng trong kho >= số lượng user chỉ định)
- **Flow:** `1 -> 2 -> 2.1 -> 3 -> 3.1 -> 4 -> 4.2 -> 4.2.1 -> 4.2.1.2 -> 4.2.1.2.1 -> 4.2.1.2.1.1 -> 4.2.1.2.1.1.1 -> 4.2.1.2.1.1.2 -> 4.2.1.2.1.1.3 -> 5 -> 6`
- **Mô tả:** User nhấn cập nhật -> Số lượng hợp lệ -> Cart item tồn tại -> Số lượng > 0 -> Sản phẩm available -> Kiểm tra tồn kho -> Số lượng đủ -> Cập nhật số lượng -> Xóa cache -> Trả về item đã cập nhật -> Phản hồi cho user -> User thấy item đã được cập nhật

## Bảng tóm tắt Test Cases

| Test Case | Kịch bản | Input | Expected Output | Status |
|-----------|----------|-------|-----------------|--------|
| TC1 | Kịch bản 1 | quantity: -1 | ApplicationError: "Quantity must be zero or greater" | ✅ |
| TC2 | Kịch bản 2 | itemId: "non-existent" | ApplicationError: "Cart item not found" | ✅ |
| TC3 | Kịch bản 3 | quantity: 0 | null (item removed) | ✅ |
| TC4 | Kịch bản 4 | productStatus: "DRAFT" | ApplicationError: "Product is not available" | ✅ |
| TC5 | Kịch bản 5 | quantity: 5, stockQuantity: 3 | ApplicationError: "Insufficient stock" | ✅ |
| TC6 | Kịch bản 6 (tăng) | quantity: 3, stockQuantity: 10 | CartItemDTO với quantity: 3 | ✅ |
| TC7 | Kịch bản 6 (giảm) | quantity: 1, stockQuantity: 4 | CartItemDTO với quantity: 1 | ✅ |
| TC8 | Kịch bản 6 (bằng tồn kho) | quantity: 5, stockQuantity: 5 | CartItemDTO với quantity: 5 | ✅ |
| TC9 | Hết hàng | stockQuantity: 0 | ApplicationError: "Insufficient stock" | ✅ |

## Ghi chú
- ✅ = Test case đã được implement

