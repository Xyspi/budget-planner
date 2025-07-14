from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    initial_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    is_savings_account = Column(Boolean, default=False)
    is_main_account = Column(Boolean, default=False)
    
    # Relations
    user = relationship("User", back_populates="accounts")
    transactions_from = relationship("Transaction", foreign_keys="Transaction.account_from_id", back_populates="account_from")
    transactions_to = relationship("Transaction", foreign_keys="Transaction.account_to_id", back_populates="account_to")
    savings_allocations = relationship("SavingsAllocation", back_populates="account")