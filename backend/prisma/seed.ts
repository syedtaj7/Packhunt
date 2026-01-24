import { PrismaClient, Language } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear existing data (only in development)
  console.log('🗑️  Clearing existing data...');
  await prisma.example.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.dependency.deleteMany();
  await prisma.$executeRaw`DELETE FROM "_CategoryToPackage"`;
  await prisma.package.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Create categories first
  console.log('📂 Creating categories...');
  const categories = [
    { name: 'Data Science', slug: 'data-science', description: 'Data analysis, manipulation, and visualization' },
    { name: 'Machine Learning', slug: 'machine-learning', description: 'ML frameworks and tools' },
    { name: 'Web Frameworks', slug: 'web-frameworks', description: 'Full-stack and backend web frameworks' },
    { name: 'API Development', slug: 'api-development', description: 'REST and GraphQL API tools' },
    { name: 'Testing', slug: 'testing', description: 'Testing frameworks and utilities' },
    { name: 'Database', slug: 'database', description: 'Database clients and ORMs' },
    { name: 'Visualization', slug: 'visualization', description: 'Data visualization and plotting' },
    { name: 'Scientific Computing', slug: 'scientific-computing', description: 'Numerical and scientific computing' },
    { name: 'Signal Processing', slug: 'signal-processing', description: 'DSP and signal analysis' },
    { name: 'RF Engineering', slug: 'rf-engineering', description: 'RF/microwave engineering tools' },
    { name: 'Async Programming', slug: 'async-programming', description: 'Asynchronous and concurrent programming' },
    { name: 'CLI Tools', slug: 'cli-tools', description: 'Command-line interface utilities' },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log(`✅ Created ${categories.length} categories\n`);

  // Python Packages
  console.log('🐍 Creating Python packages...');
  
  const pythonPackages = [
    {
      name: 'NumPy',
      slug: 'numpy',
      description: 'Fundamental package for scientific computing with Python. Provides support for large, multi-dimensional arrays and matrices.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 26500,
      forks: 9400,
      downloads: 150000000,
      license: 'BSD-3-Clause',
      githubUrl: 'https://github.com/numpy/numpy',
      registryUrl: 'https://pypi.org/project/numpy/',
      docsUrl: 'https://numpy.org/doc/',
      installCommand: 'pip install numpy',
      readme: 'NumPy is the fundamental package for array computing with Python. It provides a high-performance multidimensional array object and tools for working with these arrays.',
      categories: ['Data Science', 'Scientific Computing'],
      examples: [
        {
          title: 'Create an array',
          description: 'Create a simple NumPy array from a Python list',
          code: `import numpy as np

# Create a 1D array
arr = np.array([1, 2, 3, 4, 5])
print(arr)
# Output: [1 2 3 4 5]

# Create a 2D array
matrix = np.array([[1, 2, 3], [4, 5, 6]])
print(matrix.shape)
# Output: (2, 3)`,
          order: 1,
        },
        {
          title: 'Array operations',
          description: 'Perform mathematical operations on arrays',
          code: `import numpy as np

a = np.array([1, 2, 3, 4])
b = np.array([10, 20, 30, 40])

# Element-wise operations
print(a + b)  # [11 22 33 44]
print(a * b)  # [10 40 90 160]
print(np.sqrt(a))  # [1. 1.41 1.73 2.]`,
          order: 2,
        },
        {
          title: 'Statistical functions',
          description: 'Calculate statistics on array data',
          code: `import numpy as np

data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

print(f"Mean: {np.mean(data)}")      # Mean: 5.5
print(f"Median: {np.median(data)}")  # Median: 5.5
print(f"Std Dev: {np.std(data)}")    # Std Dev: 2.87`,
          order: 3,
        },
      ],
      alternatives: ['jax', 'cupy'],
    },
    {
      name: 'pandas',
      slug: 'pandas',
      description: 'Powerful data structures for data analysis, time series, and statistics. The de-facto standard for data manipulation.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 42500,
      forks: 17600,
      downloads: 180000000,
      license: 'BSD-3-Clause',
      githubUrl: 'https://github.com/pandas-dev/pandas',
      registryUrl: 'https://pypi.org/project/pandas/',
      docsUrl: 'https://pandas.pydata.org/docs/',
      installCommand: 'pip install pandas',
      readme: 'pandas is a fast, powerful, flexible and easy to use open source data analysis and manipulation tool.',
      categories: ['Data Science', 'Scientific Computing'],
      examples: [
        {
          title: 'Create a DataFrame',
          description: 'Build a DataFrame from a dictionary',
          code: `import pandas as pd

data = {
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'Chicago']
}

df = pd.DataFrame(data)
print(df)`,
          order: 1,
        },
        {
          title: 'Filter and select',
          description: 'Filter rows and select columns',
          code: `import pandas as pd

df = pd.read_csv('data.csv')

# Filter rows where age > 25
young = df[df['age'] > 25]

# Select specific columns
subset = df[['name', 'city']]`,
          order: 2,
        },
      ],
      alternatives: ['polars', 'dask'],
    },
    {
      name: 'Matplotlib',
      slug: 'matplotlib',
      description: 'Comprehensive library for creating static, animated, and interactive visualizations. The de-facto 2D plotting standard.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 19800,
      forks: 7600,
      downloads: 120000000,
      license: 'PSF',
      githubUrl: 'https://github.com/matplotlib/matplotlib',
      registryUrl: 'https://pypi.org/project/matplotlib/',
      docsUrl: 'https://matplotlib.org/',
      installCommand: 'pip install matplotlib',
      readme: 'Matplotlib is a comprehensive library for creating static, animated, and interactive visualizations in Python.',
      categories: ['Visualization', 'Data Science'],
      examples: [
        {
          title: 'Line plot',
          description: 'Create a simple line chart',
          code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.title('Sine Wave')
plt.grid(True)
plt.show()`,
          order: 1,
        },
        {
          title: 'Multiple subplots',
          description: 'Create multiple plots in one figure',
          code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

ax1.plot(x, np.sin(x))
ax1.set_title('Sine')

ax2.plot(x, np.cos(x), 'r')
ax2.set_title('Cosine')

plt.tight_layout()
plt.show()`,
          order: 2,
        },
      ],
      alternatives: ['plotly', 'seaborn', 'bokeh'],
    },
    {
      name: 'scikit-rf',
      slug: 'scikit-rf',
      description: 'RF/Microwave engineering toolkit. Analyze S-parameters, design matching networks, and simulate RF circuits.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 980,
      forks: 245,
      downloads: 45000,
      license: 'BSD-3-Clause',
      githubUrl: 'https://github.com/scikit-rf/scikit-rf',
      registryUrl: 'https://pypi.org/project/scikit-rf/',
      docsUrl: 'https://scikit-rf.readthedocs.io/',
      installCommand: 'pip install scikit-rf',
      readme: 'scikit-rf is a Python library for RF/microwave engineering, providing tools for network analysis and circuit design.',
      categories: ['RF Engineering', 'Signal Processing'],
      examples: [
        {
          title: 'Load S-parameters',
          description: 'Read a Touchstone file and plot S11',
          code: `import skrf as rf

# Load a 2-port network from Touchstone file
ntwk = rf.Network('my_filter.s2p')

# Plot S11 in dB
ntwk.plot_s_db(m=0, n=0)

# Get S11 at specific frequency
s11_1ghz = ntwk['1ghz'].s[0, 0, 0]
print(f"S11 at 1GHz: {s11_1ghz}")`,
          order: 1,
        },
        {
          title: 'Smith Chart',
          description: 'Plot impedance on Smith chart',
          code: `import skrf as rf
import matplotlib.pyplot as plt

ntwk = rf.Network('antenna.s1p')

# Create Smith chart
ntwk.plot_s_smith(m=0, n=0)
plt.title('Antenna S11 - Smith Chart')
plt.show()`,
          order: 2,
        },
      ],
      alternatives: ['pyrf', 'gnuradio'],
    },
    {
      name: 'SciPy',
      slug: 'scipy',
      description: 'Scientific computing library with modules for optimization, linear algebra, integration, and signal processing.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 12600,
      forks: 5100,
      downloads: 95000000,
      license: 'BSD-3-Clause',
      githubUrl: 'https://github.com/scipy/scipy',
      registryUrl: 'https://pypi.org/project/scipy/',
      docsUrl: 'https://docs.scipy.org/',
      installCommand: 'pip install scipy',
      readme: 'SciPy provides algorithms for optimization, integration, interpolation, eigenvalue problems, and more.',
      categories: ['Scientific Computing', 'Signal Processing'],
      examples: [
        {
          title: 'Signal filtering',
          description: 'Design and apply a Butterworth filter',
          code: `from scipy import signal
import numpy as np

# Design 4th order Butterworth lowpass filter
b, a = signal.butter(4, 0.2, 'low')

# Apply filter to signal
data = np.random.randn(1000)
filtered = signal.filtfilt(b, a, data)`,
          order: 1,
        },
        {
          title: 'FFT analysis',
          description: 'Perform Fast Fourier Transform',
          code: `from scipy.fft import fft, fftfreq
import numpy as np

# Generate signal
t = np.linspace(0, 1, 1000)
signal = np.sin(2 * np.pi * 50 * t) + np.sin(2 * np.pi * 120 * t)

# Compute FFT
fft_vals = fft(signal)
fft_freq = fftfreq(len(t), t[1] - t[0])`,
          order: 2,
        },
      ],
      alternatives: ['numpy', 'numba'],
    },
    {
      name: 'Django',
      slug: 'django',
      description: 'High-level Python web framework that encourages rapid development and clean, pragmatic design.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 77000,
      forks: 30500,
      downloads: 25000000,
      license: 'BSD-3-Clause',
      githubUrl: 'https://github.com/django/django',
      registryUrl: 'https://pypi.org/project/Django/',
      docsUrl: 'https://docs.djangoproject.com/',
      installCommand: 'pip install django',
      readme: 'Django is a high-level Python web framework that encourages rapid development.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Create a view',
          description: 'Define a simple view function',
          code: `from django.http import HttpResponse
from django.shortcuts import render

def index(request):
    return HttpResponse("Hello, World!")

def dashboard(request):
    context = {'title': 'Dashboard'}
    return render(request, 'dashboard.html', context)`,
          order: 1,
        },
      ],
      alternatives: ['flask', 'fastapi'],
    },
    {
      name: 'FastAPI',
      slug: 'fastapi',
      description: 'Modern, fast web framework for building APIs with Python 3.7+ based on standard Python type hints.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 73000,
      forks: 6200,
      downloads: 35000000,
      license: 'MIT',
      githubUrl: 'https://github.com/tiangolo/fastapi',
      registryUrl: 'https://pypi.org/project/fastapi/',
      docsUrl: 'https://fastapi.tiangolo.com/',
      installCommand: 'pip install fastapi',
      readme: 'FastAPI is a modern, fast (high-performance), web framework for building APIs.',
      categories: ['Web Frameworks', 'API Development'],
      examples: [
        {
          title: 'Basic API',
          description: 'Create a simple REST API',
          code: `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}`,
          order: 1,
        },
      ],
      alternatives: ['flask', 'django'],
    },
    {
      name: 'Requests',
      slug: 'requests',
      description: 'Elegant and simple HTTP library for Python. The most popular way to make HTTP requests.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 51500,
      forks: 9300,
      downloads: 250000000,
      license: 'Apache-2.0',
      githubUrl: 'https://github.com/psf/requests',
      registryUrl: 'https://pypi.org/project/requests/',
      docsUrl: 'https://requests.readthedocs.io/',
      installCommand: 'pip install requests',
      readme: 'Requests is an elegant and simple HTTP library for Python, built for human beings.',
      categories: ['API Development'],
      examples: [
        {
          title: 'GET request',
          description: 'Make a simple HTTP GET request',
          code: `import requests

response = requests.get('https://api.github.com/users/octocat')

print(response.status_code)  # 200
print(response.json()['name'])  # The Octocat`,
          order: 1,
        },
        {
          title: 'POST with JSON',
          description: 'Send JSON data in a POST request',
          code: `import requests

data = {'name': 'Alice', 'age': 30}
response = requests.post('https://api.example.com/users', json=data)

if response.status_code == 201:
    print('User created:', response.json())`,
          order: 2,
        },
      ],
      alternatives: ['httpx', 'aiohttp'],
    },
    {
      name: 'Pytest',
      slug: 'pytest',
      description: 'Mature full-featured Python testing framework. Makes it easy to write small, readable tests.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 11400,
      forks: 2600,
      downloads: 85000000,
      license: 'MIT',
      githubUrl: 'https://github.com/pytest-dev/pytest',
      registryUrl: 'https://pypi.org/project/pytest/',
      docsUrl: 'https://docs.pytest.org/',
      installCommand: 'pip install pytest',
      readme: 'The pytest framework makes it easy to write small tests, yet scales to support complex testing.',
      categories: ['Testing'],
      examples: [
        {
          title: 'Simple test',
          description: 'Write a basic test function',
          code: `def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0`,
          order: 1,
        },
      ],
      alternatives: ['unittest', 'nose2'],
    },
    {
      name: 'SQLAlchemy',
      slug: 'sqlalchemy',
      description: 'Python SQL toolkit and Object-Relational Mapper giving full power and flexibility of SQL.',
      language: Language.PYTHON,
      ecosystem: 'pypi',
      stars: 8900,
      forks: 1400,
      downloads: 72000000,
      license: 'MIT',
      githubUrl: 'https://github.com/sqlalchemy/sqlalchemy',
      registryUrl: 'https://pypi.org/project/SQLAlchemy/',
      docsUrl: 'https://www.sqlalchemy.org/',
      installCommand: 'pip install sqlalchemy',
      readme: 'SQLAlchemy is the Python SQL toolkit and ORM that gives developers the full power of SQL.',
      categories: ['Database'],
      examples: [
        {
          title: 'Define a model',
          description: 'Create an ORM model',
          code: `from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)`,
          order: 1,
        },
      ],
      alternatives: ['django-orm', 'peewee'],
    },
  ];

  for (const pkgData of pythonPackages) {
    const { categories: categoryNames, examples, alternatives, ...packageInfo } = pkgData;
    
    const pkg = await prisma.package.create({
      data: {
        ...packageInfo,
        lastUpdated: new Date(),
        popularityScore: packageInfo.stars / 1000,
      },
    });

    // Connect categories
    for (const catName of categoryNames) {
      const category = await prisma.category.findUnique({ where: { name: catName } });
      if (category) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: { categories: { connect: { id: category.id } } },
        });
      }
    }

    // Create examples
    for (const example of examples) {
      await prisma.example.create({
        data: {
          ...example,
          language: 'python',
          packageId: pkg.id,
        },
      });
    }

    console.log(`  ✅ ${pkg.name}`);
  }

  console.log(`\n✅ Created ${pythonPackages.length} Python packages\n`);

  // Node.js Packages
  console.log('📦 Creating Node.js packages...');
  
  const nodejsPackages = [
    {
      name: 'Express',
      slug: 'express',
      description: 'Fast, unopinionated, minimalist web framework for Node.js. The de-facto standard for Node.js web apps.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 64000,
      forks: 15000,
      downloads: 90000000,
      license: 'MIT',
      githubUrl: 'https://github.com/expressjs/express',
      registryUrl: 'https://www.npmjs.com/package/express',
      docsUrl: 'https://expressjs.com/',
      installCommand: 'npm install express',
      readme: 'Express is a minimal and flexible Node.js web application framework.',
      categories: ['Web Frameworks', 'API Development'],
      examples: [
        {
          title: 'Basic server',
          description: 'Create a simple Express server',
          code: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
          order: 1,
        },
        {
          title: 'REST API',
          description: 'Build a REST API with routes',
          code: `const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

app.listen(3000);`,
          order: 2,
        },
      ],
      alternatives: ['fastify', 'koa', 'hapi'],
    },
    {
      name: 'React',
      slug: 'react',
      description: 'JavaScript library for building user interfaces. Maintained by Meta and used by millions of developers.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 223000,
      forks: 45500,
      downloads: 180000000,
      license: 'MIT',
      githubUrl: 'https://github.com/facebook/react',
      registryUrl: 'https://www.npmjs.com/package/react',
      docsUrl: 'https://react.dev/',
      installCommand: 'npm install react react-dom',
      readme: 'React is a JavaScript library for building user interfaces.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Component',
          description: 'Create a functional component',
          code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
          order: 1,
        },
      ],
      alternatives: ['vue', 'angular', 'svelte'],
    },
    {
      name: 'Next.js',
      slug: 'nextjs',
      description: 'React framework for production with hybrid static & server rendering, TypeScript support, and more.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 122000,
      forks: 26000,
      downloads: 12000000,
      license: 'MIT',
      githubUrl: 'https://github.com/vercel/next.js',
      registryUrl: 'https://www.npmjs.com/package/next',
      docsUrl: 'https://nextjs.org/docs',
      installCommand: 'npx create-next-app@latest',
      readme: 'Next.js is a React framework for building full-stack web applications.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Page component',
          description: 'Create a Next.js page',
          code: `// app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <p>The React Framework for the Web</p>
    </main>
  );
}`,
          order: 1,
        },
      ],
      alternatives: ['remix', 'gatsby'],
    },
    {
      name: 'Axios',
      slug: 'axios',
      description: 'Promise-based HTTP client for the browser and Node.js. Simple, elegant, and powerful.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 104000,
      forks: 10800,
      downloads: 150000000,
      license: 'MIT',
      githubUrl: 'https://github.com/axios/axios',
      registryUrl: 'https://www.npmjs.com/package/axios',
      docsUrl: 'https://axios-http.com/',
      installCommand: 'npm install axios',
      readme: 'Promise based HTTP client for the browser and node.js.',
      categories: ['API Development'],
      examples: [
        {
          title: 'GET request',
          description: 'Make an HTTP GET request',
          code: `const axios = require('axios');

axios.get('https://api.github.com/users/octocat')
  .then(response => {
    console.log(response.data.name);
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
          order: 1,
        },
        {
          title: 'POST with async/await',
          description: 'Send data with POST request',
          code: `const axios = require('axios');

async function createUser() {
  try {
    const response = await axios.post('https://api.example.com/users', {
      name: 'Alice',
      email: 'alice@example.com'
    });
    console.log('User created:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUser();`,
          order: 2,
        },
      ],
      alternatives: ['fetch', 'node-fetch', 'got'],
    },
    {
      name: 'Lodash',
      slug: 'lodash',
      description: 'Modern JavaScript utility library delivering modularity, performance & extras. Array, object, string helpers.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 59000,
      forks: 7000,
      downloads: 160000000,
      license: 'MIT',
      githubUrl: 'https://github.com/lodash/lodash',
      registryUrl: 'https://www.npmjs.com/package/lodash',
      docsUrl: 'https://lodash.com/docs/',
      installCommand: 'npm install lodash',
      readme: 'A modern JavaScript utility library delivering modularity, performance, & extras.',
      categories: ['CLI Tools'],
      examples: [
        {
          title: 'Array operations',
          description: 'Common array utilities',
          code: `const _ = require('lodash');

const numbers = [1, 2, 3, 4, 5, 6];

// Chunk array
const chunked = _.chunk(numbers, 2);
// [[1, 2], [3, 4], [5, 6]]

// Get unique values
const duplicates = [1, 2, 2, 3, 3, 3];
const unique = _.uniq(duplicates);
// [1, 2, 3]`,
          order: 1,
        },
      ],
      alternatives: ['ramda', 'underscore'],
    },
    {
      name: 'Jest',
      slug: 'jest',
      description: 'Delightful JavaScript testing framework with a focus on simplicity. Works with React, Vue, Angular, Node.js.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 43700,
      forks: 6400,
      downloads: 75000000,
      license: 'MIT',
      githubUrl: 'https://github.com/facebook/jest',
      registryUrl: 'https://www.npmjs.com/package/jest',
      docsUrl: 'https://jestjs.io/',
      installCommand: 'npm install --save-dev jest',
      readme: 'Jest is a delightful JavaScript Testing Framework with a focus on simplicity.',
      categories: ['Testing'],
      examples: [
        {
          title: 'Basic test',
          description: 'Write a simple unit test',
          code: `// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('adds -1 + 1 to equal 0', () => {
  expect(sum(-1, 1)).toBe(0);
});`,
          order: 1,
        },
      ],
      alternatives: ['vitest', 'mocha', 'jasmine'],
    },
    {
      name: 'Prisma',
      slug: 'prisma',
      description: 'Next-generation ORM for Node.js & TypeScript. Type-safe database access, migrations, and introspection.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 37000,
      forks: 1500,
      downloads: 8000000,
      license: 'Apache-2.0',
      githubUrl: 'https://github.com/prisma/prisma',
      registryUrl: 'https://www.npmjs.com/package/prisma',
      docsUrl: 'https://www.prisma.io/docs',
      installCommand: 'npm install prisma @prisma/client',
      readme: 'Prisma is a next-generation ORM for Node.js and TypeScript.',
      categories: ['Database'],
      examples: [
        {
          title: 'Query database',
          description: 'Fetch data with Prisma Client',
          code: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all users
  const users = await prisma.user.findMany();
  
  // Create new user
  const newUser = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com'
    }
  });
  
  console.log(users);
}

main();`,
          order: 1,
        },
      ],
      alternatives: ['typeorm', 'sequelize', 'drizzle'],
    },
    {
      name: 'TypeScript',
      slug: 'typescript',
      description: 'Typed superset of JavaScript that compiles to plain JavaScript. Adds optional static typing.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 98000,
      forks: 12700,
      downloads: 95000000,
      license: 'Apache-2.0',
      githubUrl: 'https://github.com/microsoft/TypeScript',
      registryUrl: 'https://www.npmjs.com/package/typescript',
      docsUrl: 'https://www.typescriptlang.org/',
      installCommand: 'npm install -D typescript',
      readme: 'TypeScript is a language for application-scale JavaScript.',
      categories: ['CLI Tools'],
      examples: [
        {
          title: 'Type annotations',
          description: 'Add types to JavaScript',
          code: `// Define interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

// Type-safe function
function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

// Usage
const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};

console.log(greetUser(user));`,
          order: 1,
        },
      ],
      alternatives: ['flow', 'jsdoc'],
    },
    {
      name: 'Socket.IO',
      slug: 'socketio',
      description: 'Realtime application framework enabling bidirectional communication between clients and servers.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 60000,
      forks: 10100,
      downloads: 18000000,
      license: 'MIT',
      githubUrl: 'https://github.com/socketio/socket.io',
      registryUrl: 'https://www.npmjs.com/package/socket.io',
      docsUrl: 'https://socket.io/docs/',
      installCommand: 'npm install socket.io',
      readme: 'Socket.IO enables real-time bidirectional event-based communication.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Server setup',
          description: 'Create a Socket.IO server',
          code: `const { Server } = require('socket.io');
const io = new Server(3000);

io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});`,
          order: 1,
        },
      ],
      alternatives: ['ws', 'uwebsockets'],
    },
    {
      name: 'date-fns',
      slug: 'date-fns',
      description: 'Modern JavaScript date utility library. Modular, immutable, and simple API for manipulating dates.',
      language: Language.NODEJS,
      ecosystem: 'npm',
      stars: 33500,
      forks: 1800,
      downloads: 95000000,
      license: 'MIT',
      githubUrl: 'https://github.com/date-fns/date-fns',
      registryUrl: 'https://www.npmjs.com/package/date-fns',
      docsUrl: 'https://date-fns.org/',
      installCommand: 'npm install date-fns',
      readme: 'Modern JavaScript date utility library - simple, consistent, immutable.',
      categories: ['CLI Tools'],
      examples: [
        {
          title: 'Format dates',
          description: 'Format and parse dates',
          code: `import { format, parseISO, addDays } from 'date-fns';

