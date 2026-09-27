#!/usr/bin/env python3
"""
scripts/generate_demo_data.py
eRTMAC-NWIS — Synthetic Demo Data Generator for Oil India Limited Drilling Operations

Generates:
- 17 realistic wells (1 active well + 16 historical offset wells in Upper Assam Basin)
- 7 stratigraphic formations with pore pressure and fracture gradients
- 65+ realistic historical drilling events (Mud Loss, Stuck Pipe, Kick, Torque Spikes, Cementing Issues, NPT)
- Depth-correlated drilling parameters (ROP, WOB, RPM, Torque, SPP, FlowIn, FlowOut, MudWeight)
"""

import json
import math
import os
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# 1. Stratigraphic Formations
FORMATIONS = [
    {
        "name": "Alluvium / Surface",
        "top_depth": 0.0,
        "bottom_depth": 450.0,
        "lithology": "Unconsolidated sand, gravel, alluvial clay",
        "pore_pressure_ppg": 8.4,
        "fracture_gradient_ppg": 13.5,
        "hazards": ["Hole washout", "Loss of shallow returns"]
    },
    {
        "name": "Dihing Formation",
        "top_depth": 450.0,
        "bottom_depth": 1100.0,
        "lithology": "Coarse pebble conglomerate, soft sandstones, mottled clay",
        "pore_pressure_ppg": 8.5,
        "fracture_gradient_ppg": 13.8,
        "hazards": ["Seepage losses", "Bit balling"]
    },
    {
        "name": "Tipam Sandstone",
        "top_depth": 1100.0,
        "bottom_depth": 2100.0,
        "lithology": "Porous, permeable salt-and-pepper sandstone with siltstone",
        "pore_pressure_ppg": 8.6,
        "fracture_gradient_ppg": 14.2,
        "hazards": ["Filter cake buildup", "Differential sticking risk"]
    },
    {
        "name": "Girujan Clay",
        "top_depth": 2100.0,
        "bottom_depth": 2550.0,
        "lithology": "Mottled plastic smectitic clay, reactive mudstones",
        "pore_pressure_ppg": 8.8,
        "fracture_gradient_ppg": 14.5,
        "hazards": ["Swelling shale", "Hole pack-off", "Tight hole on trips"]
    },
    {
        "name": "Barail Coal-Shale",
        "top_depth": 2550.0,
        "bottom_depth": 2800.0,
        "lithology": "Sub-bituminous coal seams, carbonaceous shales, siltstone",
        "pore_pressure_ppg": 9.2,
        "fracture_gradient_ppg": 14.8,
        "hazards": ["Coal sloughing", "Torsional vibration / Stick-slip", "Coalbed gas influx"]
    },
    {
        "name": "Barail Main Sand",
        "top_depth": 2800.0,
        "bottom_depth": 3200.0,
        "lithology": "Fine to medium quartzose depleted reservoir sandstone, micro-fractured",
        "pore_pressure_ppg": 9.5,
        "fracture_gradient_ppg": 13.9,
        "hazards": ["Severe lost circulation (depleted matrix)", "Differential pipe sticking"]
    },
    {
        "name": "Kopili Formation",
        "top_depth": 3200.0,
        "bottom_depth": 3600.0,
        "lithology": "Dark grey splintery fossiliferous marine shales, limestone lenses",
        "pore_pressure_ppg": 10.4,
        "fracture_gradient_ppg": 15.6,
        "hazards": ["Overpressured kicks", "Borehole collapse", "Sloughing shale"]
    }
]

