from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from database import Base
import datetime

class DeviceModel(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)
    mac = Column(String, index=True)
    ip = Column(String)
    ssid = Column(String)
    vendor = Column(String)
    rssi = Column(Integer)
    status = Column(String)
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    threat_score = Column(Integer, default=0)
    is_blocked = Column(Boolean, default=False)
    location = Column(String)

class EventLogModel(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    level = Column(String)
    message = Column(String)
