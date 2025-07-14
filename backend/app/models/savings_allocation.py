from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class SavingsAllocation(Base):
    __tablename__ = "savings_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    
    # Relations
    user = relationship("User", back_populates="savings_allocations")
    category = relationship("Category", back_populates="savings_allocations")
    account = relationship("Account", back_populates="savings_allocations")