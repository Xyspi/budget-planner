from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..core.database import Base

class CategoryType(PyEnum):
    REVENUE = "revenus"
    BILL = "factures"
    EXPENSE = "dépenses"
    SAVINGS = "épargnes"

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(CategoryType), nullable=False)
    is_credit = Column(Boolean, default=False)  # Pour les factures
    sort_order = Column(Integer, default=0)
    
    # Relations
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budget_forecasts = relationship("BudgetForecast", back_populates="category")
    savings_allocations = relationship("SavingsAllocation", back_populates="category")
    savings_goals = relationship("SavingsGoal", back_populates="category")
    credit_details = relationship("CreditDetail", back_populates="category")