# Effect Presentation

A beautiful, interactive presentation about [Effect](https://effect.website) - "How I Stopped (C|T)rying".

## Features

- 🎨 Modern, beautiful design with Tailwind CSS
- ⌨️ Keyboard navigation (arrow keys, spacebar, Home, End)
- 💻 Syntax-highlighted code blocks with line numbers
- 🎯 Smooth slide transitions
- 📱 Responsive layout
- 🎭 Dark theme optimized for presentations

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open your browser to the URL shown (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be served by any static file server.

### Preview Production Build

```bash
npm run preview
```

## Navigation

- **Arrow Right** or **Space**: Next slide
- **Arrow Left**: Previous slide
- **Home**: First slide
- **End**: Last slide
- **Click navigation buttons**: Jump to any slide

## Presentation Structure

The presentation contains 9 slides covering:

1. **Title**: "How I Stopped (C|T)rying" - Effect: TypeScript's Missing Superpower
2. **The Nightmare**: The problem with nested try/catch
3. **Meet Effect**: The solution with typed errors
4. **Code That Reads Like Poetry**: Generator syntax
5. **Dependency Injection for Free**: Testing made easy
6. **Concurrency Without Tears**: Fiber-based concurrency
7. **The Ecosystem**: Batteries included
8. **Why This Matters**: Compiler-enforced correctness
9. **Stop Trying. Start Effect**: Call to action

Total presentation time: ~5 minutes

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **react-syntax-highlighter** - Code highlighting

## Customization

Edit `src/slides.tsx` to modify slide content. Each slide supports:
- Title and subtitle
- Rich content (React components)
- Code blocks with syntax highlighting
- Custom language for code blocks

## License

MIT