// Format date
const date = new Date();
console.log(format(date, 'yyyy-MM-dd'));
// 2024-01-19

// Add days
const tomorrow = addDays(date, 1);

// Parse ISO string
const parsed = parseISO('2024-01-19T12:00:00');`,
          order: 1,
        },
      ],
      alternatives: ['dayjs', 'luxon', 'moment'],
    },
  ];

  for (const pkgData of nodejsPackages) {
    const { categories: categoryNames, examples, alternatives, ...packageInfo } = pkgData;
    
    const pkg = await prisma.package.create({
      data: {
        ...packageInfo,
        lastUpdated: new Date(),
        popularityScore: packageInfo.stars / 1000,
      },
    });

    for (const catName of categoryNames) {
      const category = await prisma.category.findUnique({ where: { name: catName } });
      if (category) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: { categories: { connect: { id: category.id } } },
        });
      }
    }

    for (const example of examples) {
      await prisma.example.create({
        data: {
          ...example,
          language: 'javascript',
          packageId: pkg.id,
        },
      });
    }

    console.log(`  ✅ ${pkg.name}`);
  }

  console.log(`\n✅ Created ${nodejsPackages.length} Node.js packages\n`);

  // Rust Packages
  console.log('🦀 Creating Rust packages...');
  
  const rustPackages = [
    {
      name: 'Tokio',
      slug: 'tokio',
      description: 'Runtime for writing reliable asynchronous applications with Rust. Provides async I/O, networking, and more.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 25000,
      forks: 2300,
      downloads: 45000000,
      license: 'MIT',
      githubUrl: 'https://github.com/tokio-rs/tokio',
      registryUrl: 'https://crates.io/crates/tokio',
      docsUrl: 'https://docs.rs/tokio/',
      installCommand: 'cargo add tokio',
      readme: 'Tokio is an asynchronous runtime for the Rust programming language.',
      categories: ['Async Programming'],
      examples: [
        {
          title: 'Async function',
          description: 'Create an async Tokio application',
          code: `use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    println!("Starting...");
    
    sleep(Duration::from_secs(1)).await;
    
    println!("Done!");
}`,
          order: 1,
        },
        {
          title: 'Spawn tasks',
          description: 'Run multiple tasks concurrently',
          code: `use tokio::task;

