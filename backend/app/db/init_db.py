from app.db.base import Base
from app.db.session import engine

# Model importları tablo kayıtlarını Base metadata'ya ekler.
from app import models  # noqa: F401


def create_all():
    Base.metadata.create_all(bind=engine)
