# LUMÉN Store Dashboard

## API Contract Decisions & Schema (contracts.md)

LUMÉN is a premium immersive e-commerce store metrics and campaign execution system. It runs with full FastAPI + MongoDB integration.

### Modern Database Entities & Collections

#### 1. Products (`products` Collection)
- `id`: `str` (UUID)
- `name`: `str` (e.g., "Amber & Oud")
- `emoji`: `str` (e.g., "🕯️")
- `bg_color`: `str` (e.g., "#3a2a12")
- `price`: `float` (e.g., 68.0)
- `stock`: `int` (e.g., 240)
- `status`: `str` ("In stock" | "Low" | "Out of stock")

#### 2. Orders (`orders` Collection)
- `id`: `str` (Format: `#LMN-XXXX`)
- `product`: `str` (e.g., "Amber & Oud · Large")
- `emoji`: `str` (e.g., "🕯️")
- `bg_color`: `str`
- `customer`: `str`
- `city`: `str`
- `status`: `str` ("paid" | "ship" | "pend")
- `status_text`: `str` ("Paid" | "Shipped" | "Pending")
- `amount`: `float`
- `timestamp`: `datetime`

#### 3. Customers (`customers` Collection)
- `id`: `str` (UUID)
- `name`: `str`
- `location`: `str`
- `orders_count`: `int`
- `spent`: `float`
- `status`: `str` ("VIP" | "Active" | "Inactive")

#### 4. Campaigns (`campaigns` Collection)
- `id`: `str` (UUID)
- `name`: `str`
- `details`: `str`
- `status`: `str` ("live" | "sched" | "done")
- `channel`: `str` ("Email" | "SMS" | "Push")
- `audience`: `str`

#### 5. Notifications (`notifications` Collection)
- `id`: `str` (UUID)
- `title`: `str`
- `details`: `str`
- `read`: `bool`
- `timestamp`: `datetime`

### Endpoints (Base Prefix: `/api`)

- **GET `/api/products`** — Retrieve all product scents
- **POST `/api/products`** — Create product scent
- **PUT `/api/products/{product_id}`** — Edit product limits/prices
- **DELETE `/api/products/{product_id}`** — Remove product scent

- **GET `/api/orders`** — Retrieve orders with optional `status` filter query
- **POST `/api/orders`** — Log a new order transaction and auto-create notification & customer profile record

- **GET `/api/customers`** — Retrieve customer profiles
- **POST `/api/customers`** — Add new customer profile

- **GET `/api/campaigns`** — Retrieve marketing campaigns
- **POST `/api/campaigns`** — Launch or schedule new campaign

- **GET `/api/notifications`** — Retrieve live notification updates
- **PUT `/api/notifications/read`** — Mark all current alerts as read
- **DELETE `/api/notifications`** — Clear notifications logs
