from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import uuid
from datetime import datetime
import pandas as pd
import json
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ChartData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    data: List[Dict[str, Any]]
    columns: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChartConfig(BaseModel):
    chart_type: str
    x_axis: str
    y_axis: str
    colors: Dict[str, str] = {}
    title: str = ""

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Convert DataFrame to dict and handle NaN values
        data = df.fillna("").to_dict('records')
        columns = df.columns.tolist()
        
        chart_data = ChartData(
            filename=file.filename,
            data=data,
            columns=columns
        )
        
        # Store in database
        result = await db.chart_data.insert_one(chart_data.dict())
        chart_data.id = str(result.inserted_id)
        
        return {
            "id": chart_data.id,
            "filename": chart_data.filename,
            "columns": columns,
            "row_count": len(data),
            "sample_data": data[:5] if data else []
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

@api_router.get("/chart-data/{data_id}")
async def get_chart_data(data_id: str):
    try:
        chart_data = await db.chart_data.find_one({"_id": data_id})
        if not chart_data:
            raise HTTPException(status_code=404, detail="Chart data not found")
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/sample-data")
async def get_sample_data():
    sample_datasets = [
        {
            "name": "Sales Data",
            "filename": "sales_sample.csv",
            "data": [
                {"Month": "Jan", "Sales": 4000, "Profit": 2400, "Expenses": 1600},
                {"Month": "Feb", "Sales": 3000, "Profit": 1398, "Expenses": 1602},
                {"Month": "Mar", "Sales": 2000, "Profit": 9800, "Expenses": 2000},
                {"Month": "Apr", "Sales": 2780, "Profit": 3908, "Expenses": 1800},
                {"Month": "May", "Sales": 1890, "Profit": 4800, "Expenses": 1500},
                {"Month": "Jun", "Sales": 2390, "Profit": 3800, "Expenses": 1700}
            ],
            "columns": ["Month", "Sales", "Profit", "Expenses"]
        },
        {
            "name": "Temperature Data",
            "filename": "temperature_sample.csv", 
            "data": [
                {"City": "New York", "Jan": 32, "Feb": 35, "Mar": 45, "Apr": 55, "May": 65},
                {"City": "Los Angeles", "Jan": 60, "Feb": 62, "Mar": 65, "Apr": 68, "May": 72},
                {"City": "Chicago", "Jan": 25, "Feb": 28, "Mar": 38, "Apr": 50, "May": 62},
                {"City": "Miami", "Jan": 70, "Feb": 72, "Mar": 75, "Apr": 78, "May": 82}
            ],
            "columns": ["City", "Jan", "Feb", "Mar", "Apr", "May"]
        },
        {
            "name": "Website Analytics",
            "filename": "analytics_sample.csv",
            "data": [
                {"Page": "Home", "Views": 15000, "Bounce Rate": 35, "Time on Page": 120},
                {"Page": "About", "Views": 8500, "Bounce Rate": 42, "Time on Page": 90},
                {"Page": "Products", "Views": 12000, "Bounce Rate": 28, "Time on Page": 180},
                {"Page": "Contact", "Views": 3500, "Bounce Rate": 55, "Time on Page": 60},
                {"Page": "Blog", "Views": 6200, "Bounce Rate": 38, "Time on Page": 210}
            ],
            "columns": ["Page", "Views", "Bounce Rate", "Time on Page"]
        }
    ]
    return sample_datasets

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
