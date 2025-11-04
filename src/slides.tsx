/** biome-ignore-all lint/suspicious/noCommentText: ignore */
import type { ReactNode } from 'react';

export interface FileContent {
  path: string;
  content: string;
  language?: string;
}

export interface SlideData {
  title: string;
  subtitle?: string;
  content: ReactNode;
  code?: string;
  language?: string;
  helperFiles?: FileContent[];
}

export const slides: SlideData[] = [
  {
    title: 'How I Stopped Trying\n(and 😭ing!)',
    subtitle: "Effect: TypeScript's Missing Superpower",
    content: (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-effect-primary mb-4">Effect</h2>
        <p className="text-2xl text-gray-300">
          TypeScript's Missing Superpower
        </p>
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
    code: `import { fetchUser, fetchPosts, fetchComments, getGuestProfile, type Profile } from './helpers';

// The try/catch hell 🔥
async function getUserProfile(id: string): Promise<Profile> {
  try {
    const user = await fetchUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    try {
      const posts = await fetchPosts(user.id);
      
      try {
        const comments = await fetchComments(posts[0]?.id);
        if (!comments) {
          throw new Error('Failed to fetch comments');
        }
        
        return { user, posts, comments };
      } catch (error) {
        console.error('Comment error:', error);
        // Try to recover...
        try {
          const retryComments = await fetchComments(posts[0]?.id);
          return { user, posts, comments: retryComments || [] };
        } catch (retryError) {
          // Give up on comments
          return { user, posts, comments: [] };
        }
      }
    } catch (error) {
      console.error('Post error:', error);
      // What type of error? Who knows! 🤷
      if (error instanceof Error && error.message.includes('network')) {
        // Retry logic here? Maybe?
        throw new Error('Network issue');
      }
      throw error;
    }
  } catch (error) {
    console.error('User error:', error);
    // Is this UserNotFound? NetworkError? Something else?
    // TypeScript doesn't know! 😱
    if (error instanceof Error && error.message === 'User not found') {
      return getGuestProfile();
    }
    // Retry? Log? Give up?
    throw error; // Good luck debugging this!
  }
}

// What can go wrong? Unknown! What do we need? Unknown!
// Errors are all \`unknown\` or \`any\` - no type safety! 💀`,
    language: 'typescript',
    helperFiles: [
      {
        path: 'helpers.ts',
        content: `// Type definitions (shared with main.ts)
export interface User { id: string; name: string; email: string }
export interface Post { id: string; userId: string; title: string }
export interface Comment { id: string; postId: string; content: string }
export interface Profile { user: User; posts: Post[]; comments: Comment[] }

// Dummy implementations for demonstration
export async function fetchUser(id: string): Promise<User | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  if (id === 'invalid') {
    return null;
  }
  return { id, name: 'John Doe', email: 'john@example.com' };
}

export async function fetchPosts(userId: string): Promise<Post[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: 'post-1', userId, title: 'First Post' },
    { id: 'post-2', userId, title: 'Second Post' }
  ];
}

export async function fetchComments(postId: string): Promise<Comment[] | null> {
  // Simulate API call that might fail
  await new Promise(resolve => setTimeout(resolve, 100));
  if (postId === 'post-error') {
    return null;
  }
  return [
    { id: 'comment-1', postId, content: 'Great post!' },
    { id: 'comment-2', postId, content: 'Thanks for sharing' }
  ];
}

// Helper function (not shown - but needed)
export function getGuestProfile(): Profile {
  return {
    user: { id: 'guest', name: 'Guest', email: 'guest@example.com' },
    posts: [],
    comments: []
  };
}`,
        language: 'typescript',
      },
    ],
  },
  {
    title: 'Alternative Solutions',
    subtitle: 'Slide 3 • Some libraries try to solve this',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Some libraries try to solve this:</strong>
        </p>
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-gray-300">
              Libraries like <strong>neverthrow</strong>,{' '}
              <strong>ts-results</strong>, <strong>@trylonai/ts-result</strong>,{' '}
              <strong>typescript-result</strong>, <strong>ts-pattern</strong>{' '}
              use Result types or pattern matching
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-gray-300">
              Errors are not properly inferred due to how TypeScript handles
              unions
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-gray-300">
              Usually solve a specific problem, often need to be combined, and
              are often not well maintained
            </span>
          </div>
        </div>
      </>
    ),
    code: `// Example with neverthrow (Result pattern)
import { ok, err, Result } from 'neverthrow';
import { fetchUser, fetchPosts } from './neverthrow-example';

// neverthrow automatically infers types from andThen chains!
const program = fetchUser('123')
  .andThen((user) => 
    fetchPosts(user.id).map((posts) => ({ user, posts }))
  );

// TypeScript would infer: Result<{ user: User; posts: Post[] }, 'UserNotFound' | 'PostError'>
// But error types are just union - no structured error handling

// Still need to handle errors manually
program.match(
  (profile) => console.log('Success:', profile),
  (error) => console.error('Error:', error)
);`,
    language: 'typescript',
    helperFiles: [
      {
        path: 'neverthrow-example.ts',
        content: `import { ok, err, Result } from 'neverthrow';

export interface User { id: string; name: string; email: string }
export interface Post { id: string; userId: string; title: string }

// Typed errors as union types
type FetchError = 'UserNotFound' | 'NetworkError';

// neverthrow properly infers types through andThen chains
export function fetchUser(id: string): Result<User, FetchError> {
  if (id === 'invalid') {
    return err('UserNotFound');
  }
  return ok({ id, name: 'John Doe', email: 'john@example.com' });
}

export function fetchPosts(userId: string): Result<Post[], FetchError> {
  return ok([
    { id: 'post-1', userId, title: 'First Post' },
    { id: 'post-2', userId, title: 'Second Post' }
  ]);
}

// neverthrow automatically infers the error union type
// Result type: Result<{ user: User; posts: Post[] }, FetchError>
export const getUserProfile = (id: string) => {
  return fetchUser(id).andThen((user) =>
    fetchPosts(user.id).map((posts) => ({ user, posts }))
  );
};`,
        language: 'typescript',
      },
      {
        path: 'ts-results-example.ts',
        content: `import { Result, Ok, Err } from 'ts-results';

export interface User { id: string; name: string; email: string }
export interface Post { id: string; userId: string; title: string }

// Similar pattern with ts-results
export function fetchUser(id: string): Result<User, string> {
  if (id === 'invalid') {
    return Err('User not found');
  }
  return Ok({ id, name: 'John Doe', email: 'john@example.com' });
}

export function fetchPosts(userId: string): Result<Post[], string> {
  return Ok([
    { id: 'post-1', userId, title: 'First Post' },
    { id: 'post-2', userId, title: 'Second Post' }
  ]);
}

// Chaining with andThen - similar to neverthrow
export const getUserProfile = (id: string) => {
  return fetchUser(id).andThen((user) =>
    fetchPosts(user.id).map((posts) => ({ user, posts }))
  );
};`,
        language: 'typescript',
      },
    ],
  },
  {
    title: 'Meet Effect',
    subtitle: 'Slide 4 • Stop trying. Start typing.',
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
    code: `import { Effect, Data, Context } from 'effect';
import { HttpClient } from '@effect/platform/HttpClient';

// Type definitions
interface User { id: string; name: string; email: string }
interface Post { id: string; userId: string; title: string }
interface Comment { id: string; postId: string; content: string }
interface Profile { user: User; posts: Post[]; comments: Comment[] }

// Define what can go wrong
class UserNotFound extends Data.TaggedError('UserNotFound')<{ id: string }> {}
class NetworkError extends Data.TaggedError('NetworkError')<{
  message: string;
}> {}

// Guest profile fallback
const guestProfile: Profile = {
  user: { id: 'guest', name: 'Guest User', email: 'guest@example.com' },
  posts: [],
  comments: []
};

// Function signature tells the truth ✨
function getUserProfile(id: string): Effect.Effect<
  Profile, // What you get
  UserNotFound | NetworkError, // What can go wrong
  HttpClient // What you need
>;

// Handle errors by type - compiler enforces it!
const program = getUserProfile('123').pipe(
  Effect.catchTag('UserNotFound', () => Effect.succeed(guestProfile)),
  Effect.catchTag('NetworkError', () => 
    getUserProfile('123').pipe(Effect.retry({ times: 3 }))
  )
);`,
    language: 'typescript',
  },
  {
    title: 'Code That Reads Like Poetry',
    subtitle: "Slide 5 • Generator syntax - async/await's cooler sibling",
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Generator syntax - async/await's cooler sibling:</strong>
        </p>
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-gray-300">
              Nested try/catch hell →{' '}
              <span className="text-green-400">✅ Linear, readable flow</span>
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-gray-300">
              `unknown` errors →{' '}
              <span className="text-green-400">✅ Typed, specific errors</span>
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <span className="text-gray-300">
              Hidden dependencies →{' '}
              <span className="text-green-400">✅ Explicit requirements</span>
            </span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300 mb-2">
            <strong className="text-effect-primary">Why generators?</strong>{' '}
            Effect intercepts each{' '}
            <code className="text-effect-secondary">yield*</code> to track
            dependencies, compose errors, and manage resources. This gives you
            the readability of async/await with the power of functional
            programming.
          </p>
          <p className="text-sm text-gray-300 mb-2">
            Generators are perfectly interruptible—Effect can cancel any
            operation at any{' '}
            <code className="text-effect-secondary">yield*</code> point. Promise
            chains can be interrupted too, but require complex signal management
            (AbortController, etc.).
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Learn more:{' '}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators"
              target="_blank"
              rel="noopener noreferrer"
              className="text-effect-primary hover:underline"
            >
              MDN: Iterators and Generators
            </a>
            {' • '}
            <a
              href="https://effect.website/docs/guides/effect/creating-effects#generator-syntax"
              target="_blank"
              rel="noopener noreferrer"
              className="text-effect-primary hover:underline"
            >
              Effect: Generator Syntax
            </a>
          </p>
        </div>
      </>
    ),
    code: `import { Effect, Schedule } from 'effect';
import { fetchUser, fetchPosts, fetchComments } from './helpers';

// Main program
const id = 'user-123';
const program = Effect.gen(function* () {
  // Each line is typed and safe
  const user = yield* fetchUser(id);
  const posts = yield* fetchPosts(user.id);
  const comments = yield* fetchComments(posts[0].id);

  yield* Effect.log(\`Loaded \${comments.length} comments\`);

  return { user, posts, comments };
}).pipe(
  // Retry with exponential backoff and jitter
  Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.jittered)),
  // Add timeout - fail if takes longer than 5 seconds
  Effect.timeout("5 seconds"),
  // Wrap in tracing span for observability
  Effect.withSpan("getUserProfile")
);

// All errors tracked. All dependencies known. Zero surprises. 🎯`,
    language: 'typescript',
    helperFiles: [
      {
        path: 'types.ts',
        content: `import { Data } from 'effect';

// Type definitions
export interface User { id: string; name: string; email: string }
export interface Post { id: string; userId: string; title: string }
export interface Comment { id: string; postId: string; content: string }
export interface Profile { user: User; posts: Post[]; comments: Comment[] }

// Error definitions
export class UserNotFound extends Data.TaggedError('UserNotFound')<{ id: string }> {}
export class PostError extends Data.TaggedError('PostError')<{ userId: string }> {}
export class CommentError extends Data.TaggedError('CommentError')<{ postId: string }> {}`,
        language: 'typescript',
      },
      {
        path: 'helpers.ts',
        content: `import { Effect } from 'effect';
import { HttpClient } from '@effect/platform/HttpClient';
import type { User, Post, Comment } from './types';
import { UserNotFound, PostError, CommentError } from './types';

// Function definitions - hover to see their Effect types!
export function fetchUser(id: string): Effect.Effect<
  User,                    // Success: What you get
  UserNotFound,             // Error: What can go wrong
  HttpClient               // Requirement: What you need
> {
  return Effect.succeed({ id, name: 'John', email: 'john@example.com' });
}

export function fetchPosts(userId: string): Effect.Effect<
  Post[],                  // Success: Array of posts
  PostError,               // Error: Post-specific errors
  HttpClient               // Requirement: HTTP client needed
> {
  return Effect.succeed([{ id: '1', userId, title: 'My Post' }]);
}

export function fetchComments(postId: string): Effect.Effect<
  Comment[],               // Success: Array of comments
  CommentError,            // Error: Comment-specific errors
  HttpClient               // Requirement: HTTP client needed
> {
  return Effect.succeed([{ id: '1', postId, content: 'Great post!' }]);
}`,
        language: 'typescript',
      },
    ],
  },
  {
    title: 'Dependency Injection for Free',
    subtitle: 'Slide 6 • No more prop drilling',
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
    code: `import { Effect } from 'effect';
import { Database } from './types';
import { DatabaseLive } from './DatabaseLive';
import { MockDatabase } from './MockDatabase';

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
    helperFiles: [
      {
        path: 'types.ts',
        content: `import { Context, Effect, Data } from 'effect';

// Query result type
export interface QueryResult {
  id: number;
  name: string;
  email: string;
  [key: string]: unknown;
}

// Database error
export class DatabaseError extends Data.TaggedError('DatabaseError')<{
  message: string;
  code?: string;
}> {}

// Define the Database service tag with proper typing
export class Database extends Context.Tag('Database')<
  Database,
  {
    readonly query: (
      sql: string,
      params: unknown[]
    ) => Effect.Effect<QueryResult[], DatabaseError>;
  }
>() {}`,
        language: 'typescript',
      },
      {
        path: 'MockDatabase.ts',
        content: `import { Effect, Layer } from 'effect';
import { Database, DatabaseError } from './types';

// Mock database implementation for testing
const MockDatabaseService = {
  query: (sql: string, params: unknown[]): Effect.Effect<
    Array<{ id: number; name: string; email: string; [key: string]: unknown }>,
    DatabaseError
  > => {
    // Pre-populate with test data
    const data = new Map<number, { id: number; name: string; email: string }>();
    data.set(123, { id: 123, name: 'Test User', email: 'test@example.com' });
    data.set(456, { id: 456, name: 'Another User', email: 'another@example.com' });

    // Simple mock implementation - extract id from params
    const id = params[0] as number;
    const user = data.get(id);

    if (!user) {
      return Effect.fail(
        new DatabaseError({ message: \`User with id \${id} not found\`, code: 'NOT_FOUND' })
      );
    }

    // Return matching user(s) as if from a database query
    return Effect.succeed([user]);
  }
};

// Export as a Layer for easy composition
export const MockDatabase = Layer.succeed(Database, MockDatabaseService);`,
        language: 'typescript',
      },
      {
        path: 'DatabaseLive.ts',
        content: `import { Effect, Layer } from 'effect';
import { Database, DatabaseError } from './types';

// Real database implementation
const DatabaseLiveService = {
  query: (sql: string, params: unknown[]): Effect.Effect<
    Array<{ id: number; name: string; email: string; [key: string]: unknown }>,
    DatabaseError
  > => {
    // In real implementation, this would:
    // 1. Connect to the database
    // 2. Execute the SQL query with parameters
    // 3. Return the results
    // 4. Handle connection errors, query errors, etc.
    
    return Effect.tryPromise({
      try: async () => {
        // Simulate database query
        // In real code: await db.query(sql, params)
        const id = params[0] as number;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Simulate database result
        return [
          { id, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }
        ];
      },
      catch: (error) =>
        new DatabaseError({
          message: error instanceof Error ? error.message : 'Database query failed',
          code: 'QUERY_ERROR',
        }),
    });
  }
};

// Export as a Layer for dependency injection
export const DatabaseLive = Layer.succeed(Database, DatabaseLiveService);`,
        language: 'typescript',
      },
    ],
  },
  {
    title: 'The Ecosystem',
    subtitle: 'Slide 7 • Batteries included',
    content: (
      <>
        <p className="text-xl text-gray-300 mb-6">
          <strong>Batteries included:</strong>
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              📋 Schema - Replace Zod
            </p>
            <p className="text-gray-300 text-sm">
              Type-safe validation with automatic type inference, composable
              transformations, and JSON Schema generation
            </p>
          </div>
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              🤖 AI - Execution Planning
            </p>
            <p className="text-gray-300 text-sm">
              Intelligent LLM interactions with automatic fallback models,
              execution planning, and typed tool use
            </p>
          </div>
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              📊 Observability - Built-in
            </p>
            <p className="text-gray-300 text-sm">
              Logging, metrics, tracing, and OpenTelemetry integration out of
              the box
            </p>
          </div>
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              🌊 Streams & Concurrency
            </p>
            <p className="text-gray-300 text-sm">
              Reactive streams, queues, fibers, semaphores, and structured
              concurrency primitives
            </p>
          </div>
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              ⚛️ React Integration
            </p>
            <p className="text-gray-300 text-sm">
              <a
                href="https://github.com/tim-smart/effect-atom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                effect-atom
              </a>{' '}
              for seamless React integration with Effect
            </p>
          </div>
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              🤖 MCP Server
            </p>
            <p className="text-gray-300 text-sm">
              <a
                href="https://github.com/tim-smart/effect-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                effect-mcp
              </a>{' '}
              MCP server that works great with AI agents
            </p>
          </div>
          <div>
            <p className="text-lg text-effect-primary font-semibold mb-2">
              📚 API Documentation
            </p>
            <p className="text-gray-300 text-sm">
              Automatically generate REST API docs for{' '}
              <a
                href="https://swagger.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                Swagger
              </a>{' '}
              and{' '}
              <a
                href="https://scalar.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                Scalar
              </a>
            </p>
          </div>
        </div>
      </>
    ),
    code: `// Schema - Type-safe validation (replaces Zod)
import { Schema } from "effect";

const User = Schema.Struct({
  id: Schema.Number,
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\\.[^@]+$/))
});

// Decode: unknown → { id: number; email: string }
const validateUser = Schema.decodeUnknown(User);

// Encode: { id: number; email: string } → unknown (for serialization)
const serializeUser = Schema.encodeUnknown(User);

// AI - Execution planning with fallback models
import { Effect, ExecutionPlan, Layer, Config } from "effect";
import { LanguageModel } from "@effect/ai";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";

const generateDadJoke = LanguageModel.generateText({
  prompt: "Tell me a dad joke"
});

// Create layers for each provider
const OpenAiLayer = OpenAiLanguageModel.layer({
  model: "gpt-4o"
}).pipe(Layer.provide(OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY")
})));
const AnthropicLayer = AnthropicLanguageModel.layer({
  model: "claude-3-5-sonnet-20241022"
}).pipe(Layer.provide(AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY")
})));

const aiProgram = Effect.gen(function* () {
  const plan = ExecutionPlan.make(
    { provide: OpenAiLayer },
    { provide: AnthropicLayer }
  );
  
  // Automatically retries with fallback on failure
  const response = yield* Effect.withExecutionPlan(generateDadJoke, plan);
  
  return response.text; // Return the response text
});

// Observability - Structured logging & tracing
import { Logger, Metric, Tracer } from "effect";

const observabilityProgram = Effect.gen(function* () {
  yield* Logger.info("Processing request");
  yield* Metric.increment("requests.total");
  yield* Tracer.withSpan("process-request", () => 
    fetchUser(id)
  );
});

// Streams - Reactive data pipelines
import { Stream } from "effect";

const stream = Stream.fromIterable([1, 2, 3])
  .pipe(Stream.map(n => n * 2))
  .pipe(Stream.filter(n => n > 3))
  .pipe(Stream.runCollect);`,
    language: 'typescript',
  },
  {
    title: 'Why This Matters',
    subtitle: 'Slide 8',
    content: (
      <>
        <blockquote className="text-xl text-gray-300 italic mb-8 border-l-4 border-effect-primary pl-6">
          "Like React gave us components for UI, Effect gives us effects for
          business logic"
        </blockquote>
        <div className="space-y-4 text-lg">
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">1.</span>
            <span className="text-gray-300">
              <strong>Compiler-enforced correctness</strong> - Can't ignore
              errors
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">2.</span>
            <span className="text-gray-300">
              <strong>Self-documenting code</strong> - Types tell the story
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">3.</span>
            <span className="text-gray-300">
              <strong>Testable by design</strong> - Mock anything with layers.{' '}
              <a
                href="https://github.com/Effect-TS/effect/tree/main/packages/vitest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                @effect/vitest
              </a>{' '}
              plays well with Vitest
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">4.</span>
            <span className="text-gray-300">
              <strong>Production observability</strong> - OpenTelemetry
              built-in.{' '}
              <a
                href="https://effect.website/docs/error-management/expected-errors/#effectfn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                Effect.fn
              </a>{' '}
              has built-in tracing
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">5.</span>
            <span className="text-gray-300">
              <strong>Enhanced IDE support</strong> -{' '}
              <a
                href="https://github.com/Effect-TS/language-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-effect-secondary hover:underline"
              >
                @effect/language-service
              </a>{' '}
              provides an LSP for your IDEs
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-effect-primary font-bold">6.</span>
            <span className="text-gray-300">
              <strong>Incremental adoption</strong> - Start small, grow
              gradually
            </span>
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
            <code className="text-2xl font-mono text-effect-primary">
              npm install effect
            </code>
          </div>
        </div>
        <div className="space-y-4 text-lg mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <a
              href="https://effect.website/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-effect-primary hover:underline"
            >
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
        <p className="text-3xl text-center mt-12 text-effect-primary font-bold">
          Questions? Let's talk Effect! 🚀
        </p>
      </>
    ),
  },
];
