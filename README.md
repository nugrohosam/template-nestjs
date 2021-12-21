# NFT Infinity API

# Spec Requirement
## Requirements :
- Node LTS 14+
- MySQL
- PM2 (production process manager)
- Sentry DSN (`Optional`)
## Instalasi Tanpa Docker:
- Clone repository dari branch develop

- Setup env

- Install Dependency

```bash
npm install
```

- Setup git hook (lint and format)
```
npx husky install
```

- Migrate DB  (sudah auto sync (sequalize sync `alter`) ketika menjalankan app)


- Start Command
```bash
    dev: npm run start:dev
    production: npm run start:prod
```

## Deploy
- Menggunakan docker
- Jika aplikasi sudah berjalan di server. Maka akan dijalankan menggunakan bantuan pm2.
## Error Monitoring

Setup Sentry config di `.env` (Bisa menghubungi dev lead atau PM utk mendapatkan akses ini)
```
SENTRY_DSN=
```

## Naming Convention
- folder name: snake_case
- file name: PascalCase
- variable: camelCase
- Class / Type / Interface / Enum: PascalCase
- classAttribute: camelCase
- function: camelCase
- EnumMember: PascalCase
- Interface: using prefix "I". eg: IMyInterface

## Build Pipeline Command
- Development
```bash
npm run database --script="db:migrate"
npm run prebuild
npm run build
```
- Production
```bash
npm run database --script="db:migrate"
npm run prebuild
npm run build
```
