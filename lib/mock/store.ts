// In-memory mock backend store. Survives HMR via globalThis. Dev/demo only —
// replaced entirely by the Laravel backend (customer-contract-v1) in production.

import type {
  Address,
  Booking,
  BookingStatus,
  Customer,
  PaymentMethod,
  Service,
  Vehicle,
} from "@/lib/api/types";

export const MOCK_OTP = "123456";

export type MockDB = {
  customers: (Customer & { vehicles: Vehicle[]; addresses: Address[] })[];
  tokens: Map<string, number>; // token -> customer id
  otps: Map<string, string>; // phone -> code
  bookings: (Booking & { customer_id: number })[];
  nextId: number;
};

// Official Bubbleit pricelist — salon vs SUV pricing.
export const SERVICES: Service[] = [
  {
    id: 1,
    name: "Standard Bubble",
    description: "Exterior wash & interior cleaning.",
    price: 60,
    price_suv: 70,
    category: "Bubble Wash",
    add_ons: [],
  },
  {
    id: 2,
    name: "Steam Bubble",
    description: "Exterior wash & interior cleaning with steam.",
    price: 120,
    price_suv: 140,
    category: "Bubble Wash",
    add_ons: [],
  },
  {
    id: 3,
    name: "Deep Bubble",
    description: "Exterior wash, engine wash, under-chassis & interior steam cleaning.",
    price: 180,
    price_suv: 200,
    category: "Bubble Wash",
    add_ons: [],
  },
  {
    id: 4,
    name: "Interior Detailing",
    description: "Full interior polish and deep detailing.",
    price: 450,
    price_suv: 550,
    category: "Detailing",
    add_ons: [],
  },
  {
    id: 5,
    name: "Exterior Detailing",
    description: "Full exterior polish and paint care.",
    price: 550,
    price_suv: 650,
    category: "Detailing",
    add_ons: [],
  },
  {
    id: 6,
    name: "Bubbleit Detailing",
    description: "The complete package — interior & exterior polish.",
    price: 850,
    price_suv: 1000,
    category: "Detailing",
    add_ons: [],
  },
];

export const SLOT_GRID = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Confirmed",
  assigned: "Team Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled_by_customer: "Cancelled",
  cancelled_by_admin: "Cancelled",
  no_show: "No Show",
};

function seed(): MockDB {
  return {
    customers: [],
    tokens: new Map(),
    otps: new Map(),
    bookings: [],
    nextId: 100,
  };
}

const g = globalThis as typeof globalThis & { __bubbleitMockDb?: MockDB };

export function db(): MockDB {
  g.__bubbleitMockDb ??= seed();
  return g.__bubbleitMockDb;
}

export function makeReference(id: number) {
  return `BK-${String(id).padStart(5, "0")}`;
}

export function isPayable(status: BookingStatus, method: PaymentMethod) {
  return status === "pending_payment" && method === "online";
}
