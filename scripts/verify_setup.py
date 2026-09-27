#!/usr/bin/env python3
"""
scripts/verify_setup.py
eRTMAC-NWIS — Phase 1 Foundation Verification Test Suite
Automated validation of directory structure, data layer, API health, spatial queries, and real-time simulator.
"""

import json
import os
import sys
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_BASE = os.getenv("API_BASE_URL", "http://localhost:3000")

def check_directories():
    print("--- 1. Directory Structure Check ---")
    required_dirs = ["data", "scripts", "docs", "backend", "src"]
    for d in required_dirs:
        path = os.path.join(BASE_DIR, d)
        exists = os.path.isdir(path)
        print(f"[{'PASS' if exists else 'FAIL'}] Directory: {d}/")
    return True

def check_data_files():
    print("\n--- 2. Data Layer Files Check ---")
    files = [
        "data/wells_seed.json",
        "data/events_seed.json",
        "data/formations.json",
        "data/documents/WCR-NHK-142_Well_Completion_Report.txt",
        "data/documents/DDR-KNG-38_Daily_Drilling_Incident_Report.txt",
        "data/documents/DDR-JRN-17_Lost_Circulation_Incident_Log.txt",
        "data/documents/GEO-UPPER-ASSAM_Geomechanical_Pore_Pressure_Atlas.txt",
        "data/documents/drilling_parameters_NHK142.csv"
    ]
    all_ok = True
    for f in files:
        path = os.path.join(BASE_DIR, f)
        exists = os.path.isfile(path)
        size = os.path.getsize(path) if exists else 0
        status = "PASS" if exists and size > 0 else "FAIL"
        print(f"[{status}] File: {f} ({size} bytes)")
        if not exists:
            all_ok = False
    return all_ok

def check_api_health():
    print("\n--- 3. API Healthcheck Endpoint ---")
    endpoints = ["/health", "/api/health"]
    for ep in endpoints:
        url = f"{API_BASE}{ep}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "eRTMAC-Verifier/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                status_code = response.getcode()
                body = response.read().decode('utf-8')
                data = json.loads(body)
                print(f"[PASS] {ep} responded with {status_code}: status={data.get('status')}, service={data.get('service')}")
        except Exception as e:
            print(f"[FAIL] {ep} error: {e}")

def check_wells_api():
    print("\n--- 4. Nearby Wells & GIS Spatial Intelligence API ---")
    url = f"{API_BASE}/api/wells/nearby?latitude=27.2985&longitude=95.3421&radius_km=15&current_depth=2845&formation=Barail+Main+Sand"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "eRTMAC-Verifier/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            body = response.read().decode('utf-8')
            data = json.loads(body)
            nearby_count = data.get("totalNearbyCount", 0)
            print(f"[PASS] /api/wells/nearby: found {nearby_count} offset wells within 15 km")
            if nearby_count > 0:
                top_match = data["results"][0]
                print(f"       Top Match: {top_match['well']['wellName']} - Distance: {top_match['distanceKm']} km - Score: {top_match['relevanceScore']}%")
    except Exception as e:
        print(f"[FAIL] /api/wells/nearby error: {e}")

def main():
    print("========================================================")
    print("  eRTMAC-NWIS — Phase 1 Foundation Verification Test   ")
    print("========================================================")
    check_directories()
    check_data_files()
    check_api_health()
    check_wells_api()
    print("\nVerification process completed.")

if __name__ == "__main__":
    main()
