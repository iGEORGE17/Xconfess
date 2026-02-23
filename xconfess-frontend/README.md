# xConfess Frontend

> Next.js 14 frontend for the xConfess anonymous confession platform.

## Tech Stack

- **Next.js 14** with App Router
- **TailwindCSS** for styling
- **TypeScript**

## Project Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build

```bash
npm run build
```

## Structure

```
xconfess-frontend/
├── app/           # App Router pages and layouts
├── components/    # Reusable React components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and API clients
├── public/        # Static assets
└── styles/        # Global styles
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

## Documentation

- [Auth Integration Guide](AUTH_INTEGRATION.md)
- [Error Handling Guide](ERROR_HANDLING_GUIDE.md)
- [Complete System Overview](COMPLETE_SYSTEM_OVERVIEW.md)
- [Quick Reference](QUICK_REFERENCE.md)

## License

[MIT licensed](../LICENSE)
