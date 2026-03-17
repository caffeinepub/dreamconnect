# Letzclub

## Current State
The app (previously DreamConnect) has categories (Electronics, Cars, Interior Designing, Furniture, Real Estate) with monthly registration slots. Admin dashboard accessible via clipboard icon with password protection. No authentication system.

## Requested Changes (Diff)

### Add
- Signup / Sign-in pages with email + password authentication
- Users can view their own registration history after logging in
- Product-based slots per category instead of month-based slots
- Admin role: can view all registrations in dashboard
- Hide admin dashboard icon/access from non-admin users

### Modify
- Replace monthly slots (Jan-Dec) with product lists per category:
  - Electronics: Mobile, Laptop, TV, Refrigerator, AC, Washing Machine, Chimney, Speakers
  - Cars: Hatchback, Sedan, SUV, MUV, Luxury Car, Electric Car, Sports Car, Pickup Truck
  - Interior Designing: Living Room, Bedroom, Kitchen, Bathroom, Office, Kids Room, Balcony, Dining Room
  - Furniture: Sofa, Bed, Wardrobe, Dining Table, Office Chair, Bookshelf, TV Unit, Shoe Rack
  - Real Estate: Apartment, Villa, Plot, Commercial Space, Studio, Penthouse, Farmhouse, Warehouse
- Registration form: collect name, phone, location, requirements
- App branding: DreamConnect → Letzclub
- Admin dashboard only visible to users with admin role

### Remove
- Month-based slot system
- Hardcoded password-based admin access

## Implementation Plan
1. Use authorization component for user auth (signup/login, roles: user, admin)
2. Backend: store registrations with userId, category, product, name, phone, location, requirements, timestamp
3. Backend: getMyRegistrations(userId), getAllRegistrations() admin only, registerForProduct()
4. Backend: product slot capacity tracking (max 20 per product per category)
5. Frontend: Auth pages (signup/login)
6. Frontend: Home with category tabs and product slot cards with progress bars
7. Frontend: Registration modal (name, phone, location, requirements)
8. Frontend: My Registrations page for logged-in users
9. Frontend: Admin Dashboard page (role-gated, shows all registrations)
