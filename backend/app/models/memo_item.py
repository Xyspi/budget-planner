from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class MemoItem(Base):
    __tablename__ = "memo_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_number = Column(Integer, nullable=False)  # 1-12
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    
    # Relations
    user = relationship("User", back_populates="memo_items")