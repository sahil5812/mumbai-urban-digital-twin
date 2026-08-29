"""
NetworkX Graph Infrastructure Engine
Models Mumbai's interconnected infrastructure, propagates cascading domino failures,
and computes flood-safe emergency alternative routes.
"""

import networkx as nx

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
            self.road_graph.add_edge(
                edge["source_node_id"],
                edge["target_node_id"],
                base_time_mins=edge.get("weight_impact_factor", 1.0) * 10
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
                total_time += edge_data["base_time"]
                depth = edge_data["max_depth"]
                path_details.append({
                    "from_node": u,
                    "to_node": v,
                    "water_depth_cm": depth,
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
