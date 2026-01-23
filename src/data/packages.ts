export interface Package {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'nodejs' | 'rust' | 'go' | 'java' | 'csharp' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'dart' | 'elixir' | 'haskell' | 'scala' | 'cpp' | 'r' | 'julia';
  installCommand: string;
  stars: number;
  forks: number;
  license: string;
  lastUpdated: string;
  githubUrl: string;
  docsUrl?: string;
  categories: string[];
  examples: CodeExample[];
  alternatives: string[];
  dependencies: string[];
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
}

export const packages: Package[] = [
  // Python Packages
  {
    id: 'numpy',
    name: 'NumPy',
    description: 'Fundamental package for scientific computing with Python. Provides support for large, multi-dimensional arrays and matrices, along with mathematical functions.',
    language: 'python',
    installCommand: 'pip install numpy',
    stars: 26500,
    forks: 9400,
    license: 'BSD-3-Clause',
    lastUpdated: '2024-01-15',
    githubUrl: 'https://github.com/numpy/numpy',
    docsUrl: 'https://numpy.org/doc/',
    categories: ['Scientific Computing', 'Data Science', 'Mathematics'],
    examples: [
      {
        title: 'Create an array',
        description: 'Create a simple NumPy array from a list',
        code: `import numpy as np

arr = np.array([1, 2, 3, 4, 5])
print(arr)
# Output: [1 2 3 4 5]`
      },
      {
        title: 'Matrix operations',
        description: 'Perform basic matrix multiplication',
        code: `import numpy as np

a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])
result = np.dot(a, b)
print(result)
# Output: [[19 22]
#          [43 50]]`
      },
      {
        title: 'Statistical functions',
        description: 'Calculate mean, std, and percentiles',
        code: `import numpy as np

data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
print(f"Mean: {np.mean(data)}")
print(f"Std: {np.std(data)}")
print(f"Median: {np.median(data)}")`
      }
    ],
    alternatives: ['scipy', 'pandas', 'jax'],
    dependencies: []
  },
  {
    id: 'matplotlib',
    name: 'Matplotlib',
    description: 'Comprehensive library for creating static, animated, and interactive visualizations in Python. The de-facto standard for 2D plotting.',
    language: 'python',
    installCommand: 'pip install matplotlib',
    stars: 19800,
    forks: 7600,
    license: 'PSF',
    lastUpdated: '2024-01-10',
    githubUrl: 'https://github.com/matplotlib/matplotlib',
    docsUrl: 'https://matplotlib.org/stable/contents.html',
    categories: ['Visualization', 'Plotting', 'Data Science'],
    examples: [
      {
        title: 'Simple line plot',
        description: 'Create a basic line chart',
        code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.title('Sine Wave')
plt.show()`
      },
      {
        title: 'Scatter plot',
        description: 'Create a scatter plot with colors',
        code: `import matplotlib.pyplot as plt
import numpy as np

x = np.random.rand(50)
y = np.random.rand(50)
colors = np.random.rand(50)

plt.scatter(x, y, c=colors, cmap='viridis')
plt.colorbar()
plt.show()`
      }
    ],
    alternatives: ['plotly', 'seaborn', 'bokeh', 'altair'],
    dependencies: ['numpy']
  },
  {
    id: 'scikit-rf',
    name: 'scikit-rf',
    description: 'RF/Microwave engineering toolkit. Analyze S-parameters, design matching networks, and simulate RF circuits. Essential for antenna and RF simulation.',
    language: 'python',
    installCommand: 'pip install scikit-rf',
    stars: 980,
    forks: 245,
    license: 'BSD-3-Clause',
    lastUpdated: '2024-01-08',
    githubUrl: 'https://github.com/scikit-rf/scikit-rf',
    docsUrl: 'https://scikit-rf.readthedocs.io/',
    categories: ['RF Engineering', 'Signal Processing', 'ECE', 'Antenna Simulation'],
    examples: [
      {
        title: 'Load S-parameters',
        description: 'Read a Touchstone file and plot S11',
        code: `import skrf as rf

# Load a 2-port network
ntwk = rf.Network('my_filter.s2p')

# Plot S11 in dB
ntwk.plot_s_db(m=0, n=0)
print(f"S11 at 1GHz: {ntwk['1ghz'].s[0,0,0]:.3f}")`
      },
      {
        title: 'Smith chart',
        description: 'Plot impedance on Smith chart',
        code: `import skrf as rf

ntwk = rf.Network('antenna.s1p')
ntwk.plot_s_smith()

# Get impedance at specific frequency
z = ntwk['2.4ghz'].z[0,0,0]
print(f"Impedance: {z:.2f} Ω")`
      }
    ],
    alternatives: ['pyRFtk', 'openEMS'],
    dependencies: ['numpy', 'scipy', 'matplotlib']
  },
  {
    id: 'scipy-signal',
    name: 'SciPy Signal',
    description: 'Signal processing toolbox within SciPy. Filter design, spectral analysis, convolution, and more for DSP applications.',
    language: 'python',
    installCommand: 'pip install scipy',
    stars: 12800,
    forks: 5100,
    license: 'BSD-3-Clause',
    lastUpdated: '2024-01-12',
    githubUrl: 'https://github.com/scipy/scipy',
    docsUrl: 'https://docs.scipy.org/doc/scipy/reference/signal.html',
    categories: ['Signal Processing', 'DSP', 'ECE', 'Scientific Computing'],
    examples: [
      {
        title: 'Butterworth filter',
        description: 'Design and apply a lowpass filter',
        code: `from scipy import signal
import numpy as np

# Design 4th order Butterworth lowpass
b, a = signal.butter(4, 0.1, btype='low')

# Apply to noisy signal
t = np.linspace(0, 1, 1000)
x = np.sin(2*np.pi*5*t) + 0.5*np.random.randn(1000)
y = signal.filtfilt(b, a, x)`
      },
      {
        title: 'FFT spectral analysis',
        description: 'Compute power spectral density',
        code: `from scipy import signal
import numpy as np

fs = 10000  # Sample rate
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*100*t) + 0.5*np.sin(2*np.pi*250*t)

f, Pxx = signal.welch(x, fs, nperseg=1024)
# Pxx contains PSD estimate`
      }
    ],
    alternatives: ['numpy.fft', 'pyfftw', 'librosa'],
    dependencies: ['numpy']
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'Modern, fast web framework for building APIs with Python 3.7+ based on standard Python type hints. High performance, automatic docs.',
    language: 'python',
    installCommand: 'pip install fastapi uvicorn',
    stars: 75000,
    forks: 6300,
    license: 'MIT',
    lastUpdated: '2024-01-14',
    githubUrl: 'https://github.com/tiangolo/fastapi',
    docsUrl: 'https://fastapi.tiangolo.com/',
    categories: ['Web Framework', 'API', 'Backend'],
    examples: [
      {
        title: 'Basic API endpoint',
        description: 'Create a simple REST endpoint',
        code: `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}`
      },
      {
        title: 'Request validation',
        description: 'Use Pydantic models for validation',
        code: `from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return {"item_name": item.name, "price": item.price}`
      }
    ],
    alternatives: ['flask', 'django', 'starlette'],
    dependencies: ['starlette', 'pydantic']
  },

  // Node.js Packages
  {
    id: 'express',
    name: 'Express',
    description: 'Fast, unopinionated, minimalist web framework for Node.js. The de-facto standard for building web applications and APIs.',
    language: 'nodejs',
    installCommand: 'npm install express',
    stars: 64500,
    forks: 15200,
    license: 'MIT',
    lastUpdated: '2024-01-13',
    githubUrl: 'https://github.com/expressjs/express',
    docsUrl: 'https://expressjs.com/',
    categories: ['Web Framework', 'API', 'Backend'],
    examples: [
      {
        title: 'Basic server',
        description: 'Create a simple HTTP server',
        code: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`
      },
      {
        title: 'REST API routes',
        description: 'Define CRUD endpoints',
        code: `const express = require('express');
const app = express();

app.use(express.json());

let items = [];

app.get('/items', (req, res) => res.json(items));
app.post('/items', (req, res) => {
  items.push(req.body);
  res.status(201).json(req.body);
});
app.delete('/items/:id', (req, res) => {
  items = items.filter(i => i.id !== req.params.id);
  res.status(204).send();
});`
      }
    ],
    alternatives: ['fastify', 'koa', 'hapi', 'nestjs'],
    dependencies: []
  },
  {
    id: 'axios',
    name: 'Axios',
    description: 'Promise-based HTTP client for the browser and Node.js. Features automatic JSON transforms, request/response interceptors, and cancellation.',
    language: 'nodejs',
    installCommand: 'npm install axios',
    stars: 105000,
    forks: 10800,
    license: 'MIT',
    lastUpdated: '2024-01-11',
    githubUrl: 'https://github.com/axios/axios',
    docsUrl: 'https://axios-http.com/docs/intro',
    categories: ['HTTP Client', 'API', 'Networking'],
    examples: [
      {
        title: 'GET request',
        description: 'Fetch data from an API',
        code: `const axios = require('axios');

async function fetchData() {
  const response = await axios.get('https://api.example.com/users');
  console.log(response.data);
}

fetchData();`
      },
      {
        title: 'POST with error handling',
        description: 'Send data with proper error handling',
        code: `const axios = require('axios');

async function createUser(userData) {
  try {
    const response = await axios.post('/api/users', userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}`
      }
    ],
    alternatives: ['node-fetch', 'got', 'superagent'],
    dependencies: []
  },
  {
    id: 'socket-io',
    name: 'Socket.IO',
    description: 'Enables real-time, bidirectional event-based communication. Works on every platform, browser, or device with focus on reliability and speed.',
    language: 'nodejs',
    installCommand: 'npm install socket.io',
    stars: 60800,
    forks: 10300,
    license: 'MIT',
    lastUpdated: '2024-01-09',
    githubUrl: 'https://github.com/socketio/socket.io',
    docsUrl: 'https://socket.io/docs/',
    categories: ['Real-time', 'WebSocket', 'Networking'],
    examples: [
      {
        title: 'Server setup',
        description: 'Initialize Socket.IO server',
        code: `const { Server } = require('socket.io');
const io = new Server(3000);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});`
      },
      {
        title: 'Client connection',
        description: 'Connect from browser client',
        code: `import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('chat message', 'Hello!');
});

socket.on('chat message', (msg) => {
  console.log('Received:', msg);
});`
      }
    ],
    alternatives: ['ws', 'primus', 'sockjs'],
    dependencies: []
  },
  {
    id: 'prisma',
    name: 'Prisma',
    description: 'Next-generation ORM for Node.js and TypeScript. Type-safe database client, migrations, and visual database browser.',
    language: 'nodejs',
    installCommand: 'npm install prisma @prisma/client',
    stars: 38500,
    forks: 1500,
    license: 'Apache-2.0',
    lastUpdated: '2024-01-14',
    githubUrl: 'https://github.com/prisma/prisma',
    docsUrl: 'https://www.prisma.io/docs/',
    categories: ['ORM', 'Database', 'Backend'],
    examples: [
      {
        title: 'Define schema',
        description: 'Create a Prisma schema file',
        code: `// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}`
      },
      {
        title: 'CRUD operations',
        description: 'Basic database operations',
        code: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' }
});

