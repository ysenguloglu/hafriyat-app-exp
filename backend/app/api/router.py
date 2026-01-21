from fastapi import APIRouter

from app.api.routers import (
    admin_dashboard,
    admin_drivers,
    admin_expenses,
    admin_reports,
    admin_vehicles,
    auth,
    jobs,
)


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin_vehicles.router)
api_router.include_router(admin_drivers.router)
api_router.include_router(admin_expenses.router)
api_router.include_router(admin_dashboard.router)
api_router.include_router(admin_reports.router)
api_router.include_router(jobs.router)