#[tokio::main]
async fn main() {
    let task1 = task::spawn(async {
        println!("Task 1");
    });
    
    let task2 = task::spawn(async {
        println!("Task 2");
    });
    
    let _ = tokio::join!(task1, task2);
}`,
          order: 2,
        },
      ],
      alternatives: ['async-std', 'smol'],
    },
    {
      name: 'Serde',
      slug: 'serde',
      description: 'Serialization framework for Rust. Efficiently serialize and deserialize data structures.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 8700,
      forks: 780,
      downloads: 180000000,
      license: 'MIT',
      githubUrl: 'https://github.com/serde-rs/serde',
      registryUrl: 'https://crates.io/crates/serde',
      docsUrl: 'https://serde.rs/',
      installCommand: 'cargo add serde serde_json',
      readme: 'Serde is a framework for serializing and deserializing Rust data structures.',
      categories: ['CLI Tools'],
      examples: [
        {
          title: 'Serialize struct',
          description: 'Convert struct to JSON',
          code: `use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    age: u32,
    email: String,
}

fn main() {
    let user = User {
        name: "Alice".to_string(),
        age: 30,
        email: "alice@example.com".to_string(),
    };
    
    let json = serde_json::to_string(&user).unwrap();
    println!("{}", json);
}`,
          order: 1,
        },
      ],
      alternatives: ['bincode', 'postcard'],
    },
    {
      name: 'Actix-web',
      slug: 'actix-web',
      description: 'Powerful, pragmatic, and extremely fast web framework for Rust. High performance HTTP server.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 20500,
      forks: 1600,
      downloads: 8000000,
      license: 'MIT',
      githubUrl: 'https://github.com/actix/actix-web',
      registryUrl: 'https://crates.io/crates/actix-web',
      docsUrl: 'https://actix.rs/',
      installCommand: 'cargo add actix-web',
      readme: 'Actix Web is a powerful, pragmatic, and extremely fast web framework for Rust.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Basic server',
          description: 'Create a simple HTTP server',
          code: `use actix_web::{web, App, HttpResponse, HttpServer};