// Read
const users = await prisma.user.findMany({
  include: { posts: true }
});

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Smith' }
});`
      }
    ],
    alternatives: ['typeorm', 'sequelize', 'drizzle'],
    dependencies: []
  },
  {
    id: 'zod',
    name: 'Zod',
    description: 'TypeScript-first schema validation with static type inference. Build schemas once, get runtime validation and TypeScript types.',
    language: 'nodejs',
    installCommand: 'npm install zod',
    stars: 32800,
    forks: 1100,
    license: 'MIT',
    lastUpdated: '2024-01-12',
    githubUrl: 'https://github.com/colinhacks/zod',
    docsUrl: 'https://zod.dev/',
    categories: ['Validation', 'TypeScript', 'Schema'],
    examples: [
      {
        title: 'Define schema',
        description: 'Create and use a validation schema',
        code: `import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(0).optional()
});

type User = z.infer<typeof UserSchema>;

// Validate data
const result = UserSchema.safeParse({
  name: 'John',
  email: 'john@example.com'
});

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
}`
      }
    ],
    alternatives: ['yup', 'joi', 'io-ts'],
    dependencies: []
  },

  // Rust Packages
  {
    id: 'tokio',
    name: 'Tokio',
    description: 'Asynchronous runtime for Rust. Provides async I/O, networking, scheduling, timers, and more for building reliable network applications.',
    language: 'rust',
    installCommand: 'cargo add tokio --features full',
    stars: 26200,
    forks: 2400,
    license: 'MIT',
    lastUpdated: '2024-01-14',
    githubUrl: 'https://github.com/tokio-rs/tokio',
    docsUrl: 'https://tokio.rs/',
    categories: ['Async Runtime', 'Networking', 'Concurrency'],
    examples: [
      {
        title: 'Async main',
        description: 'Basic async Tokio application',
        code: `use tokio;

