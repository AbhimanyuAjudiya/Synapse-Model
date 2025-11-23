# AI Model Marketplace

A decentralized AI model marketplace built with React, TypeScript, and Vite. Previously migrated from Next.js to provide a lightweight, fast development experience.

## 🚀 Features

- **Decentralized Architecture**: Built on Web3 infrastructure with Polygon, Walrus storage, and Fluence compute
- **AI Model Discovery**: Browse, search, and filter AI models by type, tags, and pricing
- **Interactive Playground**: Test models directly in your browser before purchase
- **Wallet Integration**: Connect your crypto wallet to upload and purchase models
- **Modern UI**: Responsive design with dark/light theme support and smooth animations

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Radix UI primitives with custom components
- **Animations**: Framer Motion
- **State Management**: React hooks and context
- **Web3**: Wagmi, Viem, Web3Modal
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── pages/           # Route components
│   ├── Home.tsx     # Landing page
│   ├── Models.tsx   # Model browser
│   ├── Upload.tsx   # Model upload
│   ├── About.tsx    # About page
│   └── Playground.tsx # Model testing
├── components/      # Reusable UI components
│   ├── ui/         # Base UI components (buttons, cards, etc.)
│   └── ...         # Feature components
├── lib/            # Utility functions and API clients
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── styles/         # Global styles and CSS
└── App.tsx         # Main app with routing setup
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- A Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-marketplace
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
# or
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
# or
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_ALCHEMY_API_KEY=your_alchemy_key_here
```

### Tailwind CSS

The project uses Tailwind CSS v4 with custom design tokens. Configuration is in:
- `tailwind.config.ts` - Tailwind configuration
- `src/styles/globals.css` - Global styles and CSS variables

## 📱 Routes

- `/` - Home page with hero section and features
- `/models` - Browse and search AI models
- `/models/:id/playground` - Test a specific model
- `/upload` - Upload new AI models (requires wallet connection)
- `/about` - About the platform

## 🔌 Web3 Integration

The app integrates with:
- **Polygon Network** - For smart contracts and transactions
- **Walrus Storage** - Decentralized file storage for AI models
- **Fluence Network** - Decentralized compute for model inference

### Supported Wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- And more via Web3Modal

## 🎨 Theming

The app supports both light and dark themes with smooth transitions. The theme is automatically detected from system preferences but can be manually toggled.

## 🧪 Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting (recommended)

### Hot Module Replacement
Vite provides fast HMR for instant feedback during development.

### Component Development
- Use TypeScript for all components
- Follow React best practices
- Utilize Radix UI for accessible components
- Implement responsive designs with Tailwind

## 📝 Migration Notes

This project was migrated from Next.js to Vite + React. Key changes made:

1. **Removed Next.js specific features**:
   - `getServerSideProps`, `getStaticProps`
   - Next.js routing system
   - `next/link` and `next/image`
   - `next-themes`

2. **Added React equivalents**:
   - React Router DOM for routing
   - Standard `<img>` tags or react-lazy-load-image-component
   - Custom theme provider
   - Vite for bundling and dev server

3. **Updated build system**:
   - Vite configuration for fast builds
   - Modern ES modules
   - Optimized dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our [Discord](https://discord.gg/your-server) for community support

---

Built with ❤️ using React, TypeScript, and Web3 technologies.