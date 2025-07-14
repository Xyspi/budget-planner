from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    target_amount = Column(Float, nullable=False)
    
    # Relations
    user = relationship("User", back_populates="savings_goals")
    category = relationship("Category", back_populates="savings_goals")