#[tokio::main]
async fn main() {
    println!("Hello from Tokio!");
    
    // Spawn async tasks
    let handle = tokio::spawn(async {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        "Task completed!"
    });
    
    let result = handle.await.unwrap();
    println!("{}", result);
}`
      },
      {
        title: 'TCP server',
        description: 'Simple async TCP server',
        code: `use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    
    loop {
        let (mut socket, _) = listener.accept().await?;
        
        tokio::spawn(async move {
            let mut buf = [0; 1024];
            let n = socket.read(&mut buf).await.unwrap();
            socket.write_all(&buf[..n]).await.unwrap();
        });
    }
}`
      }
    ],
    alternatives: ['async-std', 'smol'],
    dependencies: []
  },
  {
    id: 'serde',
    name: 'Serde',
    description: 'Serialization framework for Rust. Efficiently and generically serialize and deserialize data structures to JSON, YAML, TOML, and more.',
    language: 'rust',
    installCommand: 'cargo add serde --features derive\ncargo add serde_json',
    stars: 9000,
    forks: 780,
    license: 'MIT/Apache-2.0',
    lastUpdated: '2024-01-10',
    githubUrl: 'https://github.com/serde-rs/serde',
    docsUrl: 'https://serde.rs/',
    categories: ['Serialization', 'JSON', 'Data'],
    examples: [
      {
        title: 'JSON serialization',
        description: 'Serialize and deserialize structs',
        code: `use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    email: String,
    age: u32,
}

