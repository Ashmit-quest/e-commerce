from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# --- PYDANTIC SCHEMAS ---

class ProductSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    emoji: str
    bg_color: str
    price: float
    stock: int
    status: str  # "In stock" or "Low" or "Out of stock"


class ProductCreate(BaseModel):
    name: str
    emoji: str
    bg_color: str
    price: float
    stock: int
    status: str


class OrderSchema(BaseModel):
    id: str = Field(default_factory=lambda: f"#LMN-{uuid.uuid4().hex[:4].upper()}")
    product: str
    emoji: str
    bg_color: str
    customer: str
    city: str
    status: str  # "paid" | "ship" | "pend"
    status_text: str  # "Paid" | "Shipped" | "Pending"
    amount: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderCreate(BaseModel):
    product: str
    emoji: str
    bg_color: str
    customer: str
    city: str
    status: str
    status_text: str
    amount: float


class CustomerSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    orders_count: int
    spent: float
    status: str  # "VIP" | "Active" | "Inactive"


class CustomerCreate(BaseModel):
    name: str
    location: str
    orders_count: int = 0
    spent: float = 0.0
    status: str = "Active"


class CampaignSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    details: str
    status: str  # "live" | "sched" | "done"
    channel: str  # "Email" | "SMS" | "Push"
    audience: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CampaignCreate(BaseModel):
    name: str
    details: str
    status: str
    channel: str
    audience: str


class NotificationSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    details: str
    read: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# --- HELPERS ---

def format_doc(doc: dict) -> dict:
    if "_id" in doc:
        doc.pop("_id")
    return doc


# --- INITIAL DATA SEEDING ON STARTUP ---

@app.on_event("startup")
async def seed_data():
    # Seed Products
    if await db.products.count_documents({}) == 0:
        initial_products = [
            ProductSchema(
                name="Amber & Oud", emoji="🕯️", bg_color="#3a2a12",
                price=68.0, stock=240, status="In stock"
            ),
            ProductSchema(
                name="Eucalyptus Diffuser", emoji="🌿", bg_color="#123a1f",
                price=42.0, stock=180, status="In stock"
            ),
            ProductSchema(
                name="Ember Trio Set", emoji="🔥", bg_color="#3a1212",
                price=96.0, stock=22, status="Low"
            ),
            ProductSchema(
                name="Cedar Room Spray", emoji="💧", bg_color="#12233a",
                price=24.0, stock=96, status="In stock"
            ),
            ProductSchema(
                name="Fig & Vetiver", emoji="🕯️", bg_color="#2a123a",
                price=58.0, stock=140, status="In stock"
            ),
            ProductSchema(
                name="Smoked Vanilla", emoji="🍮", bg_color="#3a2a12",
                price=54.0, stock=12, status="Low"
            ),
            ProductSchema(
                name="Sea Salt Candle", emoji="🌊", bg_color="#123a3a",
                price=49.0, stock=210, status="In stock"
            ),
            ProductSchema(
                name="Bergamot Refill", emoji="🍊", bg_color="#3a3312",
                price=19.0, stock=320, status="In stock"
            )
        ]
        await db.products.insert_many([p.model_dump() for p in initial_products])

    # Seed Orders
    if await db.orders.count_documents({}) == 0:
        initial_orders = [
            OrderSchema(
                product="Amber & Oud · Large", emoji="🕯️", bg_color="#3a2a12",
                customer="Maya Chen", city="London", status="paid",
                status_text="Paid", amount=68.0
            ),
            OrderSchema(
                product="Eucalyptus Diffuser", emoji="🌿", bg_color="#123a1f",
                customer="Liam Novak", city="New York", status="ship",
                status_text="Shipped", amount=42.0
            ),
            OrderSchema(
                product="Ember Trio Gift Set", emoji="🔥", bg_color="#3a1212",
                customer="Sofia Reyes", city="Paris", status="pend",
                status_text="Pending", amount=96.0
            ),
            OrderSchema(
                product="Cedar Room Spray", emoji="💧", bg_color="#12233a",
                customer="Noah Kim", city="Tokyo", status="paid",
                status_text="Paid", amount=24.0
            ),
            OrderSchema(
                product="Fig & Vetiver · Mini", emoji="🕯️", bg_color="#2a123a",
                customer="Elena Duarte", city="Berlin", status="paid",
                status_text="Paid", amount=19.0
            ),
            OrderSchema(
                product="Smoked Vanilla", emoji="🍮", bg_color="#3a2a12",
                customer="Jonas Pike", city="Toronto", status="ship",
                status_text="Shipped", amount=54.0
            ),
            OrderSchema(
                product="Sea Salt Candle", emoji="🌊", bg_color="#123a3a",
                customer="Priya Rao", city="Sydney", status="paid",
                status_text="Paid", amount=49.0
            )
        ]
        await db.orders.insert_many([o.model_dump() for o in initial_orders])

    # Seed Customers
    if await db.customers.count_documents({}) == 0:
        initial_customers = [
            CustomerSchema(
                name="Maya Chen", location="London", orders_count=12,
                spent=820.0, status="VIP"
            ),
            CustomerSchema(
                name="Liam Novak", location="New York", orders_count=8,
                spent=420.0, status="Active"
            ),
            CustomerSchema(
                name="Sofia Reyes", location="Paris", orders_count=5,
                spent=380.0, status="Active"
            ),
            CustomerSchema(
                name="Noah Kim", location="Tokyo", orders_count=15,
                spent=1200.0, status="VIP"
            ),
            CustomerSchema(
                name="Elena Duarte", location="Berlin", orders_count=3,
                spent=190.0, status="Active"
            ),
            CustomerSchema(
                name="Jonas Pike", location="Toronto", orders_count=14,
                spent=980.0, status="VIP"
            )
        ]
        await db.customers.insert_many([c.model_dump() for c in initial_customers])

    # Seed Campaigns
    if await db.campaigns.count_documents({}) == 0:
        initial_campaigns = [
            CampaignSchema(
                name="Summer Solstice", details="Email · 8,420 sent · 34% open",
                status="done", channel="Email", audience="All subscribers"
            ),
            CampaignSchema(
                name="Autumn Ember teaser", details="Email · scheduled 6:00 PM",
                status="sched", channel="Email", audience="VIP buyers"
            ),
            CampaignSchema(
                name="Flash restock: Ember Trio",
                details="SMS · live now · 1,204 clicks", status="live",
                channel="SMS", audience="VIP buyers"
            ),
            CampaignSchema(
                name="Welcome flow", details="Automated · always on",
                status="live", channel="Email", audience="All subscribers"
            ),
            CampaignSchema(
                name="Winback — 90 days", details="Email · draft",
                status="done", channel="Email", audience="Cart abandoners"
            )
        ]
        await db.campaigns.insert_many([c.model_dump() for c in initial_campaigns])

    # Seed Notifications
    if await db.notifications.count_documents({}) == 0:
        initial_notifications = [
            NotificationSchema(
                title="New order received",
                details="Priya Rao purchased Sea Salt Candle ($49.00)",
                read=False
            ),
            NotificationSchema(
                title="Inventory limit reached",
                details="Smoked Vanilla candle is low in stock (12 left)",
                read=False
            ),
            NotificationSchema(
                title="Campaign launched successfully",
                details="“Summer Solstice” has been delivered",
                read=True
            )
        ]
        await db.notifications.insert_many([n.model_dump() for n in initial_notifications])


