# Frontend - GetPlaced

Next.js-based frontend application for the GetPlaced interview preparation platform.

## 🎯 Overview

Modern, responsive web application built with Next.js 16 and React 19, featuring AI-powered mock interviews, DSA problem solving with Monaco code editor, and comprehensive company resources.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI
- **Code Editor**: Monaco Editor
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **AI Voice**: VAPI AI
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## 📁 Project Structure

```
getplaced/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── admin/             # Admin panel
│   ├── companies/         # Company pages
│   ├── dsa/               # DSA problems
│   └── mock-interviews/   # AI interview pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── getplaced/        # Feature-specific components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configs
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── public/               # Static assets
└── styles/               # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm package manager

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file with:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth (Optional for local development)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# VAPI AI (for mock interviews)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_PRIVATE_KEY=your_vapi_private_key

# Environment
NODE_ENV=development
```

## 📦 Key Features

### 1. DSA Problem Solving

- **Monaco Editor**: Professional code editor with syntax highlighting
- **Multi-language Support**: Python, Java, C++, JavaScript, C
- **Real-time Execution**: Run and submit code with instant feedback
- **Test Cases**: View sample and hidden test cases
- **Submission History**: Track your progress and submissions

### 2. Mock Interviews

- **AI Interviewer**: VAPI-powered voice interviews
- **Real-time Conversation**: Natural conversation with AI
- **Code Sharing**: Write code during interviews
- **Feedback**: Get detailed interview feedback

### 3. Company Resources

- **Company Profiles**: Detailed company information
- **Interview Experiences**: Real interview questions and experiences
- **Tech Stack**: Technologies used by companies
- **Eligibility**: Requirements and criteria

### 4. User Dashboard

- **Progress Tracking**: Visualize your learning journey
- **Statistics**: Submission stats and success rates
- **Recent Activity**: View recent submissions
- **Skill Tracking**: Track skills across different categories

## 🎨 UI Components

Built with Radix UI and Tailwind CSS:

- Buttons, Cards, Dialogs
- Dropdowns, Popovers, Tooltips
- Forms with validation
- Data tables
- Charts and graphs
- Toast notifications
- Responsive layouts

## 🔄 Data Fetching

Using TanStack Query for efficient data management:

```typescript
// Example: Fetch DSA problems
const { data, isLoading } = useQuery({
  queryKey: ['dsa-problems'],
  queryFn: () => api.get('/api/dsa/problems'),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

Features:

- Automatic caching
- Background refetching
- Optimistic updates
- Infinite scroll
- Pagination

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 📱 Responsive Design

- **Mobile-first approach**
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Touch-optimized** components
- **Progressive Web App** ready

## 🎯 What's Next?

### Performance Optimization

- [ ] Implement route prefetching
- [ ] Add image optimization
- [ ] Enable Service Worker for offline support
- [ ] Implement code splitting for Monaco Editor

### Features

- [ ] Add dark/light theme toggle
- [ ] Implement collaborative coding rooms
- [ ] Add video interview practice
- [ ] Create custom problem sets
- [ ] Add leaderboards and achievements

### UX Improvements

- [ ] Add keyboard shortcuts
- [ ] Improve mobile experience
- [ ] Add onboarding tutorial
- [ ] Implement progressive disclosure
- [ ] Add accessibility features (WCAG 2.1)

### Developer Experience

- [ ] Add Storybook for component development
- [ ] Implement E2E testing with Playwright
- [ ] Add unit tests with Jest
- [ ] Create component documentation
- [ ] Add performance monitoring

## 🔧 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - Shadcn UI configuration
- `postcss.config.mjs` - PostCSS configuration

## 📖 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `@tanstack/react-query` | Data fetching & caching |
| `@monaco-editor/react` | Code editor |
| `@vapi-ai/web` | AI voice interviews |
| `axios` | HTTP client |
| `react-hook-form` | Form management |
| `zod` | Schema validation |
| `recharts` | Data visualization |

## 🐛 Troubleshooting

### Dev server won't start

```bash
# Clear Next.js cache
rm -rf .next
npm install
npm run dev
```

### Monaco Editor not loading

```bash
# Ensure Monaco is properly installed
npm install @monaco-editor/react
```

### API requests failing

- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend server is running
- Check CORS configuration

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Formatting**: Use consistent formatting
- **Components**: Functional components with hooks
- **File naming**: kebab-case for files, PascalCase for components

## 🙏 Best Practices

1. **Always use TypeScript types**
2. **Implement error boundaries**
3. **Use React Query for server state**
4. **Optimize images with Next.js Image**
5. **Use environment variables for configs**
6. **Implement proper loading states**
7. **Handle errors gracefully**
8. **Write accessible components**

## 📞 Support

For issues or questions:

- Check existing issues
- Create a new issue with details
- Contact: <dhanjayary20a@gmail.com>