fn main() {
    let user = User {
        name: "Alice".to_string(),
        email: "alice@example.com".to_string(),
        age: 30,
    };
    
    // Serialize to JSON
    let json = serde_json::to_string(&user).unwrap();
    println!("{}", json);
    
    // Deserialize from JSON
    let parsed: User = serde_json::from_str(&json).unwrap();
    println!("{:?}", parsed);
}`
      }
    ],
    alternatives: ['rmp-serde', 'bincode'],
    dependencies: []
  },
  {
    id: 'axum',
    name: 'Axum',
    description: 'Ergonomic and modular web framework built with Tokio, Tower, and Hyper. Focus on ergonomics and modularity.',
    language: 'rust',
    installCommand: 'cargo add axum tokio --features tokio/full',
    stars: 18200,
    forks: 1050,
    license: 'MIT',
    lastUpdated: '2024-01-13',
    githubUrl: 'https://github.com/tokio-rs/axum',
    docsUrl: 'https://docs.rs/axum/',
    categories: ['Web Framework', 'API', 'Backend'],
    examples: [
      {
        title: 'Basic server',
        description: 'Create a simple web server',
        code: `use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/users/:id", get(get_user));
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_user(Path(id): Path<u32>) -> String {
    format!("User {}", id)
}`
      },
      {
        title: 'JSON response',
        description: 'Return JSON from handlers',
        code: `use axum::{Json, routing::post, Router};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct CreateUser {
    username: String,
}

#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}

async fn create_user(Json(payload): Json<CreateUser>) -> Json<User> {
    Json(User {
        id: 1,
        username: payload.username,
    })
}`
      }
    ],
    alternatives: ['actix-web', 'rocket', 'warp'],
    dependencies: ['tokio', 'tower', 'hyper']
  },
  {
    id: 'clap',
    name: 'Clap',
    description: 'Command Line Argument Parser for Rust. Full featured, fast Command Line Argument Parser with derive macro support.',
    language: 'rust',
    installCommand: 'cargo add clap --features derive',
    stars: 14000,
    forks: 1050,
    license: 'MIT/Apache-2.0',
    lastUpdated: '2024-01-11',
    githubUrl: 'https://github.com/clap-rs/clap',
    docsUrl: 'https://docs.rs/clap/',
    categories: ['CLI', 'Arguments', 'Tools'],
    examples: [
      {
        title: 'Derive-based CLI',
        description: 'Define CLI with derive macros',
        code: `use clap::Parser;

