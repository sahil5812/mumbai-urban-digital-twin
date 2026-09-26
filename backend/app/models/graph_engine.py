"""
NetworkX Graph Infrastructure Engine
Models Mumbai's interconnected infrastructure, propagates cascading domino failures,
and computes flood-safe emergency alternative routes.
"""

import networkx as nx
import math

def _haversine_km(lon1, lat1, lon2, lat2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

class MumbaiInfrastructureGraph:
    def __init__(self):
        self.G = nx.DiGraph()
        self.road_graph = nx.Graph()

    def build_graph(self, nodes_data, edges_data):
        self.G.clear()
        self.road_graph.clear()
        
        for node in nodes_data:
            self.G.add_node(
                node["id"],
                label=node["name"],
                type=node["type"],
                ward=node["ward"],
                elev=node.get("elevation_m", 4.0),
                health=node.get("health_score", 80.0),
                risk=node.get("failure_risk_score", 20.0),
                water_depth=node.get("water_depth_cm", 0.0),
                status=node.get("status", "SAFE"),
                lat=node.get("latitude", 19.07),
                lon=node.get("longitude", 72.87)
            )
            # Add to navigable road graph
            self.road_graph.add_node(
                node["id"],
                label=node["name"],
                type=node["type"],
                water_depth=node.get("water_depth_cm", 0.0),
                risk=node.get("failure_risk_score", 20.0),
                lat=node.get("latitude", 19.07),
                lon=node.get("longitude", 72.87)
            )

        for edge in edges_data:
            self.G.add_edge(
                edge["source_node_id"],
                edge["target_node_id"],
                type=edge["relationship_type"],
                weight=edge["weight_impact_factor"],
                description=edge.get("description", "")
            )
            # Build road network connectivity
            base_time = edge.get("base_time_mins")
            if base_time is None:
                dist_km = edge.get("distance_km", edge.get("weight_impact_factor", 2.0))
                base_time = round(max(1.0, float(dist_km) * 1.5), 1)
            self.road_graph.add_edge(
                edge["source_node_id"],
                edge["target_node_id"],
                base_time_mins=base_time
            )

    def propagate_cascading_failures(self, failure_threshold_risk=65.0):
        impacted_nodes = set()
        cascade_chains = []

        seed_nodes = [
            n for n, attr in self.G.nodes(data=True)
            if attr.get("risk", 0.0) >= failure_threshold_risk or attr.get("water_depth", 0.0) >= 20.0
        ]

        for seed in seed_nodes:
            impacted_nodes.add(seed)
            for successor in self.G.successors(seed):
                impacted_nodes.add(successor)
                chain = [seed, successor]
                for second_hop in self.G.successors(successor):
                    impacted_nodes.add(second_hop)
                    chain.append(second_hop)
                cascade_chains.append(chain)

        return {
            "seed_failure_nodes": seed_nodes,
            "cascade_chains": cascade_chains,
            "total_impacted_nodes": len(impacted_nodes),
            "impacted_node_ids": list(impacted_nodes)
        }

    def calculate_safe_route(self, origin_id: str, destination_id: str, water_depth_map: dict = None):
        """
        Dijkstra shortest path with dynamic inundation penalties:
        Roads with >30cm water depth receive heavy cost multipliers to force flood-free rerouting.
        """
        water_depth_map = water_depth_map or {}
        
        # Build weighted cost graph
        cost_G = nx.Graph()
        for u, v, d in self.road_graph.edges(data=True):
            base_mins = d.get("base_time_mins", 12.0)
            u_depth = water_depth_map.get(u, self.road_graph.nodes[u].get("water_depth", 0.0))
            v_depth = water_depth_map.get(v, self.road_graph.nodes[v].get("water_depth", 0.0))
            max_depth = max(u_depth, v_depth)

            # Inundation penalty formula
            if max_depth >= 50.0:
                cost = base_mins * 50.0 + 9999.0 # Impassable
            elif max_depth >= 20.0:
                cost = base_mins * (1.0 + (max_depth / 8.0)) # Severe slowdown
            else:
                cost = base_mins # Normal speed

            cost_G.add_edge(u, v, weight=cost, base_time=base_mins, max_depth=max_depth)

        try:
            if origin_id not in cost_G or destination_id not in cost_G:
                nodes = list(cost_G.nodes())
                origin_id = origin_id if origin_id in cost_G else (nodes[0] if nodes else "")
                destination_id = destination_id if destination_id in cost_G else (nodes[-1] if nodes else "")

            path = nx.dijkstra_path(cost_G, origin_id, destination_id, weight="weight")
            
            total_time = 0.0
            avoided_floods = []
            path_details = []

            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge_data = cost_G[u][v]
                depth = edge_data["max_depth"]
                slowdown_factor = (1.0 + (depth / 20.0)) if depth >= 15.0 else 1.0
                total_time += round(edge_data["base_time"] * slowdown_factor, 1)
                path_details.append({
                    "from_node": u,
                    "to_node": v,
                    "water_depth_cm": round(depth, 1),
                    "segment_status": "FLOOD_FREE" if depth < 15 else ("SLOW" if depth < 40 else "SUBMERGED")
                })

            # Check if any standard route nodes were avoided due to flood
            for n, d in self.road_graph.nodes(data=True):
                depth = water_depth_map.get(n, d.get("water_depth", 0.0))
                if depth >= 40.0 and n not in path:
                    avoided_floods.append({
                        "node_id": n,
                        "name": d.get("label", n),
                        "water_depth_cm": depth,
                        "reason": f"Submerged by {depth:.1f} cm floodwater (Route Diverted)"
                    })

            return {
                "origin": origin_id,
                "destination": destination_id,
                "is_flood_safe": True,
                "recommended_path": path,
                "path_waypoints": [self.road_graph.nodes[n].get("label", n) for n in path],
                "estimated_transit_time_mins": round(total_time, 1),
                "submerged_hazards_avoided": avoided_floods,
                "route_segments": path_details
            }
        except Exception as e:
            return {
                "origin": origin_id,
                "destination": destination_id,
                "is_flood_safe": False,
                "error": str(e),
                "fallback_advisory": "Take Western Express Highway Elevated Corridor."
            }

    def find_nearest_road_node(self, lng, lat):
        min_dist = float('inf')
        nearest_node = None
        node_data = None
        for n, d in self.road_graph.nodes(data=True):
            n_lat = d.get("lat")
            n_lon = d.get("lon")
            if n_lat is not None and n_lon is not None:
                dist = _haversine_km(lng, lat, n_lon, n_lat)
                if dist < min_dist:
                    min_dist = dist
                    nearest_node = n
                    node_data = d
        return nearest_node, min_dist, node_data

    def calculate_safe_route_with_coords(self, origin_id, destination_id, water_depth_map=None):
        base_result = self.calculate_safe_route(origin_id, destination_id, water_depth_map)
        
        if base_result.get("error"):
            return {
                "distance_km": 0.0,
                "duration_min": 0.0,
                "risk_score": 0.0,
                "risk_level": "LOW",
                "origin_node": origin_id,
                "destination_node": destination_id,
                "origin_name": self.road_graph.nodes[origin_id].get("label", origin_id) if origin_id in self.road_graph else origin_id,
                "destination_name": self.road_graph.nodes[destination_id].get("label", destination_id) if destination_id in self.road_graph else destination_id,
                "is_flood_safe": False,
                "segments": [],
                "hazards_avoided": [],
                "advisory": base_result.get("fallback_advisory", "")
            }

        total_distance = 0.0
        enriched_segments = []
        path = base_result.get("recommended_path", [])
        
        for i in range(len(path) - 1):
            u = path[i]
            v = path[i+1]
            u_data = self.road_graph.nodes[u]
            v_data = self.road_graph.nodes[v]
            
            u_lng, u_lat = u_data.get("lon", 0), u_data.get("lat", 0)
            v_lng, v_lat = v_data.get("lon", 0), v_data.get("lat", 0)
            dist = _haversine_km(u_lng, u_lat, v_lng, v_lat)
            total_distance += dist
            
            u_depth = water_depth_map.get(u, u_data.get("water_depth", 0.0)) if water_depth_map else u_data.get("water_depth", 0.0)
            v_depth = water_depth_map.get(v, v_data.get("water_depth", 0.0)) if water_depth_map else v_data.get("water_depth", 0.0)
            max_depth = max(u_depth, v_depth)
            
            risk = min(max_depth / 50.0, 1.0)
            if max_depth < 15:
                risk_level = "LOW"
            elif max_depth < 40:
                risk_level = "MEDIUM"
            else:
                risk_level = "HIGH"
                
            edge_data = self.road_graph.get_edge_data(u, v, {})
            duration_min = edge_data.get("base_time_mins", 12.0)
            
            enriched_segments.append({
                "path": [[u_lng, u_lat], [v_lng, v_lat]],
                "from_node": u,
                "to_node": v,
                "from_name": u_data.get("label", u),
                "to_name": v_data.get("label", v),
                "distance_km": round(dist, 3),
                "duration_min": duration_min,
                "water_depth_cm": round(max_depth, 1),
                "risk": round(risk, 2),
                "risk_level": risk_level,
                "segment_status": "FLOOD_FREE" if max_depth < 15 else ("SLOW" if max_depth < 40 else "SUBMERGED")
            })
            
        avg_risk = sum(s["risk"] for s in enriched_segments) / len(enriched_segments) if enriched_segments else 0.0
        if avg_risk < 0.3:
            overall_risk_level = "LOW"
        elif avg_risk < 0.8:
            overall_risk_level = "MEDIUM"
        else:
            overall_risk_level = "HIGH"
            
        enriched_hazards = []
        for h in base_result.get("submerged_hazards_avoided", []):
            nid = h.get("node_id")
            if nid in self.road_graph:
                ndata = self.road_graph.nodes[nid]
                h["lat"] = ndata.get("lat")
                h["lng"] = ndata.get("lon")
            enriched_hazards.append(h)
            
        return {
            "distance_km": round(total_distance, 3),
            "duration_min": base_result.get("estimated_transit_time_mins", 0.0),
            "risk_score": round(avg_risk, 2),
            "risk_level": overall_risk_level,
            "origin_node": origin_id,
            "destination_node": destination_id,
            "origin_name": self.road_graph.nodes[origin_id].get("label", origin_id) if origin_id in self.road_graph else origin_id,
            "destination_name": self.road_graph.nodes[destination_id].get("label", destination_id) if destination_id in self.road_graph else destination_id,
            "is_flood_safe": base_result.get("is_flood_safe", False),
            "segments": enriched_segments,
            "hazards_avoided": enriched_hazards,
            "advisory": base_result.get("fallback_advisory", "")
        }

    def get_graph_dict(self):
        nodes_list = []
        for n, d in self.G.nodes(data=True):
            nodes_list.append({
                "id": n,
                "label": d.get("label", n),
                "type": d.get("type", "ROAD"),
                "ward": d.get("ward", "F/S"),
                "status": d.get("status", "SAFE"),
                "health_score": d.get("health", 80.0),
                "failure_risk_score": d.get("risk", 20.0),
                "water_depth_cm": d.get("water_depth", 0.0),
                "lat": d.get("lat", 19.07),
                "lon": d.get("lon", 72.87)
            })

        edges_list = []
        for u, v, d in self.G.edges(data=True):
            edges_list.append({
                "source": u,
                "target": v,
                "type": d.get("type", "HYDRAULIC_RUNOFF"),
                "weight": d.get("weight", 1.0),
                "active": True,
                "description": d.get("description", "")
            })

        return {"nodes": nodes_list, "edges": edges_list}
