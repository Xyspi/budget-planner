from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class BudgetForecast(Base):
    __tablename__ = "budget_forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_number = Column(Integer, nullable=False)  # 1-12
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    forecasted_amount = Column(Float, default=0.0)
    
    # Relations
    user = relationship("User", back_populates="budget_forecasts")
    category = relationship("Category", back_populates="budget_forecasts")