#[derive(Parser, Debug)]
#[command(author, version, about)]
struct Args {
    /// Name of the person to greet
    #[arg(short, long)]
    name: String,
    
    /// Number of times to greet
    #[arg(short, long, default_value_t = 1)]
    count: u8,
}

fn main() {
    let args = Args::parse();
    
    for _ in 0..args.count {
        println!("Hello {}!", args.name);
    }
}`
      }
    ],
    alternatives: ['structopt', 'argh', 'pico-args'],
    dependencies: []
  },
  {
    id: 'ndarray',
    name: 'ndarray',
    description: 'N-dimensional array library for Rust. Similar to NumPy, provides multi-dimensional containers and numerical operations.',
    language: 'rust',
    installCommand: 'cargo add ndarray',
    stars: 3500,
    forks: 300,
    license: 'MIT/Apache-2.0',
    lastUpdated: '2024-01-08',
    githubUrl: 'https://github.com/rust-ndarray/ndarray',
    docsUrl: 'https://docs.rs/ndarray/',
    categories: ['Scientific Computing', 'Mathematics', 'Data Science'],
    examples: [
      {
        title: 'Array operations',
        description: 'Create and manipulate arrays',
        code: `use ndarray::{array, Array2};

fn main() {
    // Create a 2D array
    let a: Array2<f64> = array![
        [1., 2., 3.],
        [4., 5., 6.]
    ];
    
    // Element-wise operations
    let b = &a * 2.0;
    
    // Sum and mean
    println!("Sum: {}", a.sum());
    println!("Mean: {}", a.mean().unwrap());
    
    // Matrix multiplication
    let c = a.dot(&b.t());
    println!("{:?}", c);
}`
      }
    ],
    alternatives: ['nalgebra', 'rust-numpy'],
    dependencies: []
  }
];

export const languages = [
  { id: 'python', name: 'Python', color: 'python', icon: '🐍', packageCount: 5 },
  { id: 'nodejs', name: 'Node.js', color: 'nodejs', icon: '💚', packageCount: 5 },
  { id: 'rust', name: 'Rust', color: 'rust', icon: '🦀', packageCount: 5 },
] as const;

export const categories = [
  { id: 'web-framework', name: 'Web Framework', count: 4 },
  { id: 'scientific-computing', name: 'Scientific Computing', count: 3 },
  { id: 'signal-processing', name: 'Signal Processing', count: 2 },
  { id: 'rf-engineering', name: 'RF Engineering', count: 1 },
  { id: 'visualization', name: 'Visualization', count: 1 },
  { id: 'database', name: 'Database', count: 2 },
  { id: 'validation', name: 'Validation', count: 1 },
  { id: 'async-runtime', name: 'Async Runtime', count: 1 },
  { id: 'serialization', name: 'Serialization', count: 1 },
  { id: 'cli', name: 'CLI', count: 1 },
] as const;

export function searchPackages(query: string, filters?: {
  language?: string;
  minStars?: number;
  license?: string;
}): Package[] {
  let results = packages;
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(pkg => 
      pkg.name.toLowerCase().includes(lowerQuery) ||
      pkg.description.toLowerCase().includes(lowerQuery) ||
      pkg.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
  }
  
  if (filters?.language) {
    results = results.filter(pkg => pkg.language === filters.language);
  }
  
  if (filters?.minStars) {
    results = results.filter(pkg => pkg.stars >= filters.minStars);
  }
  
  if (filters?.license) {
    results = results.filter(pkg => pkg.license.toLowerCase().includes(filters.license.toLowerCase()));
  }
  
  return results;
}

export function getPackageById(id: string): Package | undefined {
  return packages.find(pkg => pkg.id === id);
}

export function getPackagesByLanguage(language: string): Package[] {
  return packages.filter(pkg => pkg.language === language);
}

export function getRelatedPackages(packageId: string): Package[] {
  const pkg = getPackageById(packageId);
  if (!pkg) return [];
  
  return packages.filter(p => 
    p.id !== packageId && 
    (p.language === pkg.language || 
     p.categories.some(cat => pkg.categories.includes(cat)))
  ).slice(0, 4);
}