# --- API ROUTES ---

@api_router.get("/")
async def root():
    return {"message": "LUMÉN API is fully glowing"}


# PRODUCTS ENDPOINTS

@api_router.get("/products", response_model=List[ProductSchema])
async def get_products():
    docs = await db.products.find({}).to_list(1000)
    return [ProductSchema(**format_doc(d)) for d in docs]


@api_router.post("/products", response_model=ProductSchema)
async def create_product(product: ProductCreate):
    p_obj = ProductSchema(**product.model_dump())
    await db.products.insert_one(p_obj.model_dump())
    return p_obj


@api_router.put("/products/{product_id}", response_model=ProductSchema)
async def update_product(product_id: str, product_data: ProductCreate):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updated_dict = product_data.model_dump()
    updated_dict["id"] = product_id
    await db.products.replace_one({"id": product_id}, updated_dict)
    return ProductSchema(**updated_dict)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ORDERS ENDPOINTS

@api_router.get("/orders", response_model=List[OrderSchema])
async def get_orders(status: Optional[str] = None):
    query = {}
    if status and status != "all":
        query["status"] = status
    docs = await db.orders.find(query).sort("timestamp", -1).to_list(1000)
    return [OrderSchema(**format_doc(d)) for d in docs]


@api_router.post("/orders", response_model=OrderSchema)
async def create_order(order: OrderCreate):
    o_obj = OrderSchema(**order.model_dump())
    await db.orders.insert_one(o_obj.model_dump())

    # Trigger a real-time notification
    notif = NotificationSchema(
        title="New Order Received",
        details=f"{o_obj.customer} purchased {o_obj.product} (${o_obj.amount:.2f})"
    )
    await db.notifications.insert_one(notif.model_dump())

    # Add spent to customer if they exist, or create customer
    customer = await db.customers.find_one({"name": o_obj.customer})
    if customer:
        await db.customers.update_one(
            {"name": o_obj.customer},
            {"$inc": {"orders_count": 1, "spent": o_obj.amount}}
        )
    else:
        new_cust = CustomerSchema(
            name=o_obj.customer,
            location=o_obj.city,
            orders_count=1,
            spent=o_obj.amount,
            status="Active"
        )
        await db.customers.insert_one(new_cust.model_dump())

    return o_obj


# CUSTOMERS ENDPOINTS

@api_router.get("/customers", response_model=List[CustomerSchema])
async def get_customers():
    docs = await db.customers.find({}).to_list(1000)
    return [CustomerSchema(**format_doc(d)) for d in docs]


@api_router.post("/customers", response_model=CustomerSchema)
async def create_customer(customer: CustomerCreate):
    c_obj = CustomerSchema(**customer.model_dump())
    await db.customers.insert_one(c_obj.model_dump())
    return c_obj


# CAMPAIGNS ENDPOINTS

@api_router.get("/campaigns", response_model=List[CampaignSchema])
async def get_campaigns():
    docs = await db.campaigns.find({}).sort("timestamp", -1).to_list(1000)
    return [CampaignSchema(**format_doc(d)) for d in docs]


@api_router.post("/campaigns", response_model=CampaignSchema)
async def create_campaign(campaign: CampaignCreate):
    c_obj = CampaignSchema(**campaign.model_dump())
    await db.campaigns.insert_one(c_obj.model_dump())
    return c_obj


# NOTIFICATIONS ENDPOINTS

@api_router.get("/notifications", response_model=List[NotificationSchema])
async def get_notifications():
    docs = await db.notifications.find({}).sort("timestamp", -1).to_list(100)
    return [NotificationSchema(**format_doc(d)) for d in docs]


@api_router.put("/notifications/read")
async def mark_all_notifications_read():
    await db.notifications.update_many({"read": False}, {"$set": {"read": True}})
    return {"message": "All notifications marked read"}


@api_router.delete("/notifications")
async def clear_notifications():
    await db.notifications.delete_many({})
    return {"message": "Notifications cleared"}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
