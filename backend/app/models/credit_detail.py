from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class CreditDetail(Base):
    __tablename__ = "credit_details"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    borrowed_amount = Column(Float, nullable=False)
    interest_amount = Column(Float, nullable=False)
    duration_months = Column(Integer, nullable=False)
    interest_rate = Column(Float, nullable=False)
    monthly_payment = Column(Float, nullable=False)
    already_repaid = Column(Float, default=0.0)
    
    # Relations
    user = relationship("User", back_populates="credit_details")
    category = relationship("Category", back_populates="credit_details")