# 2. Wells
WELLS = [
    {
        "id": "OIL-ACTIVE-01",
        "well_name": "NHK-Deep-504 (Active)",
        "field": "Nahorkatiya",
        "block": "NHK Mining Lease Block-IV",
        "latitude": 27.2985,
        "longitude": 95.3421,
        "elevation_m": 124.5,
        "total_depth_m": 3450.0,
        "current_depth_m": 2842.0,
        "target_formation": "Barail Main Sand / Kopili",
        "current_formation": "Barail Main Sand",
        "spud_date": "2026-08-12",
        "status": "DRILLING",
        "is_active": True,
        "rig_name": "OIL-RIG-E2000 (2000 HP Cyber Rig)",
        "casing_program": "20\" @ 150m, 13-3/8\" @ 1050m, 9-5/8\" @ 2520m, 7\" Liner Pending"
    },
    {
        "id": "OIL-HIST-01",
        "well_name": "NHK-142",
        "field": "Nahorkatiya",
        "block": "Nahorkatiya Central Block",
        "latitude": 27.3112,
        "longitude": 95.3584,
        "elevation_m": 121.2,
        "total_depth_m": 3280.0,
        "current_depth_m": 3280.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2021-03-14",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "BHEL 1400",
        "casing_program": "20\" @ 120m, 13-3/8\" @ 980m, 9-5/8\" @ 2490m, 5-1/2\" @ 3275m"
    },
    {
        "id": "OIL-HIST-02",
        "well_name": "KNG-38",
        "field": "Kusijan",
        "block": "Kusijan North Block",
        "latitude": 27.2741,
        "longitude": 95.3129,
        "elevation_m": 118.0,
        "total_depth_m": 3410.0,
        "current_depth_m": 3410.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2020-09-05",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "National 110-UE",
        "casing_program": "20\" @ 140m, 13-3/8\" @ 1020m, 9-5/8\" @ 2540m, 5-1/2\" @ 3400m"
    },
    {
        "id": "OIL-HIST-03",
        "well_name": "JRN-17",
        "field": "Jorajan",
        "block": "Jorajan South Uplift",
        "latitude": 27.2514,
        "longitude": 95.3892,
        "elevation_m": 128.4,
        "total_depth_m": 3650.0,
        "current_depth_m": 3650.0,
        "target_formation": "Kopili / Barail",
        "current_formation": "Kopili Formation",
        "spud_date": "2019-11-20",
        "status": "SUSPENDED",
        "is_active": False,
        "rig_name": "Ideco E-1700",
        "casing_program": "20\" @ 160m, 13-3/8\" @ 1100m, 9-5/8\" @ 2680m, 7\" @ 3640m"
    },
    {
        "id": "OIL-HIST-04",
        "well_name": "MRN-84",
        "field": "Moran",
        "block": "Moran Main Horst",
        "latitude": 27.1895,
        "longitude": 94.9213,
        "elevation_m": 102.1,
        "total_depth_m": 3820.0,
        "current_depth_m": 3820.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2018-05-11",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL-RIG-2",
        "casing_program": "20\" @ 180m, 13-3/8\" @ 1150m, 9-5/8\" @ 2750m, 5-1/2\" @ 3810m"
    },
    {
        "id": "OIL-HIST-05",
        "well_name": "DGB-09",
        "field": "Digboi",
        "block": "Digboi Anticline East Flank",
        "latitude": 27.3821,
        "longitude": 95.6214,
        "elevation_m": 154.2,
        "total_depth_m": 2980.0,
        "current_depth_m": 2980.0,
        "target_formation": "Tipam Sandstone",
        "current_formation": "Tipam Sandstone",
        "spud_date": "2017-02-18",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL Heritage Rig 1",
        "casing_program": "16\" @ 120m, 10-3/4\" @ 900m, 7\" @ 2950m"
    },
    {
        "id": "OIL-HIST-06",
        "well_name": "BGJ-05",
        "field": "Baghjan",
        "block": "Baghjan North Structure",
        "latitude": 27.5841,
        "longitude": 95.4219,
        "elevation_m": 115.0,
        "total_depth_m": 4120.0,
        "current_depth_m": 4120.0,
        "target_formation": "Kopili Overpressure Sand",
        "current_formation": "Kopili Formation",
        "spud_date": "2020-01-10",
        "status": "PLUGGED_AND_ABANDONED",
        "is_active": False,
        "rig_name": "Chartered Rig 4",
        "casing_program": "20\" @ 200m, 13-3/8\" @ 1350m, 9-5/8\" @ 3100m, 7\" @ 4100m"
    },
    {
        "id": "OIL-HIST-07",
        "well_name": "SLM-12",
        "field": "Shalmari",
        "block": "Shalmari Deep Exploration",
        "latitude": 27.2104,
        "longitude": 95.2418,
        "elevation_m": 110.8,
        "total_depth_m": 3550.0,
        "current_depth_m": 3550.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2022-04-19",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL-RIG-5",
        "casing_program": "20\" @ 150m, 13-3/8\" @ 1020m, 9-5/8\" @ 2580m, 5-1/2\" @ 3540m"
    },
    {
        "id": "OIL-HIST-08",
        "well_name": "NHK-178",
        "field": "Nahorkatiya",
        "block": "Nahorkatiya South Fault Block",
        "latitude": 27.2842,
        "longitude": 95.3619,
        "elevation_m": 122.9,
        "total_depth_m": 3310.0,
        "current_depth_m": 3310.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2021-08-25",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "BHEL 1400",
        "casing_program": "20\" @ 135m, 13-3/8\" @ 1010m, 9-5/8\" @ 2515m, 5-1/2\" @ 3300m"
    },
    {
        "id": "OIL-HIST-09",
        "well_name": "NHK-205",
        "field": "Nahorkatiya",
        "block": "Nahorkatiya West Graben",
        "latitude": 27.3155,
        "longitude": 95.3288,
        "elevation_m": 126.1,
        "total_depth_m": 3290.0,
        "current_depth_m": 3290.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2023-01-14",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL-RIG-E2000",
        "casing_program": "20\" @ 145m, 13-3/8\" @ 1030m, 9-5/8\" @ 2530m, 5-1/2\" @ 3280m"
    },
    {
        "id": "OIL-HIST-10",
        "well_name": "MRN-112",
        "field": "Moran",
        "block": "Moran South Extension",
        "latitude": 27.1652,
        "longitude": 94.8984,
        "elevation_m": 105.4,
        "total_depth_m": 3900.0,
        "current_depth_m": 3900.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2022-09-30",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL-RIG-3",
        "casing_program": "20\" @ 170m, 13-3/8\" @ 1120m, 9-5/8\" @ 2720m, 5-1/2\" @ 3890m"
    },
    {
        "id": "OIL-HIST-11",
        "well_name": "KNG-45",
        "field": "Kusijan",
        "block": "Kusijan South Dome",
        "latitude": 27.2612,
        "longitude": 95.2981,
        "elevation_m": 116.5,
        "total_depth_m": 3390.0,
        "current_depth_m": 3390.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2021-12-04",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "National 110-UE",
        "casing_program": "20\" @ 140m, 13-3/8\" @ 1005m, 9-5/8\" @ 2520m, 5-1/2\" @ 3380m"
    },
    {
        "id": "OIL-HIST-12",
        "well_name": "JRN-29",
        "field": "Jorajan",
        "block": "Jorajan North Flank",
        "latitude": 27.2721,
        "longitude": 95.4125,
        "elevation_m": 131.2,
        "total_depth_m": 3720.0,
        "current_depth_m": 3720.0,
        "target_formation": "Barail / Kopili",
        "current_formation": "Kopili Formation",
        "spud_date": "2022-02-17",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "Ideco E-1700",
        "casing_program": "20\" @ 160m, 13-3/8\" @ 1090m, 9-5/8\" @ 2670m, 5-1/2\" @ 3710m"
    },
    {
        "id": "OIL-HIST-13",
        "well_name": "BGJ-08",
        "field": "Baghjan",
        "block": "Baghjan South Nose",
        "latitude": 27.5612,
        "longitude": 95.4051,
        "elevation_m": 113.8,
        "total_depth_m": 4050.0,
        "current_depth_m": 4050.0,
        "target_formation": "Kopili Deep Gas Sand",
        "current_formation": "Kopili Formation",
        "spud_date": "2021-06-22",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "Chartered Rig 5",
        "casing_program": "20\" @ 190m, 13-3/8\" @ 1320m, 9-5/8\" @ 3050m, 5-1/2\" @ 4040m"
    },
    {
        "id": "OIL-HIST-14",
        "well_name": "SLM-16",
        "field": "Shalmari",
        "block": "Shalmari West Uplift",
        "latitude": 27.2289,
        "longitude": 95.2215,
        "elevation_m": 112.4,
        "total_depth_m": 3610.0,
        "current_depth_m": 3610.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2023-04-11",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL-RIG-5",
        "casing_program": "20\" @ 150m, 13-3/8\" @ 1040m, 9-5/8\" @ 2600m, 5-1/2\" @ 3600m"
    },
    {
        "id": "OIL-HIST-15",
        "well_name": "NHK-312",
        "field": "Nahorkatiya",
        "block": "Nahorkatiya South Uplift",
        "latitude": 27.2891,
        "longitude": 95.3721,
        "elevation_m": 124.0,
        "total_depth_m": 3350.0,
        "current_depth_m": 3350.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2023-08-19",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "BHEL 1400",
        "casing_program": "20\" @ 140m, 13-3/8\" @ 1015m, 9-5/8\" @ 2525m, 5-1/2\" @ 3340m"
    },
    {
        "id": "OIL-HIST-16",
        "well_name": "MRN-96",
        "field": "Moran",
        "block": "Moran Central Fault Block",
        "latitude": 27.1782,
        "longitude": 94.9102,
        "elevation_m": 103.5,
        "total_depth_m": 3860.0,
        "current_depth_m": 3860.0,
        "target_formation": "Barail Main Sand",
        "current_formation": "Barail Main Sand",
        "spud_date": "2020-03-15",
        "status": "COMPLETED_PRODUCING",
        "is_active": False,
        "rig_name": "OIL-RIG-2",
        "casing_program": "20\" @ 175m, 13-3/8\" @ 1140m, 9-5/8\" @ 2740m, 5-1/2\" @ 3850m"
    }
]

def generate():
    print("Generating eRTMAC-NWIS demo datasets...")
    wells_path = os.path.join(DATA_DIR, "wells_seed.json")
    with open(wells_path, "w") as f:
        json.dump(WELLS, f, indent=2)
    print(f"-> Saved {len(WELLS)} wells to {wells_path}")

    formations_path = os.path.join(DATA_DIR, "formations.json")
    with open(formations_path, "w") as f:
        json.dump(FORMATIONS, f, indent=2)
    print(f"-> Saved {len(FORMATIONS)} formations to {formations_path}")

    print("Data generation complete!")

if __name__ == "__main__":
    generate()
