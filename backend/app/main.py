from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .routers import auth, config, transactions, budget

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, category, account, transaction, budget_forecast, memo_item, savings_allocation, savings_goal, credit_detail

# Création des tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Budget Planner API",
    description="API pour l'application Budget Planner",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(config.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(budget.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Budget Planner API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}