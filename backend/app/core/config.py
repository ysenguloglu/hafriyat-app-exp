from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Lokal geliştirmede hem `env` hem `.env` desteklenir.
    # Railway deploy'da env var'lar kullanılacağı için dosya zorunlu değildir.
    model_config = SettingsConfigDict(env_file=("env", ".env"), env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="local", alias="APP_ENV")
    app_name: str = Field(default="hafriyat-api", alias="APP_NAME")

    # CORS (Railway / web)
    cors_allow_origins: str = Field(default="", alias="CORS_ALLOW_ORIGINS")

    mysql_dsn: Optional[str] = Field(default=None, alias="MYSQL_DSN")
    mysql_host: str = Field(default="localhost", alias="MYSQL_HOST")
    mysql_port: int = Field(default=3306, alias="MYSQL_PORT")
    mysql_user: str = Field(default="root", alias="MYSQL_USER")
    mysql_password: str = Field(default="", alias="MYSQL_PASSWORD")
    mysql_database: str = Field(default="hafriyat", alias="MYSQL_DATABASE")

    # JWT
    jwt_secret_key: str = Field(default="CHANGE_ME_IN_PROD", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60 * 24 * 7, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.mysql_dsn:
            return self.mysql_dsn
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
            f"?charset=utf8mb4"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
