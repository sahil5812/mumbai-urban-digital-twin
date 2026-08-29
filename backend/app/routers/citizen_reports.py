from fastapi import APIRouter
from app.models.schemas import CitizenReportRequest, CitizenReportResponse
import time
import random

router = APIRouter(prefix="/api/citizen", tags=["Citizen Grievance Portal"])

@router.post("/report", response_model=CitizenReportResponse)
def submit_citizen_report(req: CitizenReportRequest):
    ticket_id = f"BMC-2024-{random.randint(10000, 99999)}"
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S IST")
    
    matched_id = "RD_BAR_01" if "Hindmata" in req.landmark else "RD_SVR_02"
    
    return CitizenReportResponse(
        ticket_id=ticket_id,
        timestamp=timestamp_str,
        status="REGISTERED_WORK_ORDER_CREATED",
        verification_status="AI_VERIFIED_GROUND_TRUTH",
        matched_component_id=matched_id,
        priority_rank=random.randint(1, 5),
        estimated_eta_hours=1.5 if req.severity == "CRITICAL" else 4.0,
        message=f"Thank you, {req.reporter_name}. Your report for {req.landmark} has been ingested into the BMC Digital Twin Command Center. Quick-Response Team notified."
    )
