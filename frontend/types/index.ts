export type UserRole = "customer" | "tailor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  is_verified: boolean;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "measurement"
  | "cutting"
  | "stitching"
  | "ironing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface TailorProfile {
  id: string;
  user_id: string;
  shop_name: string;
  bio?: string | null;
  years_experience: number;
  city?: string | null;
  cover_image_url?: string | null;
  is_approved: boolean;
  avg_rating: number;
  total_reviews: number;
}

export interface Service {
  id: string;
  tailor_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  duration_days: number;
  image_url?: string | null;
  is_active: boolean;
}

export interface Booking {
  id: string;
  customer_id: string;
  tailor_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: OrderStatus;
  cloth_image_url?: string | null;
  design_image_url?: string | null;
  notes?: string | null;
}

export interface Order {
  id: string;
  booking_id: string;
  customer_id: string;
  tailor_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  estimated_delivery?: string | null;
}
