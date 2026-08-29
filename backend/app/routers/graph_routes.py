from fastapi import APIRouter, Query
from app.models.schemas import CascadingGraphResponse
from app.models.graph_engine import MumbaiInfrastructureGraph
from app.data.mumbai_data_loader import load_master_infrastructure

router = APIRouter(prefix="/api/graph", tags=["Infrastructure Graph & Routing"])

infra = load_master_infrastructure()
graph_engine = MumbaiInfrastructureGraph()

def init_graph():
    all_nodes = infra["hotspots"] + infra["roads"] + infra["drains"] + infra["pumping_stations"]
    graph_engine.build_graph(all_nodes, infra["edges"])

init_graph()

@router.get("/cascading-topology", response_model=CascadingGraphResponse)
def get_cascading_topology():
    init_graph()
    cascade_res = graph_engine.propagate_cascading_failures(failure_threshold_risk=50.0)
    g_dict = graph_engine.get_graph_dict()
    
    return CascadingGraphResponse(
        nodes=g_dict["nodes"],
        edges=g_dict["edges"],
        active_cascade_chains=cascade_res["cascade_chains"],
        total_impacted_nodes=cascade_res["total_impacted_nodes"]
    )

@router.get("/safe-route")
def get_flood_safe_route(
    origin: str = Query("RD_MDR_01", description="Origin Node ID (e.g. Marine Drive)"),
    destination: str = Query("WL_AND_01", description="Destination Node ID (e.g. Andheri Subway)"),
    rainfall_mm_hr: float = Query(150.0, description="Current Rainfall Intensity")
):
    """
    Flood-Safe Emergency Routing API:
    Suggests alternative navigation routes that actively bypass submerged subways and gridlocked corridors.
    """
    init_graph()
    # High-rainfall simulation depth map
    depth_map = {}
    if rainfall_mm_hr >= 100:
        depth_map["WL_HND_01"] = 122.0  # Hindmata submerged
        depth_map["WL_MLN_01"] = 123.0  # Milan submerged
        depth_map["WL_AND_01"] = 123.0  # Andheri submerged
        depth_map["WL_KRL_01"] = 122.0  # Kurla submerged
    
    route_result = graph_engine.calculate_safe_route(origin, destination, depth_map)
    return route_result
