# 🚀 Vibe AI - AI-Powered Website Generator

<div align="center">

![Vibe AI Logo](./public/logo.svg)

**Build stunning websites and applications by simply chatting with AI**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![tRPC](https://img.shields.io/badge/tRPC-Latest-398CCB?style=for-the-badge&logo=trpc)](https://trpc.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[✨ Live Demo](https://your-demo-url.com) • [📖 Documentation](https://docs.your-app.com) • [🐛 Report Bug](https://github.com/mohamedammar2729/MagicAI-Generate-Website/issues) • [💡 Request Feature](https://github.com/mohamedammar2729/MagicAI-Generate-Website/issues)

</div>

---

## 🌟 Overview

Vibe AI is a revolutionary platform that transforms natural language descriptions into fully functional websites and applications. Simply describe what you want to build, and our AI agents will create, iterate, and deploy your vision in real-time.

### ⚡ Key Features

- **🤖 AI-Powered Generation**: Convert text descriptions into complete web applications
- **💬 Interactive Chat Interface**: Iterate on your project through natural conversation
- **🔄 Real-time Preview**: See your changes instantly with live sandbox environments
- **📁 Smart File Management**: Organized project structure with intelligent file exploration
- **🎨 Modern UI/UX**: Built with shadcn/ui and Tailwind CSS for beautiful interfaces
- **🔐 Secure Authentication**: Powered by Clerk with subscription management
- **📊 Usage Tracking**: Built-in credit system with usage analytics
- **🌙 Dark Mode**: Seamless theme switching
- **📱 Responsive Design**: Works perfectly on all devices

## 🎯 Use Cases

- **Rapid Prototyping**: Quickly build MVP applications for validation
- **Landing Pages**: Create stunning marketing websites in minutes
- **Dashboard Applications**: Generate admin panels and analytics dashboards
- **E-commerce Sites**: Build online stores with modern UI components
- **Portfolio Websites**: Showcase your work with professional designs
- **Blog Platforms**: Create content-rich websites with dynamic layouts

## 🏗️ Architecture

```mermaid
graph TD
    A[User Input] --> B[AI Agent System]
    B --> C[Code Generation]
    C --> D[E2B Sandbox]
    D --> E[Live Preview]
    E --> F[User Feedback]
    F --> B

    G[Authentication] --> H[Clerk]
    I[Database] --> J[PostgreSQL + Prisma]
    K[API Layer] --> L[tRPC]
    M[Frontend] --> N[Next.js + React]
```

## 🛠️ Tech Stack

### Frontend

- **[Next.js 15.4.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Backend

- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Reliable database
- **[Inngest](https://www.inngest.com/)** - Background job processing

### AI & Integration

- **[E2B Code Interpreter](https://e2b.dev/)** - Secure code execution environment
- **[AI SDK](https://sdk.vercel.ai/)** - AI model integration
- **[Gemini AI](https://ai.google.dev/)** - Primary AI model for code generation

### Authentication & Payments

- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **[Clerk Pricing Table](https://clerk.com/docs/components/pricing/pricing-table)** - Subscription management

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Turbopack](https://turbo.build/pack)** - Fast development builds
- **[Prism.js](https://prismjs.com/)** - Syntax highlighting

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0 or later
- **npm/yarn/pnpm** package manager
- **PostgreSQL** database
- **Git** for version control

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vibe-ai"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"
E2B_API_KEY="your-e2b-api-key"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"

# Development (Optional)
GITHUB_TOKEN="your-github-token"
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohamedammar2729/MagicAI-Generate-Website.git
   cd ai-create-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
vibe-ai/
├── 📁 prisma/                 # Database schema and migrations
│   ├── schema.prisma         # Prisma schema definition
│   └── migrations/           # Database migration files
├── 📁 public/                # Static assets
├── 📁 sandbox-templates/     # E2B sandbox configurations
├── 📁 src/
│   ├── 📁 app/               # Next.js App Router pages
│   │   ├── (home)/          # Home layout group
│   │   ├── api/             # API routes
│   │   └── projects/        # Project pages
│   ├── 📁 components/        # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   └── code-view/       # Code display components
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 inngest/          # Background job functions
│   ├── 📁 lib/              # Utility libraries
│   ├── 📁 modules/          # Feature modules
│   │   ├── home/            # Homepage features
│   │   ├── messages/        # Chat functionality
│   │   ├── projects/        # Project management
│   │   └── usage/           # Usage tracking
│   ├── 📁 trpc/             # tRPC configuration
│   └── 📁 generated/        # Generated Prisma client
├── components.json           # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Configuration

### Database Setup

1. **Create a PostgreSQL database**
2. **Update the `DATABASE_URL` in your `.env` file**
3. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

### AI Model Configuration

> **⚠️ Important Note for Production Use:**
>
> While this application uses Gemini AI by default, **for more powerful and reliable results in production environments, we strongly recommend using other AI models such as:**
>
> - **Claude (Anthropic)** - Excellent for complex code generation and reasoning
> - **GPT-4.1 (OpenAI)** - Superior performance for sophisticated applications
>
> To switch AI models, update the AI integration in `src/inngest/functions.ts` and configure the appropriate API keys in your environment variables.

### Clerk Authentication

1. **Create a Clerk application** at [clerk.com](https://clerk.com)
2. **Configure your environment variables**
3. **Set up pricing plans** in your Clerk dashboard
4. **Configure webhooks** for subscription events

### E2B Sandbox

1. **Sign up at [e2b.dev](https://e2b.dev)**
2. **Get your API key**
3. **Configure sandbox templates** in the `sandbox-templates/` directory

## 🎨 Customization

### Theming

The application uses a custom design system built on top of Tailwind CSS. You can customize:

- **Colors**: Modify CSS variables in `src/app/globals.css`
- **Components**: Extend shadcn/ui components in `src/components/ui/`
- **Typography**: Update font configurations in `src/app/layout.tsx`

### Adding New Features

1. **Create a new module** in `src/modules/`
2. **Add tRPC procedures** for API endpoints
3. **Create UI components** following the existing patterns
4. **Update the database schema** if needed

## 📊 Usage & Pricing

The application includes a built-in credit system:

- **Free Tier**: 3 generations per 30 days
- **Pro Tier**: 100 generations per 30 days
- **Enterprise**: Custom limits

Credits are tracked using `rate-limiter-flexible` with Prisma as the storage backend.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables**
3. **Deploy automatically** on every push

### Docker

```bash
# Build the Docker image
docker build -t vibe-ai .

# Run the container
docker run -p 3000:3000 vibe-ai
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Standards

- **TypeScript**: All code must be type-safe
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code must be formatted consistently
- **Testing**: New features require tests

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>Database Connection Issues</strong></summary>

- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check if the database exists
- Run `npx prisma db push` to sync the schema

</details>

<details>
<summary><strong>AI Generation Not Working</strong></summary>

- Verify your API keys are set correctly
- Check if you have sufficient credits
- Ensure E2B sandbox is properly configured
- Check the Inngest dashboard for failed jobs

</details>

<details>
<summary><strong>Authentication Issues</strong></summary>

- Verify Clerk configuration
- Check environment variables
- Ensure redirect URLs are correct
- Clear browser cache and cookies

</details>

## 📚 Resources

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[tRPC Documentation](https://trpc.io/docs)**
- **[Prisma Documentation](https://www.prisma.io/docs)**
- **[Clerk Documentation](https://clerk.com/docs)**
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**
- **[E2B Documentation](https://e2b.dev/docs)**


## 🙏 Acknowledgments

- **[Vercel](https://vercel.com)** for the amazing deployment platform
- **[Clerk](https://clerk.com)** for authentication infrastructure
- **[E2B](https://e2b.dev)** for secure code execution
- **[shadcn](https://twitter.com/shadcn)** for the beautiful UI components
- All the amazing open-source contributors

---

<div align="center">

**Made with ❤️ by the Vibe AI Team**

[⭐ Star this repo](https://github.com/mohamedammar2729/MagicAI-Generate-Website) • [🐛 Report Issues](https://github.com/mohamedammar2729/MagicAI-Generate-Website/issues) • [💬 Join Discussion](https://github.com/mohamedammar2729/MagicAI-Generate-Website/discussions)

</div>
