from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Hafriyat Firma Takip API")

    # Railway + web/mobile web için CORS zorunlu (UI tarafında bloklanmaması için)
    # CORS_ALLOW_ORIGINS="https://xxx.railway.app,https://yourdomain.com"
    allow_origins_raw = (getattr(settings, "cors_allow_origins", None) or "").strip()
    allow_origins = [o.strip() for o in allow_origins_raw.split(",") if o.strip()]
    if allow_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=allow_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.include_router(api_router)
    return app


app = create_app()
