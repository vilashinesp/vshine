import { api } from "@/lib/api";
import { Booking, Order, Service, TailorProfile } from "@/types";

export async function browseTailors(city?: string) {
  const res = await api.get<TailorProfile[]>("/tailors", { params: { city } });
  return res.data;
}

export async function getTailor(tailorId: string) {
  const res = await api.get<TailorProfile>(`/tailors/${tailorId}`);
  return res.data;
}

export async function getTailorServices(tailorId: string) {
  const res = await api.get<Service[]>(`/tailors/${tailorId}/services`);
  return res.data;
}

export async function createBooking(data: {
  tailor_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  measurement_id?: string;
  cloth_image_url?: string;
  design_image_url?: string;
  measurement_image_url?: string;
  notes?: string;
}) {
  const res = await api.post<Booking>("/bookings", data);
  return res.data;
}

export async function myBookings() {
  const res = await api.get<Booking[]>("/bookings/me");
  return res.data;
}

export async function tailorBookings(status?: string) {
  const res = await api.get<Booking[]>("/bookings/tailor", { params: { status_filter: status } });
  return res.data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const res = await api.patch<Booking>(`/bookings/${bookingId}/status`, { status });
  return res.data;
}

export async function myOrders() {
  const res = await api.get<Order[]>("/orders/me");
  return res.data;
}

export async function tailorOrders(status?: string) {
  const res = await api.get<Order[]>("/orders/tailor", { params: { status_filter: status } });
  return res.data;
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const res = await api.patch<Order>(`/orders/${orderId}/status`, { status, note });
  return res.data;
}

export async function getOrderHistory(orderId: string) {
  const res = await api.get(`/orders/${orderId}/history`);
  return res.data;
}
