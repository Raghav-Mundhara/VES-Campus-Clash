# apps/api — VES Campus Clash Backend

Node.js + Express + TypeScript + Prisma + PostgreSQL

## Dev

```bash
cp .env.example .env        # fill in DATABASE_URL etc.
npm install
npx prisma migrate dev      # run after schema is populated
npm run dev                  # starts ts-node-dev server on :3001
```

## Health check

```
GET /health → 200 { status: "ok" }
```

## Notes

- Feature routers (follow, register, game, result, card) will be mounted in subsequent prompts.
- Prisma schema (Player, Session, Step enum) will be added in the next prompt.
