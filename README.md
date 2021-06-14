# Polkaparty API

# Spec Requirement
## Requirements :
- Node LTS 14+
- NestJS
- PM2 (production process manager)
- Sequelize (ORM)
- MySQL

## Instalasi Tanpa Docker:
- Clone repository dari branch develop

- Setup env

- Install framework

```bash
npm install
npx husky install
```

```bash
npm run dbsakooprem --script="db:migrate"
```

- Start Command
```bash
    dev: npm run start:dev
    production: npm run start:prod
```

## Deploy
- Menggunakan docker
- Jika aplikasi sudah berjalan di server. Maka akan dijalankan menggunakan bantuan pm2.
- Api docs `/api-docs` 
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
npm run dbsakooprem --script="db:migrate"
npm run build:dev-sandbox
```
- Production
```bash
npm run dbsakooprem --script="db:migrate"
npm run prebuild
npm run build
```
