┌────────────────────────┐
│        countries       │
├────────────────────────┤
│ country_id (PK)        │
│ country_code           │  ← ISO (ID, SG, JP, AU)
│ country_name           │
└───────────┬────────────┘
            │ 1
            │
            │ N
┌───────────▼────────────────────────┐
│            airports                 │
├─────────────────────────────────────┤
│ airport_id (PK)                     │
│ airport_code                        │ ← IATA (CGK, SIN, NRT)
│ airport_name                        │
│ city                                │
│ country_id (FK)                     │
└───────────┬─────────────────────────┘
            │
            │
            │
┌───────────▼────────────────────────┐
│        airlines        │
├────────────────────────┤
│ airline_id (PK)        │
│ airline_code           │ ← IATA / ICAO
│ airline_name           │
└───────────┬────────────┘
            │ 1
            │
            │ N
┌───────────▼───────────────────────────────┐
│                  flights                  │
├───────────────────────────────────────────┤
│ flight_id (PK)                            │
│ flight_code                               │
│ airline_id (FK)                           │
│ origin_airport_id (FK)                    │
│ destination_airport_id (FK)               │
│ gate_id (FK)                              │
│ terminal_id (FK)                          │
│ status_id (FK)                            │
│ flight_type (arrival / departure)         │
│ scheduled_time                            │
│ actual_time                               │
│ created_by (FK → users.user_id)           │
│ updated_at                                │
└───────────┬───────────────┬───────────────┘
            │               │
            │               │
            │               │               ┌────────────────────────┐
            │               │               │        terminals        │
            │               │               ├────────────────────────┤
            │               │               │ terminal_id (PK)        │
            │               │               │ terminal_code           │
            │               │               │ terminal_name           │
            │               │               │ description             │
            │               │               └───────────┬────────────┘
            │               │                           │ 1
            │               │                           │
┌───────────▼──────────┐   ┌▼────────────────────────┐ │ N
│      flight_status   │   │          gates           │◄┘
├──────────────────────┤   ├─────────────────────────┤
│ status_id (PK)       │   │ gate_id (PK)             │
│ status_name          │   │ gate_code                │
└──────────────────────┘   │ terminal_id (FK)         │
                            └─────────────────────────┘


┌────────────────────────┐
│        users           │
│   (Admin / Operator)   │
├────────────────────────┤
│ user_id (PK)           │
│ name                   │
│ email                  │
│ password               │
│ role                   │
│ created_at             │
│ updated_at             │
└────────────────────────┘
