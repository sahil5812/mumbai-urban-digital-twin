"""
Mumbai Infrastructure Master Data Loader
Loads and initializes roads, drains, hotspots, and topology edges.
"""

def load_master_infrastructure():
    roads = [
        {"id": "RD_WEH_01", "name": "Western Express Highway (Bandra-Santacruz)", "type": "ROAD", "ward": "H/E", "surface": "Asphalt Over CC", "lanes": 8, "elev_m": 5.2, "pci": 72, "pcu": 145000, "lat": 19.068, "lon": 72.847},
        {"id": "RD_WEH_02", "name": "Western Express Highway (Santacruz-Andheri)", "type": "ROAD", "ward": "K/E", "surface": "Mastic Asphalt", "lanes": 8, "elev_m": 6.8, "pci": 68, "pcu": 140000, "lat": 19.105, "lon": 72.855},
        {"id": "RD_SVR_02", "name": "SV Road (Milan Subway Approach)", "type": "ROAD", "ward": "H/W", "surface": "Bituminous Asphalt", "lanes": 4, "elev_m": 2.2, "pci": 44, "pcu": 85000, "lat": 19.083, "lon": 72.838},
        {"id": "RD_SVR_04", "name": "SV Road (Andheri Subway Section)", "type": "ROAD", "ward": "K/W", "surface": "Bituminous Asphalt", "lanes": 4, "elev_m": 1.9, "pci": 39, "pcu": 88000, "lat": 19.125, "lon": 72.841},
        {"id": "RD_EEH_01", "name": "Eastern Express Highway (Sion-Priyadarshini)", "type": "ROAD", "ward": "F/N", "surface": "Asphalt Over CC", "lanes": 8, "elev_m": 2.3, "pci": 62, "pcu": 130000, "lat": 19.045, "lon": 72.871},
        {"id": "RD_EEH_02", "name": "Eastern Express Highway (Kurla-Ghatkopar)", "type": "ROAD", "ward": "L", "surface": "Mastic Asphalt", "lanes": 8, "elev_m": 3.5, "pci": 70, "pcu": 125000, "lat": 19.078, "lon": 72.892},
        {"id": "RD_BAR_01", "name": "Dr. Babasaheb Ambedkar Road (Hindmata)", "type": "ROAD", "ward": "F/S", "surface": "Cement Concrete", "lanes": 6, "elev_m": 2.4, "pci": 65, "pcu": 110000, "lat": 19.012, "lon": 72.843},
        {"id": "RD_LBS_01", "name": "LBS Marg (Kurla Kamani Section)", "type": "ROAD", "ward": "L", "surface": "Bituminous Asphalt", "lanes": 4, "elev_m": 2.1, "pci": 42, "pcu": 92000, "lat": 19.068, "lon": 72.881},
        {"id": "RD_MDR_01", "name": "Marine Drive (Netaji Subhash Road)", "type": "ROAD", "ward": "A", "surface": "Cement Concrete", "lanes": 8, "elev_m": 5.8, "pci": 92, "pcu": 90000, "lat": 18.941, "lon": 72.822},
        {"id": "RD_BKC_01", "name": "BKC Avenue / G-Block Central", "type": "ROAD", "ward": "H/E", "surface": "Cement Concrete", "lanes": 6, "elev_m": 4.5, "pci": 88, "pcu": 80000, "lat": 19.065, "lon": 72.868},
    ]

    hotspots = [
        {"id": "WL_HND_01", "name": "Hindmata Cinema Junction", "type": "HOTSPOT", "ward": "F/S", "elev_m": 2.2, "lat": 19.0125, "lon": 72.8432, "is_subway": False, "pop_exposure": 9.5, "traffic_exposure": 9.2},
        {"id": "WL_MLN_01", "name": "Milan Subway (Santacruz)", "type": "HOTSPOT", "ward": "H/W", "elev_m": 1.8, "lat": 19.0832, "lon": 72.8395, "is_subway": True, "pop_exposure": 8.8, "traffic_exposure": 9.5},
        {"id": "WL_AND_01", "name": "Andheri Subway", "type": "HOTSPOT", "ward": "K/W", "elev_m": 1.6, "lat": 19.1194, "lon": 72.8441, "is_subway": True, "pop_exposure": 9.0, "traffic_exposure": 9.6},
        {"id": "WL_KRL_01", "name": "Kurla Kamani / LBS Jn", "type": "HOTSPOT", "ward": "L", "elev_m": 2.1, "lat": 19.0682, "lon": 72.8814, "is_subway": False, "pop_exposure": 9.8, "traffic_exposure": 9.0},
        {"id": "WL_SION_01", "name": "Sion Circle / Gandhi Market", "type": "HOTSPOT", "ward": "F/N", "elev_m": 2.0, "lat": 19.0385, "lon": 72.8621, "is_subway": False, "pop_exposure": 9.2, "traffic_exposure": 9.4},
        {"id": "WL_CHM_01", "name": "Chembur Postal Colony", "type": "HOTSPOT", "ward": "M/W", "elev_m": 2.3, "lat": 19.0581, "lon": 72.8954, "is_subway": False, "pop_exposure": 8.5, "traffic_exposure": 7.8},
        {"id": "WL_DAH_01", "name": "Dahisar Check Naka Lowline", "type": "HOTSPOT", "ward": "R/N", "elev_m": 3.2, "lat": 19.2562, "lon": 72.8681, "is_subway": False, "pop_exposure": 8.2, "traffic_exposure": 8.5},
    ]

    drains = [
        {"id": "DRN_MIT_02", "name": "Mithi River (Powai to Kurla SCLR)", "type": "DRAIN", "ward": "L", "elev_m": 2.5, "capacity_cumecs": 280.0, "catchment_sqkm": 45.0, "lat": 19.072, "lon": 72.875},
        {"id": "DRN_MIT_03", "name": "Mithi River (Kurla to Mahim Bay)", "type": "DRAIN", "ward": "G/N", "elev_m": 1.2, "capacity_cumecs": 450.0, "catchment_sqkm": 72.0, "lat": 19.055, "lon": 72.852},
        {"id": "DRN_VAK_01", "name": "Vakola Nallah (Santacruz to Mithi)", "type": "DRAIN", "ward": "H/E", "elev_m": 3.2, "capacity_cumecs": 85.0, "catchment_sqkm": 14.2, "lat": 19.078, "lon": 72.858},
        {"id": "DRN_IRL_01", "name": "Irla Nallah (Andheri to Juhu Sea)", "type": "DRAIN", "ward": "K/W", "elev_m": 2.2, "capacity_cumecs": 80.0, "catchment_sqkm": 15.2, "lat": 19.112, "lon": 72.835},
        {"id": "DRN_GAZ_01", "name": "Gazdarband Nallah (Khar Danda)", "type": "DRAIN", "ward": "H/W", "elev_m": 2.0, "capacity_cumecs": 65.0, "catchment_sqkm": 11.0, "lat": 19.076, "lon": 72.832},
        {"id": "DRN_HND_01", "name": "Hindmata Underground Tank & Box Drain", "type": "DRAIN", "ward": "F/S", "elev_m": 1.8, "capacity_cumecs": 55.0, "catchment_sqkm": 8.5, "lat": 19.011, "lon": 72.842},
    ]

    pumping_stations = [
        {"id": "PMP_BRITANNIA_01", "name": "Britannia Stormwater Pumping Station (Reay Road)", "type": "PUMP", "ward": "E", "elev_m": 1.5, "capacity_cumecs": 36.0, "lat": 18.985, "lon": 72.845},
        {"id": "PMP_HAJIALI_01", "name": "Haji Ali Stormwater Pumping Station", "type": "PUMP", "ward": "D", "elev_m": 1.8, "capacity_cumecs": 36.0, "lat": 18.978, "lon": 72.812},
        {"id": "PMP_LOVEGROVE_01", "name": "Love Grove Pumping Station (Worli)", "type": "PUMP", "ward": "G/S", "elev_m": 1.6, "capacity_cumecs": 42.0, "lat": 19.002, "lon": 72.815},
        {"id": "PMP_IRLA_01", "name": "Irla Pumping Station (Juhu)", "type": "PUMP", "ward": "K/W", "elev_m": 1.4, "capacity_cumecs": 24.0, "lat": 19.102, "lon": 72.825},
        {"id": "PMP_GAZDARBAND_01", "name": "Gazdarband Pumping Station (Khar Danda)", "type": "PUMP", "ward": "H/W", "elev_m": 1.5, "capacity_cumecs": 30.0, "lat": 19.072, "lon": 72.828},
    ]

    edges = [
        {"source_node_id": "RD_WEH_01", "target_node_id": "DRN_VAK_01", "relationship_type": "HYDRAULIC_RUNOFF", "weight_impact_factor": 0.85, "description": "WEH Bandra runoff drains to Vakola Nallah"},
        {"source_node_id": "RD_SVR_02", "target_node_id": "DRN_GAZ_01", "relationship_type": "HYDRAULIC_RUNOFF", "weight_impact_factor": 0.95, "description": "Milan Subway runoff drains to Gazdarband Nallah"},
        {"source_node_id": "RD_SVR_04", "target_node_id": "DRN_IRL_01", "relationship_type": "HYDRAULIC_RUNOFF", "weight_impact_factor": 0.90, "description": "Andheri Subway runoff drains to Irla Nallah"},
        {"source_node_id": "RD_EEH_01", "target_node_id": "DRN_HND_01", "relationship_type": "HYDRAULIC_RUNOFF", "weight_impact_factor": 0.88, "description": "Sion-Hindmata SWD conduit connection"},
        {"source_node_id": "RD_EEH_02", "target_node_id": "DRN_MIT_02", "relationship_type": "HYDRAULIC_RUNOFF", "weight_impact_factor": 0.92, "description": "Kurla runoff into Mithi River Reach II"},
        {"source_node_id": "RD_BAR_01", "target_node_id": "DRN_HND_01", "relationship_type": "HYDRAULIC_RUNOFF", "weight_impact_factor": 0.96, "description": "Dr. Ambedkar Road runoff into Hindmata Tank"},
        
        {"source_node_id": "DRN_VAK_01", "target_node_id": "DRN_MIT_02", "relationship_type": "HYDRAULIC_CONVEYANCE", "weight_impact_factor": 0.90, "description": "Vakola confluence into Mithi at BKC"},
        {"source_node_id": "DRN_MIT_02", "target_node_id": "DRN_MIT_03", "relationship_type": "HYDRAULIC_CONVEYANCE", "weight_impact_factor": 0.98, "description": "Mithi River discharge towards Mahim Bay"},
        {"source_node_id": "DRN_HND_01", "target_node_id": "PMP_BRITANNIA_01", "relationship_type": "HYDRAULIC_CONVEYANCE", "weight_impact_factor": 0.95, "description": "Hindmata tank pumped to Britannia Outfall"},
        {"source_node_id": "DRN_GAZ_01", "target_node_id": "PMP_GAZDARBAND_01", "relationship_type": "HYDRAULIC_CONVEYANCE", "weight_impact_factor": 0.92, "description": "Gazdarband pumped to Arabian Sea"},
        {"source_node_id": "DRN_IRL_01", "target_node_id": "PMP_IRLA_01", "relationship_type": "HYDRAULIC_CONVEYANCE", "weight_impact_factor": 0.94, "description": "Irla pumped to Juhu Arabian Sea Outfall"},

        {"source_node_id": "WL_HND_01", "target_node_id": "RD_BAR_01", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.95, "description": "Hindmata flood paralyzes Dr. Ambedkar Road"},
        {"source_node_id": "WL_HND_01", "target_node_id": "RD_EEH_01", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.85, "description": "Traffic spillover causes severe EEH Sion bottleneck"},
        {"source_node_id": "WL_MLN_01", "target_node_id": "RD_SVR_02", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.98, "description": "Milan Subway closed, SV Road gridlocked"},
        {"source_node_id": "WL_MLN_01", "target_node_id": "RD_WEH_01", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.78, "description": "Traffic spillover to Western Express Highway"},
        {"source_node_id": "WL_AND_01", "target_node_id": "RD_SVR_04", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.98, "description": "Andheri Subway closed, arterial traffic halted"},
        {"source_node_id": "WL_KRL_01", "target_node_id": "RD_LBS_01", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.95, "description": "Kurla flooded, LBS Marg and SCLR jammed"},
        {"source_node_id": "WL_SION_01", "target_node_id": "RD_EEH_01", "relationship_type": "DISRUPTION_SPILLOVER", "weight_impact_factor": 0.94, "description": "Gandhi Market submerged, Sion Circle halted"},
    ]

    return {
        "roads": roads,
        "hotspots": hotspots,
        "drains": drains,
        "pumping_stations": pumping_stations,
        "edges": edges
    }
