import { ReactNode } from 'react'

export interface SlideData {
  title: string
  subtitle?: string
  content: ReactNode
  code?: string
  language?: string
}

export const slides: SlideData[] = [
  {
    title: 'How I Stopped (C|T)rying',
    subtitle: 'Effect: TypeScript\'s Missing Superpower',
    content: (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-effect-primary mb-4">Effect</h2>
        <p className="text-2xl text-gray-300">TypeScript's Missing Superpower</p>
      </div>
    ),
  },
  {
    title: 'The Nightmare',
    subtitle: 'Slide 2',
    content: (
      <>
        <p className="text-2xl text-gray-300 mb-6">
          <strong>We've all written this code:</strong>
        </p>
      </>
    ),
    code: `async function getUserProfile(id: string): Promise<Profile> {
  try {
    const user = await fetchUser(id);
    try {
      const posts = await fetchPosts(user.id);
      try {
        const comments = await fetchComments(posts[0].id);
        return { user, posts, comments };
      } catch (e) {
        console.error('Comments failed', e); // e: unknown 😱
        return { user, posts, comments: [] };
      }
    } catch (e) {
      console.error('Posts failed', e);
      return { user, posts: [], comments: [] };
    }
  } catch (e) {
    console.error('User failed', e);
    throw new Error('Failed to load profile');
  }
}`,
    language: 'typescript',
  },
  {
    title: 'Meet Effect',
    subtitle: 'Slide 3 • Stop trying. Start typing.',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Stop trying. Start typing.</strong>
        </p>
        <p className="text-lg text-gray-400 mt-6">
          <strong>Used by:</strong> Vercel, MasterClass, Zendesk
        </p>
      </>
    ),
    code: `import { Effect, Data } from 'effect';

// Define what can go wrong
class UserNotFound extends Data.TaggedError('UserNotFound')<{ id: string }> {}
class NetworkError extends Data.TaggedError('NetworkError')<{
  message: string;
}> {}

// Function signature tells the truth ✨
function getUserProfile(id: string): Effect<
  Profile, // What you get
  UserNotFound | NetworkError, // What can go wrong
  HttpClient // What you need
>;

// Handle errors by type - compiler enforces it!
const program = getUserProfile('123').pipe(
  Effect.catchTag('UserNotFound', () => Effect.succeed(guestProfile)),
  Effect.catchTag('NetworkError', () => Effect.retry({ times: 3 }))
);`,
    language: 'typescript',
  },
  {
    title: 'Code That Reads Like Poetry',
    subtitle: 'Slide 4 • Generator syntax - async/await\'s cooler sibling',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Generator syntax - async/await's cooler sibling:</strong>
        </p>
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-gray-300">Nested try/catch hell → <span className="text-green-400">✅ Linear, readable flow</span></span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-gray-300">`unknown` errors → <span className="text-green-400">✅ Typed, specific errors</span></span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-gray-300">Hidden dependencies → <span className="text-green-400">✅ Explicit requirements</span></span>
          </div>
        </div>
      </>
    ),
    code: `import { Effect, Data } from 'effect';

// Type definitions
interface User { id: string; name: string; email: string }
interface Post { id: string; userId: string; title: string }
interface Comment { id: string; postId: string; content: string }
interface Profile { user: User; posts: Post[]; comments: Comment[] }

// Error definitions
class UserNotFound extends Data.TaggedError('UserNotFound')<{ id: string }> {}
class PostError extends Data.TaggedError('PostError')<{ userId: string }> {}
class CommentError extends Data.TaggedError('CommentError')<{ postId: string }> {}

// Function definitions - hover to see their Effect types!
function fetchUser(id: string): Effect.Effect<
  User,                    // Success: What you get
  UserNotFound,             // Error: What can go wrong
  HttpClient               // Requirement: What you need
> {
  return Effect.succeed({ id, name: 'John', email: 'john@example.com' });
}

function fetchPosts(userId: string): Effect.Effect<
  Post[],                  // Success: Array of posts
  PostError,               // Error: Post-specific errors
  HttpClient               // Requirement: HTTP client needed
> {
  return Effect.succeed([{ id: '1', userId, title: 'My Post' }]);
}

function fetchComments(postId: string): Effect.Effect<
  Comment[],               // Success: Array of comments
  CommentError,            // Error: Comment-specific errors
  HttpClient               // Requirement: HTTP client needed
> {
  return Effect.succeed([{ id: '1', postId, content: 'Great post!' }]);
}

// Main program - hover over 'program' to see the full type!
const id = 'user-123';
const program = Effect.gen(function* () {
  // Each line is typed and safe - hover over fetchUser, fetchPosts, fetchComments
  const user = yield* fetchUser(id);
  const posts = yield* fetchPosts(user.id);
  const comments = yield* fetchComments(posts[0].id);

  yield* Effect.log(\`Loaded \${comments.length} comments\`);

  return { user, posts, comments };
});

// Hover over 'program' above to see: Effect<Profile, UserNotFound | PostError | CommentError, HttpClient>
// All errors tracked. All dependencies known. Zero surprises. 🎯`,
    language: 'typescript',
  },
  {
    title: 'Dependency Injection for Free',
    subtitle: 'Slide 5 • No more prop drilling',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>No more prop drilling:</strong>
        </p>
        <p className="text-xl text-effect-primary font-semibold mt-6">
          Testing becomes trivial.
        </p>
      </>
    ),
    code: `import { Context, Effect } from 'effect';

// Define a service
const Database = Context.Tag<DatabaseService>('Database');

// Use it anywhere - compiler ensures it's provided
const getUser = (id: number) =>
  Effect.gen(function* () {
    const db = yield* Database;
    return yield* db.query('SELECT * FROM users WHERE id = ?', [id]);
  });

// Provide real implementation
const live = getUser(123).pipe(Effect.provide(DatabaseLive));

// Swap for testing - one line!
const test = getUser(123).pipe(Effect.provide(MockDatabase));`,
    language: 'typescript',
  },
  {
    title: 'Concurrency Without Tears',
    subtitle: 'Slide 6 • Fiber-based concurrency (like Go\'s goroutines)',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Fiber-based concurrency (like Go's goroutines):</strong>
        </p>
        <div className="mt-6 space-y-3">
          <p className="text-lg text-gray-300"><strong>Structured concurrency:</strong></p>
          <div className="flex items-start gap-3">
            <span className="text-green-400">✅</span>
            <span className="text-gray-300">Parent interrupted → children auto-cleanup</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400">✅</span>
            <span className="text-gray-300">No resource leaks</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400">✅</span>
            <span className="text-gray-300">Safe cancellation built-in</span>
          </div>
          <p className="text-gray-400 mt-4">
            <strong>Plus:</strong> Latch, Queue, Deferred, and more primitives
          </p>
        </div>
      </>
    ),
    code: `import { Effect, Semaphore } from 'effect';

const program = Effect.gen(function* () {
  // Rate limit: max 3 concurrent requests
  const semaphore = yield* Semaphore.make(3);

  const tasks = urls.map((url) =>
    semaphore.withPermits(1)(httpClient.get(url))
  );

  // Run all tasks, respecting the limit
  return yield* Effect.all(tasks);
});`,
    language: 'typescript',
  },
  {
    title: 'The Ecosystem',
    subtitle: 'Slide 7 • Batteries included',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Batteries included:</strong>
        </p>
        <p className="text-lg text-gray-400 mt-6">
          <strong>Also:</strong> SQL clients, CLI tools, RPC, distributed systems, streams
        </p>
      </>
    ),
    code: `// Runtime validation
import { Schema } from "@effect/schema"
const User = Schema.Struct({
  id: Schema.Number,
  email: Schema.String.pipe(Schema.pattern(/@/))
})

// AI integration
import { OpenAi } from "@effect/ai-openai"
const chat = yield* ai.chat.completions.create({...})

// Testing with time travel
import { TestClock } from "effect"
yield* TestClock.adjust("5 minutes") // No waiting!`,
    language: 'typescript',
  },
  {
    title: 'Why This Matters',
    subtitle: 'Slide 8',
    content: (
      <>
        <blockquote className="text-xl text-gray-300 italic mb-8 border-l-4 border-effect-primary pl-6">
          "Like React gave us components for UI, Effect gives us effects for business logic"
        </blockquote>
        <div className="space-y-4 text-lg">
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">1.</span>
            <span className="text-gray-300"><strong>Compiler-enforced correctness</strong> - Can't ignore errors</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">2.</span>
            <span className="text-gray-300"><strong>Self-documenting code</strong> - Types tell the story</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">3.</span>
            <span className="text-gray-300"><strong>Testable by design</strong> - Mock anything with layers</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">4.</span>
            <span className="text-gray-300"><strong>Production observability</strong> - OpenTelemetry built-in</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">5.</span>
            <span className="text-gray-300"><strong>Incremental adoption</strong> - Start small, grow gradually</span>
          </div>
        </div>
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-300">
            <strong>Real story:</strong> Inato migrated 500k lines in 2 months
          </p>
          <p className="text-effect-primary mt-2">
            <strong>Effect 3.0:</strong> Stable, MIT licensed, ~15KB bundle
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Stop Trying. Start Effect.',
    subtitle: 'Slide 9',
    content: (
      <>
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <code className="text-2xl font-mono text-effect-primary">npm install effect</code>
          </div>
        </div>
        <div className="space-y-4 text-lg mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <a href="https://effect.website/" target="_blank" rel="noopener noreferrer" className="text-effect-primary hover:underline">
              effect.website
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <span className="text-gray-300">Discord: 4,600+ members</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <span className="text-gray-300">Free courses</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-gray-300">Start with one function</span>
          </div>
        </div>
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600">
          <p className="text-xl text-gray-300 mb-4">
            <strong>The transformation:</strong>
          </p>
          <div className="space-y-3">
            <p className="text-red-400">
              <span className="font-mono">// From this nightmare...</span>
            </p>
            <p className="text-gray-400 font-mono text-sm">
              try {'{'} try {'{'} try {'{'} ... {'}'} catch {'{'} ... {'}'} {'}'} catch {'{'} ... {'}'} {'}'} catch {'{'} ... {'}'}
            </p>
            <p className="text-green-400 mt-4">
              <span className="font-mono">// To this dream...</span>
            </p>
            <p className="text-gray-300 font-mono text-sm">
              pipe(fetchUser, flatMap(getPosts), catchTag("NotFound", ...))
            </p>
          </div>
        </div>
        <p className="text-3xl text-center mt-12 text-effect-primary font-bold">
          Questions? Let's talk Effect! 🚀
        </p>
      </>
    ),
  },
]

