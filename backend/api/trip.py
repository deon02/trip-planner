from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import TripRequest
from agents.orchestrator import run_orchestrator, run_orchestrator_stream

router = APIRouter()


@router.post("/trip")
async def create_trip(request: TripRequest):
    try:
        result = await run_orchestrator(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/trip/stream")
async def stream_trip(request: TripRequest):
    return StreamingResponse(
        run_orchestrator_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
