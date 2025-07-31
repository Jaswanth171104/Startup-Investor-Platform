# Import all models to ensure they are registered with SQLAlchemy
from .base import Base
from .Auth_models import User, OTP
from .Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from .Investor_profile_models import InvestorProfile
from .Application_models import Application, ApplicationLog, InterestStatus

__all__ = [
    'Base',
    'User',
    'OTP', 
    'StartupProfile',
    'Founder',
    'StartupRevenueMetrics',
    'FundUsage',
    'InvestorProfile',
    'Application',
    'ApplicationLog',
    'InterestStatus'
]
