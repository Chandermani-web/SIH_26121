# eRTMAC-NWIS — Database Schema (PostgreSQL + PostGIS)

## 1. Spatial & Geometrical Modeling
eRTMAC-NWIS utilizes **PostgreSQL 15** with the **PostGIS 3.3** extension to execute real-time spatial calculations in coordinate system **EPSG:4326 (WGS 84)**.

All well locations and trajectories are stored with native PostGIS `GEOMETRY(Point, 4326)` and indexed via GiST (Generalized Search Tree) spatial indexing.

```
+----------------------------------------------------------------------------------------------------+
|                                    ENTITY RELATIONSHIP DIAGRAM                                     |
+----------------------------------------------------------------------------------------------------+

     +-----------------------+              +-----------------------------+
     |      formations       |              |            wells            |
     +-----------------------+              +-----------------------------+
     | id (PK)               |              | id (PK, VARCHAR)            |
     | name (VARCHAR, UK)    |              | well_name (VARCHAR)         |
     | top_depth_m (FLOAT)   |              | field (VARCHAR)             |
     | bottom_depth_m (FLOAT)|              | latitude (FLOAT)            |
     | pore_pressure_ppg     |              | longitude (FLOAT)           |
     | fracture_gradient_ppg |              | geom (GEOMETRY Point, 4326) |
     | dominant_risks (JSONB)|              | total_depth_m (FLOAT)       |
     +-----------------------+              | current_depth_m (FLOAT)     |
                                            | target_formation (VARCHAR)  |
                                            | status (VARCHAR)            |
                                            | is_active (BOOLEAN)         |
                                            +--------------+--------------+
                                                           | 1
                                                           |
                      +-------------------+----------------+-------------------+
                      | 1..*              | 1..*                               | 1..*
                      v                   v                                    v
     +----------------------+   +-----------------------+            +-----------------------+
     |        events        |   |   drilling_parameters |            |       documents       |
     +----------------------+   +-----------------------+            +-----------------------+
     | id (PK)              |   | id (PK)               |            | id (PK)               |
     | well_id (FK)         |   | well_id (FK)          |            | well_id (FK)          |
     | event_type (VARCHAR) |   | timestamp (TIMESTAMPTZ|            | title (VARCHAR)       |
     | severity (VARCHAR)   |   | measured_depth_m      |            | doc_type (VARCHAR)    |
     | depth_m (FLOAT)      |   | tvd_m (FLOAT)         |            | processing_status     |
     | formation (VARCHAR)  |   | rop_m_hr, wob_klb     |            | total_pages (INT)     |
     | description (TEXT)   |   | rpm, torque_kft_lb    |            +-----------+-----------+
     | root_cause (TEXT)    |   | spp_psi, flow_in_gpm  |                        | 1
     | mitigation (TEXT)    |   | flow_out_gpm          |                        | 1..*
     | npt_hours (FLOAT)    |   | mud_weight_ppg        |                        v
     | cost_impact_lakhs    |   | pit_volume_bbl        |            +-----------------------+
     | source_document      |   +-----------------------+            |   knowledge_chunks    |
     | source_document_page |                                        +-----------------------+
     +----------------------+                                        | id (PK)               |
                                                                     | document_id (FK)      |
                                                                     | chunk_index (INT)     |
                                                                     | depth_reference_m     |
                                                                     | content (TEXT)        |
                                                                     | metadata (JSONB)      |
                                                                     +-----------------------+
```

---

## 2. Table Definitions & Indexes

### 2.1 `wells`
- Primary Key: `id VARCHAR(64)`
- Spatial Field: `geom GEOMETRY(Point, 4326)`
- Spatial Index: `CREATE INDEX idx_wells_geom ON wells USING GIST(geom);`
- Attribute Index: `CREATE INDEX idx_wells_field ON wells(field);`

### 2.2 `events`
- Primary Key: `id VARCHAR(64)`
- Foreign Key: `well_id` references `wells(id) ON DELETE CASCADE`
- Event Types: `MUD_LOSS`, `STUCK_PIPE`, `KICK`, `TORQUE_SPIKE`, `CEMENTING_ISSUE`
- Severities: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- Indexes: `well_id`, `event_type`, `depth_m`

### 2.3 `drilling_parameters`
- Stores time/depth telemetry series:
  - `measured_depth_m`, `tvd_m`
  - `rop_m_hr`, `wob_klb`, `rpm`, `torque_kft_lb`
  - `spp_psi`, `flow_in_gpm`, `flow_out_gpm`
  - `mud_weight_ppg`, `pit_volume_bbl`

### 2.4 Spatial Distance Query Example
```sql
SELECT
    w.id,
    w.well_name,
    w.field,
    ROUND((ST_Distance(w.geom::geography, ST_SetSRID(ST_MakePoint(95.3421, 27.2985), 4326)::geography) / 1000.0)::numeric, 2) AS distance_km
FROM wells w
WHERE ST_DWithin(w.geom::geography, ST_SetSRID(ST_MakePoint(95.3421, 27.2985), 4326)::geography, 25000)
ORDER BY distance_km ASC;
```
