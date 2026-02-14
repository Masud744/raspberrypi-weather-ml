from fastapi import APIRouter
from ml.predict import predict_next_30_min

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("/predict")
def predict_weather():
    try:
        return {
            "status": "success",
            "data": predict_next_30_min()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