async fn index() -> HttpResponse {
    HttpResponse::Ok().body("Hello World!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}`,
          order: 1,
        },
      ],
      alternatives: ['axum', 'rocket', 'warp'],
    },
    {
      name: 'Rocket',
      slug: 'rocket',
      description: 'Web framework for Rust that makes it simple to write fast, secure web applications.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 23500,
      forks: 1500,
      downloads: 2500000,
      license: 'MIT',
      githubUrl: 'https://github.com/SergioBenitez/Rocket',
      registryUrl: 'https://crates.io/crates/rocket',
      docsUrl: 'https://rocket.rs/',
      installCommand: 'cargo add rocket',
      readme: 'Rocket is a web framework for Rust that makes it simple to write fast, secure web applications.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Hello endpoint',
          description: 'Create a simple route',
          code: `#[macro_use] extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/hello/<name>")]
fn hello(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, hello])
}`,
          order: 1,
        },
      ],
      alternatives: ['actix-web', 'axum'],
    },
    {
      name: 'SQLx',
      slug: 'sqlx',
      description: 'Async SQL toolkit for Rust. Compile-time checked queries without a DSL. Supports PostgreSQL, MySQL, SQLite.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 12000,
      forks: 1100,
      downloads: 5500000,
      license: 'MIT',
      githubUrl: 'https://github.com/launchbadge/sqlx',
      registryUrl: 'https://crates.io/crates/sqlx',
      docsUrl: 'https://docs.rs/sqlx/',
      installCommand: 'cargo add sqlx',
      readme: 'SQLx is an async, pure Rust SQL crate featuring compile-time checked queries.',
      categories: ['Database'],
      examples: [
        {
          title: 'Query database',
          description: 'Execute SQL queries with compile-time checking',
          code: `use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    let pool = PgPoolOptions::new()
        .connect("postgres://user:pass@localhost/db")
        .await?;
    
    let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;
    
    println!("User count: {}", row.0);
    Ok(())
}`,
          order: 1,
        },
      ],
      alternatives: ['diesel', 'sea-orm'],
    },
    {
      name: 'Clap',
      slug: 'clap',
      description: 'Command Line Argument Parser for Rust. Build powerful CLI applications with ease.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 13500,
      forks: 1000,
      downloads: 85000000,
      license: 'MIT',
      githubUrl: 'https://github.com/clap-rs/clap',
      registryUrl: 'https://crates.io/crates/clap',
      docsUrl: 'https://docs.rs/clap/',
      installCommand: 'cargo add clap',
      readme: 'Clap is a simple-to-use, efficient, and full-featured Command Line Argument Parser.',
      categories: ['CLI Tools'],
      examples: [
        {
          title: 'Parse arguments',
          description: 'Create a CLI application',
          code: `use clap::Parser;

#[derive(Parser)]
#[command(name = "myapp")]
#[command(about = "A CLI tool", long_about = None)]
struct Cli {
    #[arg(short, long)]
    name: String,
    
    #[arg(short, long, default_value_t = 1)]
    count: u8,
}

fn main() {
    let cli = Cli::parse();
    
    for _ in 0..cli.count {
        println!("Hello {}!", cli.name);
    }
}`,
          order: 1,
        },
      ],
      alternatives: ['structopt', 'argh'],
    },
    {
      name: 'Reqwest',
      slug: 'reqwest',
      description: 'Easy and powerful Rust HTTP client. Async/await support with excellent ergonomics.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 9300,
      forks: 980,
      downloads: 38000000,
      license: 'MIT',
      githubUrl: 'https://github.com/seanmonstar/reqwest',
      registryUrl: 'https://crates.io/crates/reqwest',
      docsUrl: 'https://docs.rs/reqwest/',
      installCommand: 'cargo add reqwest',
      readme: 'An ergonomic, batteries-included HTTP Client for Rust.',
      categories: ['API Development'],
      examples: [
        {
          title: 'GET request',
          description: 'Make an HTTP GET request',
          code: `use reqwest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let body = reqwest::get("https://api.github.com/users/octocat")
        .await?
        .text()
        .await?;
    
    println!("Body:\\n{}", body);
    Ok(())
}`,
          order: 1,
        },
      ],
      alternatives: ['hyper', 'ureq'],
    },
    {
      name: 'Rayon',
      slug: 'rayon',
      description: 'Data parallelism library for Rust. Easily convert sequential computations into parallel ones.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 10300,
      forks: 500,
      downloads: 48000000,
      license: 'MIT',
      githubUrl: 'https://github.com/rayon-rs/rayon',
      registryUrl: 'https://crates.io/crates/rayon',
      docsUrl: 'https://docs.rs/rayon/',
      installCommand: 'cargo add rayon',
      readme: 'Rayon is a data-parallelism library for Rust.',
      categories: ['Async Programming'],
      examples: [
        {
          title: 'Parallel iteration',
          description: 'Process collections in parallel',
          code: `use rayon::prelude::*;

fn main() {
    let numbers: Vec<i32> = (1..1000).collect();
    
    // Sequential
    let sum: i32 = numbers.iter().sum();
    
    // Parallel - just add par_iter()!
    let par_sum: i32 = numbers.par_iter().sum();
    
    println!("Sum: {}", par_sum);
}`,
          order: 1,
        },
      ],
      alternatives: ['crossbeam', 'tokio'],
    },
    {
      name: 'Axum',
      slug: 'axum',
      description: 'Ergonomic and modular web framework built with Tokio, Tower, and Hyper. From the Tokio team.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 17000,
      forks: 900,
      downloads: 4500000,
      license: 'MIT',
      githubUrl: 'https://github.com/tokio-rs/axum',
      registryUrl: 'https://crates.io/crates/axum',
      docsUrl: 'https://docs.rs/axum/',
      installCommand: 'cargo add axum tokio',
      readme: 'Axum is a web application framework that focuses on ergonomics and modularity.',
      categories: ['Web Frameworks'],
      examples: [
        {
          title: 'Basic API',
          description: 'Create a simple REST API',
          code: `use axum::{routing::get, Router};

async fn handler() -> &'static str {
    "Hello, World!"
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(handler));
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
        
    axum::serve(listener, app).await.unwrap();
}`,
          order: 1,
        },
      ],
      alternatives: ['actix-web', 'rocket'],
    },
    {
      name: 'Diesel',
      slug: 'diesel',
      description: 'Safe, extensible ORM and Query Builder for Rust. Compile-time guarantees against incorrect database operations.',
      language: Language.RUST,
      ecosystem: 'crates.io',
      stars: 12000,
      forks: 1000,
      downloads: 7500000,
      license: 'MIT',
      githubUrl: 'https://github.com/diesel-rs/diesel',
      registryUrl: 'https://crates.io/crates/diesel',
      docsUrl: 'https://diesel.rs/',
      installCommand: 'cargo add diesel',
      readme: 'Diesel is a safe, extensible ORM and Query Builder for Rust.',
      categories: ['Database'],
      examples: [
        {
          title: 'Query with DSL',
          description: 'Use Diesel query builder',
          code: `use diesel::prelude::*;

#[derive(Queryable)]
struct User {
    id: i32,
    name: String,
    email: String,
}

fn main() {
    use schema::users::dsl::*;
    
    let connection = &mut establish_connection();
    let results = users
        .filter(name.like("%Alice%"))
        .limit(5)
        .load::<User>(connection)
        .expect("Error loading users");
        
    for user in results {
        println!("{}: {}", user.name, user.email);
    }
}`,
          order: 1,
        },
      ],
      alternatives: ['sqlx', 'sea-orm'],
    },
  ];

  for (const pkgData of rustPackages) {
    const { categories: categoryNames, examples, alternatives, ...packageInfo } = pkgData;
    
    const pkg = await prisma.package.create({
      data: {
        ...packageInfo,
        lastUpdated: new Date(),
        popularityScore: packageInfo.stars / 1000,
      },
    });

    for (const catName of categoryNames) {
      const category = await prisma.category.findUnique({ where: { name: catName } });
      if (category) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: { categories: { connect: { id: category.id } } },
        });
      }
    }

    for (const example of examples) {
      await prisma.example.create({
        data: {
          ...example,
          language: 'rust',
          packageId: pkg.id,
        },
      });
    }

    console.log(`  ✅ ${pkg.name}`);
  }

  console.log(`\n✅ Created ${rustPackages.length} Rust packages\n`);

  // Create alternatives relationships
  console.log('🔗 Creating alternative package relationships...');
  
  const alternativeMap: Record<string, string[]> = {
    'numpy': ['scipy', 'pandas'],
    'matplotlib': ['plotly'],
    'express': ['fastify'],
    'react': ['nextjs'],
    'tokio': ['rayon'],
    'actix-web': ['rocket', 'axum'],
  };

  for (const [pkgSlug, altSlugs] of Object.entries(alternativeMap)) {
    const pkg = await prisma.package.findUnique({ where: { slug: pkgSlug } });
    if (!pkg) continue;

    for (const altSlug of altSlugs) {
      const alt = await prisma.package.findUnique({ where: { slug: altSlug } });
      if (!alt) continue;

      await prisma.alternative.create({
        data: {
          packageId: pkg.id,
          alternativeId: alt.id,
          reason: 'Similar functionality with different approach',
        },
      });
    }
  }

  console.log('✅ Created alternative relationships\n');

  // Summary
  const totalPackages = await prisma.package.count();
  const totalCategories = await prisma.category.count();
  const totalExamples = await prisma.example.count();
  const totalAlternatives = await prisma.alternative.count();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SEED COMPLETE!\n');
  console.log(`📦 Total Packages:     ${totalPackages}`);
  console.log(`📂 Total Categories:   ${totalCategories}`);
  console.log(`📝 Total Examples:     ${totalExamples}`);
  console.log(`🔗 Total Alternatives: ${totalAlternatives}\n`);
  console.log('Breakdown by language:');
  
  const pythonCount = await prisma.package.count({ where: { language: 'PYTHON' } });
  const nodejsCount = await prisma.package.count({ where: { language: 'NODEJS' } });
  const rustCount = await prisma.package.count({ where: { language: 'RUST' } });
  
  console.log(`  🐍 Python:  ${pythonCount} packages`);
  console.log(`  📦 Node.js: ${nodejsCount} packages`);
  console.log(`  🦀 Rust:    ${rustCount} packages\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ Your database is ready! Test it with:');
  console.log('   curl http://localhost:3001/api/packages\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
