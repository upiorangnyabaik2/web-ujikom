# CRUD API Endpoints Documentation

## Menu CRUD Operations

### 1. GET ALL MENU ITEMS
- **Method**: GET
- **Endpoint**: `/api/menu`
- **Auth**: Not required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Nasi Goreng",
      "price": 50000,
      "description": "Nasi goreng special",
      "image": "/uploads/image.jpg",
      "createdAt": "2026-01-29T...",
      "updatedAt": "2026-01-29T..."
    }
  ]
}
```

### 2. GET SINGLE MENU ITEM
- **Method**: GET
- **Endpoint**: `/api/menu/:id`
- **Auth**: Not required
- **Response**: Single menu item object

### 3. CREATE MENU ITEM (ADMIN ONLY)
- **Method**: POST
- **Endpoint**: `/api/menu`
- **Auth**: Required + Admin role
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Body** (form-data):
  - `name` (string, required): Menu name
  - `price` (number, required): Price
  - `description` (string, optional): Description
  - `image` (file, required): Image file
- **Response**: 
```json
{
  "success": true,
  "msg": "Menu item created successfully",
  "data": { ... }
}
```

### 4. UPDATE MENU ITEM (ADMIN ONLY)
- **Method**: PUT
- **Endpoint**: `/api/menu/:id`
- **Auth**: Required + Admin role
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Body** (form-data, all optional):
  - `name`: Updated name
  - `price`: Updated price
  - `description`: Updated description
  - `image`: New image file
- **Response**: Updated menu item

### 5. DELETE MENU ITEM (ADMIN ONLY)
- **Method**: DELETE
- **Endpoint**: `/api/menu/:id`
- **Auth**: Required + Admin role
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "msg": "Menu item deleted successfully"
}
```

---

## Order CRUD Operations

### 1. CREATE ORDER (USER)
- **Method**: POST
- **Endpoint**: `/api/order`
- **Auth**: Required (any user)
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Body** (JSON):
```json
{
  "items": [
    {
      "menuId": "...",
      "name": "Nasi Goreng",
      "qty": 2,
      "price": 50000,
      "image": "/uploads/image.jpg"
    }
  ],
  "total": 100000,
  "paymentMethod": "xendit",
  "recipientName": "John Doe",
  "recipientPhone": "08123456789",
  "recipientAddress": "Jl. Contoh No. 123",
  "notes": "Pedas sedang"
}
```
- **Response**:
```json
{
  "success": true,
  "msg": "Order created successfully",
  "data": { ... }
}
```

### 2. GET MY ORDERS (USER)
- **Method**: GET
- **Endpoint**: `/api/order/me`
- **Auth**: Required
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Response**: Array of user's orders

### 3. GET ORDER BY ID (USER or ADMIN)
- **Method**: GET
- **Endpoint**: `/api/order/:orderId`
- **Auth**: Required
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Authorization**: User must be owner or admin
- **Response**: Single order object

### 4. UPDATE ORDER STATUS (USER or ADMIN)
- **Method**: PUT
- **Endpoint**: `/api/order/:orderId`
- **Auth**: Required
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Body** (JSON):
```json
{
  "status": "processing"
}
```
- **Valid Statuses**: `pending`, `processing`, `ready`, `completed`, `cancelled`
- **Response**: Updated order

### 5. GET ALL ORDERS (ADMIN ONLY)
- **Method**: GET
- **Endpoint**: `/api/order`
- **Auth**: Required + Admin role
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Response**: Array of all orders

### 6. DELETE ORDER (ADMIN ONLY)
- **Method**: DELETE
- **Endpoint**: `/api/order/:orderId`
- **Auth**: Required + Admin role
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "msg": "Order deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "msg": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "msg": "Token invalid or expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "msg": "Not authorized / Admin only"
}
```

### 404 Not Found
```json
{
  "success": false,
  "msg": "Menu item / Order not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "msg": "Failed to [operation]"
}
```

---

## Key Improvements

✅ **Consistent Response Format** - All endpoints return `{success, msg, data}`
✅ **Proper Error Handling** - Clear error messages and HTTP status codes
✅ **Input Validation** - All inputs are validated before processing
✅ **Authorization** - Admin operations require auth + admin role
✅ **Complete CRUD** - All menu and order operations implemented
✅ **Better Modeling** - Schema validation and enum constraints
✅ **Status Codes** - Proper HTTP status codes (200, 201, 400, 403, 404, 500)
