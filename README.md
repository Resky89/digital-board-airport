# Digital Board Airport

Monorepo aplikasi Digital Board untuk informasi penerbangan.

- UI: Next.js (container `digitalboard-ui`, port 3000)
- API: Laravel 12 + PHP-FPM (container `digitalboard-api` + `digitalboard-api-nginx`)
- Database: MySQL 8 + phpMyAdmin (container `airport-mysql`, `airport-phpmyadmin`)
- Gateway: Nginx reverse proxy + SSL termination (container `airport-gateway`)

## 📋 Daftar Isi

- [Arsitektur Sistem](#-arsitektur-sistem)
- [Arsitektur & Port](#arsitektur--port)
- [Teknologi](#-teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi mkcert (Windows via Chocolatey)](#-instalasi-mkcert-windows-via-chocolatey)
- [Menjalankan dengan Docker](#menjalankan-dengan-docker)
- [Struktur Project](#-struktur-project)
- [Konfigurasi Lingkungan](#konfigurasi-lingkungan)
- [Docker Configuration](#-docker-configuration)
- [ERD Database](#erd-database)
- [Dokumentasi Endpoint API](#dokumentasi-endpoint-api)
- [Nginx Gateway & SSL](#nginx-gateway--ssl)
- [HTTP vs HTTPS](#http-vs-https-singkat)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arsitektur Sistem

Sistem menggunakan arsitektur terpisah (UI, API, Database) dengan Gateway Nginx sebagai reverse proxy dan terminasi TLS.

```
┌──────────────────┐         ┌──────────────────┐
│                  │  HTTP   │                  │
│  digitalboard-ui │◄───────►│  airport-gateway │◄─────►  Browser (8082/8443)
│     (Next.js)    │         │  (Nginx + TLS)   │
└──────────────────┘         └──────────┬───────┘
                                        │
                              ┌─────────▼─────────┐
                              │                   │
                              │ digitalboard-api  │
                              │ (Nginx + PHP-FPM) │
                              └─────────┬─────────┘
                                        │
                      ┌─────────────────▼─────────────────┐
                      │   airport-mysql + phpMyAdmin      │
                      │   (MySQL 8 + phpMyAdmin:8081)     │
                      └────────────────────────────────────┘
```

## Arsitektur & Port
- Gateway: HTTP `8082`, HTTPS `8443`
- UI internal: `digitalboard-ui:3000`
- API internal: `digitalboard-api-nginx:80` (mengarah ke PHP-FPM di `digitalboard-api:9000`)
- phpMyAdmin internal: `airport-phpmyadmin:80` (dipublikasi via gateway di `/phpmyadmin/`)
- MySQL: host lokal `127.0.0.1:3307` (container `airport-mysql:3306`)
- Docker network: `airport_net` (external)

## 🛠️ Teknologi

### Backend (digitalboard-api)
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| PHP | 8.2 | Runtime PHP-FPM |
| Laravel | 12.x | Framework backend |
| firebase/php-jwt | 6.x | JWT untuk autentikasi |
| Nginx | Stable Alpine | Web server untuk Laravel |
| MySQL | 8.0 | Database |

### Frontend (digitalboard-ui)
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 16.1.1 | React framework |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| TailwindCSS | 4.x | Styling framework |

### Infrastructure
- Docker & Docker Compose (v3.8 manifests)
- Nginx reverse proxy (gateway)
- phpMyAdmin
- mkcert (sertifikat SSL lokal)

## Prasyarat
- Docker Desktop + Docker Compose v2
- mkcert (untuk sertifikat SSL lokal yang tepercaya)
- Port bebas: 8082, 8443, 8081 (phpMyAdmin), 3307 (MySQL)

## 🔐 Instalasi mkcert (Windows via Chocolatey)
Jika Chocolatey belum terpasang:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Pasang mkcert (dan opsional NSS untuk Firefox), lalu inisialisasi root CA lokal:

```powershell
choco install mkcert -y
# opsional untuk Firefox
choco install nss -y
mkcert -install
```

Buat sertifikat untuk gateway:

```powershell
cd gateway
New-Item -ItemType Directory -Force cert
mkcert -key-file cert/server.key -cert-file cert/server.crt localhost 127.0.0.1 ::1
```

## Menjalankan dengan Docker
1) Buat jaringan Docker external (sekali saja):
```
docker network create airport_net
```

2) Buat sertifikat SSL lokal (mkcert) untuk gateway:
```
cd gateway
New-Item -ItemType Directory -Force cert
mkcert -install
mkcert -key-file cert/server.key -cert-file cert/server.crt localhost 127.0.0.1 ::1
```
Pastikan file yang terbentuk: `gateway/cert/server.crt` dan `gateway/cert/server.key`.

3) Jalankan stack Database:
```
cd digitalboard-database
docker compose up -d
```
- MySQL tersedia di `127.0.0.1:3307` (user `airport_user`, pass `user123`, db `airport_db`).
- phpMyAdmin di `https://localhost:8443/phpmyadmin/` (setelah gateway aktif), atau langsung `http://localhost:8081/` bila gateway belum aktif. Login default: `root` / `root`.

4) Jalankan API (Laravel):
```
cd digitalboard-api
docker compose up -d
```
- Jika pertama kali, siapkan environment:
```
# bila .env belum ada
copy .env.example .env   # Windows
# generate app key & migrate
docker exec -it digitalboard-api php artisan key:generate
docker exec -it digitalboard-api php artisan migrate --force
```

5) Jalankan UI (Next.js):
```
cd digitalboard-ui
# opsional: setel base URL API
# echo NEXT_PUBLIC_API_URL=https://localhost:8443 > .env
docker compose up -d
```
UI default akan mengarah ke `https://localhost:8443` bila variabel tidak diset.

6) Jalankan Gateway (Nginx + TLS termination):
```
cd gateway
docker compose up -d
```

7) Akses:
- UI: `https://localhost:8443/` (atau `http://localhost:8082/`)
- API: `https://localhost:8443/api/`
- phpMyAdmin: `https://localhost:8443/phpmyadmin/`

## 📁 Struktur Project

```
Digital-Board-Airport/
│
├── gateway/                    # Reverse proxy & TLS termination
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── cert/                   # server.crt & server.key (mkcert)
│
├── digitalboard-api/           # Laravel Backend API
│   ├── app/
│   ├── routes/
│   │   ├── api.php
│   │   └── api/**              # Route groups (admin/publik)
│   ├── database/
│   │   └── migrations/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── digitalboard-ui/            # Next.js Frontend
│   ├── app/
│   ├── public/
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── digitalboard-database/      # Database Service
    └── docker-compose.yml
```

## Konfigurasi Lingkungan
- API (Laravel) `.env` penting:
  - `DB_HOST=airport-mysql`
  - `DB_PORT=3306`
  - `DB_DATABASE=airport_db`
  - `DB_USERNAME=airport_user`
  - `DB_PASSWORD=user123`
  - `APP_KEY` wajib ada (gunakan `php artisan key:generate`).

- UI (Next.js):
  - `NEXT_PUBLIC_API_URL` (opsional). Default pada kode adalah `https://localhost:8443`.

- Database:
  - Port host: `3307`. Kredensial sesuai `digitalboard-database/docker-compose.yml`.

- Gateway (Nginx):
  - Sertifikat dipasang di `/etc/nginx/certs/server.crt` dan `/etc/nginx/certs/server.key` melalui volume `gateway/cert`.
  - Proxy:
    - `/` → `digitalboard-ui:3000`
    - `/api/` → `digitalboard-api-nginx`
    - `/phpmyadmin/` → `airport-phpmyadmin`

## 🐳 Docker Configuration

### Network
Semua services menggunakan jaringan external `airport_net` untuk komunikasi internal.

```bash
# Create network
docker network create airport_net

# Inspect network
docker network inspect airport_net
```

### Volumes

```yaml
# digitalboard-database/docker-compose.yml
volumes:
  airport_mysql_data: {}

services:
  mysql:
    volumes:
      - airport_mysql_data:/var/lib/mysql
```

### Ports Mapping

| Container | Internal Port | External Port | Keterangan |
|-----------|---------------|---------------|------------|
| airport-gateway | 80 / 443 | 8082 / 8443 | Reverse proxy + TLS |
| digitalboard-ui | 3000 | - | Hanya internal lewat gateway |
| digitalboard-api-nginx | 80 | - | Upstream API untuk gateway |
| airport-mysql | 3306 | 3307 | Database MySQL |
| airport-phpmyadmin | 80 | 8081 | DB admin UI |

### Useful Docker Commands

- Hentikan layanan di folder saat ini: `docker compose down`
- Restart cepat setelah mengubah `nginx.conf`: `docker compose restart`
- Masuk shell container Laravel: `docker exec -it digitalboard-api sh`
- Jalankan artisan: `docker exec -it digitalboard-api php artisan <command>`
- Lihat log container: `docker logs -f <container>`
- Daftar seluruh container: `docker ps -a`
- Pantau resource: `docker stats`

## ERD Database
Berikut ERD ringkas berdasarkan migrasi Laravel:

```mermaid
erDiagram
    USERS ||--o{ FLIGHTS : "created_by"
    COUNTRIES ||--o{ CITIES : "country_id"
    CITIES ||--o{ AIRPORTS : "city_id"
    TERMINALS ||--o{ GATES : "terminal_id"
    TERMINALS ||--o{ FLIGHTS : "terminal_id"
    GATES ||--o{ FLIGHTS : "gate_id"
    AIRLINES ||--o{ FLIGHTS : "airline_id"
    FLIGHT_STATUS ||--o{ FLIGHTS : "status_id"
    AIRPORTS ||--o{ FLIGHTS : "origin_airport_id"
    AIRPORTS ||--o{ FLIGHTS : "destination_airport_id"

    USERS {
      bigint id PK
      string name
      string email UNIQUE
    }
    COUNTRIES {
      bigint country_id PK
      string country_code UNIQUE
      string country_name
    }
    CITIES {
      bigint city_id PK
      string city_code UNIQUE
      string city_name
      bigint country_id FK
    }
    AIRPORTS {
      bigint airport_id PK
      string airport_code UNIQUE
      string airport_name
      bigint city_id FK
    }
    TERMINALS {
      bigint terminal_id PK
      string terminal_code UNIQUE
      string terminal_name
    }
    GATES {
      bigint gate_id PK
      string gate_code
      bigint terminal_id FK
    }
    AIRLINES {
      bigint airline_id PK
      string airline_code UNIQUE
      string airline_name
    }
    FLIGHT_STATUS {
      bigint status_id PK
      string status_name UNIQUE
    }
    FLIGHTS {
      bigint flight_id PK
      string flight_code
      bigint airline_id FK
      bigint origin_airport_id FK
      bigint destination_airport_id FK
      bigint gate_id FK
      bigint terminal_id FK
      bigint status_id FK
      datetime scheduled_time
      datetime actual_time
      bigint created_by FK
    }
```

## Dokumentasi Endpoint API
Base URL: `https://localhost:8443/api`

- Publik
  - `GET /flights` — daftar penerbangan.
  - `GET /flights/{id}` — detail penerbangan.

- Auth (prefix `/admin/auth`)
  - `POST /admin/auth/login` — login admin, menghasilkan token JWT (Bearer).
  - `POST /admin/auth/refresh` — refresh token.
  - `POST /admin/auth/logout` — logout (wajib Bearer token).

- Admin Resource (prefix `/admin`, Bearer token diperlukan)
  - Airlines: `GET/POST /admin/airlines`, `GET/PUT/PATCH/DELETE /admin/airlines/{id}`
  - Airports: `GET/POST /admin/airports`, `GET/PUT/PATCH/DELETE /admin/airports/{id}`
  - Cities: `GET/POST /admin/cities`, `GET/PUT/PATCH/DELETE /admin/cities/{id}`
  - Countries: `GET/POST /admin/countries`, `GET/PUT/PATCH/DELETE /admin/countries/{id}`
  - Flights: `GET/POST /admin/flights`, `GET/PUT/PATCH/DELETE /admin/flights/{id}`
  - Gates: `GET/POST /admin/gates`, `GET/PUT/PATCH/DELETE /admin/gates/{id}`
  - Terminals: `GET/POST /admin/terminals`, `GET/PUT/PATCH/DELETE /admin/terminals/{id}`
  - Users: `GET/POST /admin/users`, `GET/PUT/PATCH/DELETE /admin/users/{id}`

Contoh cURL:
```
# publik
curl -k https://localhost:8443/api/flights

# login (sesuaikan kredensial)
curl -k -X POST https://localhost:8443/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'

# akses resource dengan Bearer token
curl -k https://localhost:8443/api/admin/flights \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
Semua respons berupa JSON, dengan status HTTP standar (200/201/4xx/5xx).

## Nginx Gateway & SSL
- File: `gateway/nginx.conf`
- Mendukung WebSocket/upgrade header.
- TLS memakai file `server.crt` dan `server.key` dari mkcert.
- Tidak ada redirect otomatis dari HTTP ke HTTPS di konfigurasi default; kedua port tersedia.

## HTTP vs HTTPS (singkat)
- HTTP tidak terenkripsi; HTTPS terenkripsi menggunakan TLS.
- Di lingkungan modern, browser membatasi fitur bila tidak HTTPS (mis. Service Worker, geolocation).
- Gunakan `https://localhost:8443` agar UI dan API tidak terkena mixed content.

## Troubleshooting
- Network tidak ada: `Error: network airport_net not found`
  - Jalankan `docker network create airport_net`.

- Sertifikat tidak terbaca / 400-495 di browser:
  - Pastikan `gateway/cert/server.crt` dan `gateway/cert/server.key` ada dan valid.
  - Jalankan `mkcert -install` untuk memasang CA lokal (Windows akan menambahkan ke Windows Root Store).

- 502 Bad Gateway saat akses `/api`:
  - Cek container: `docker ps` harus ada `digitalboard-api` dan `digitalboard-api-nginx`.
  - Lihat log: `docker logs digitalboard-api-nginx` dan `docker logs digitalboard-api`.
  - Pastikan migrasi DB sudah dijalankan dan DB up (`airport-mysql`).

- UI tidak bisa memanggil API (CORS/mixed content):
  - Akses melalui gateway HTTPS (`https://localhost:8443`) untuk UI dan API.
  - Setel `NEXT_PUBLIC_API_URL=https://localhost:8443` bila perlu.

- Konflik port (8082/8443/8081/3307):
  - Ubah mapping `ports:` pada file `docker-compose.yml` terkait.

- phpMyAdmin tidak bisa login:
  - Coba kredensial `root` / `root` atau user DB aplikasi.
  - MySQL host internal di phpMyAdmin adalah `mysql` (sudah diset lewat env), tetapi dari luar gunakan `127.0.0.1:3307`.

