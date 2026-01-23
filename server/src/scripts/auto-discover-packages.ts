import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DiscoveredPackage {
  name: string;
  language: string;
  ecosystem: string;
  categories: string[];
  githubRepo: string;
}

/**
 * 🤖 AUTOMATED PACKAGE DISCOVERY
 * Automatically fetches popular packages from each registry
 * No manual data entry needed!
 */

// ============= NPM (Node.js) =============
async function discoverNpmPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n📦 Discovering top ${limit} npm packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Use npm registry search API directly
    const response = await axios.get(`https://registry.npmjs.org/-/v1/search`, {
      params: {
        text: 'not:deprecated boost-exact:false',
        size: limit,
        popularity: 1.0,
      },
    });

    for (const result of response.data.objects) {
      const pkg = result.package;
      
      // Extract GitHub repo from links
      let githubRepo = '';
      if (pkg.links?.repository) {
        const match = pkg.links.repository.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match) githubRepo = match[1].replace('.git', '');
      }

      if (githubRepo) {
        packages.push({
          name: pkg.name,
          language: 'nodejs',
          ecosystem: 'npm',
          categories: pkg.keywords?.slice(0, 3) || ['Utilities'],
          githubRepo,
        });
      }
    }

    console.log(`   ✅ Found ${packages.length} npm packages with GitHub repos`);
  } catch (error: unknown) {
    console.error(`   ❌ Error discovering npm packages:`, error instanceof Error ? error.message : String(error));
  }

  return packages;
}

// ============= PyPI (Python) =============
async function discoverPyPiPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n🐍 Discovering top ${limit} PyPI packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Fetch from PyPI's search API or use curated list
    const topPackages = [
      'requests', 'flask', 'django', 'numpy', 'pandas', 'scipy', 'matplotlib',
      'tensorflow', 'pytorch', 'scikit-learn', 'beautifulsoup4', 'pillow',
      'sqlalchemy', 'celery', 'pytest', 'black', 'mypy', 'pydantic', 'fastapi',
      'opencv-python', 'selenium', 'scrapy', 'jupyter', 'ipython', 'notebook',
      'transformers', 'torch', 'keras', 'nltk', 'spacy', 'gensim', 'xgboost',
      'lightgbm', 'catboost', 'statsmodels', 'seaborn', 'plotly', 'bokeh',
      'dash', 'streamlit', 'gradio', 'poetry', 'pipenv', 'tox', 'pytest-cov',
    ];

    for (const pkgName of topPackages.slice(0, limit)) {
      try {
        const response = await axios.get(`https://pypi.org/pypi/${pkgName}/json`);
        const data = response.data;
        
        // Try to extract GitHub repo from project URLs
        let githubRepo = '';
        if (data.info.project_urls) {
          for (const [, url] of Object.entries(data.info.project_urls)) {
            const match = (url as string).match(/github\.com\/([^/]+\/[^/]+)/);
            if (match) {
              githubRepo = match[1].replace('.git', '');
              break;
            }
          }
        }

        if (githubRepo) {
          packages.push({
            name: pkgName,
            language: 'python',
            ecosystem: 'pypi',
            categories: data.info.classifiers
              ?.filter((c: string) => c.includes('Topic'))
              .slice(0, 2)
              .map((c: string) => c.split('::').pop()?.trim() || 'Utilities') || ['Utilities'],
            githubRepo,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
      } catch (error: unknown) {
        console.log(`   ⚠️  Skipped ${pkgName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`   ✅ Found ${packages.length} PyPI packages with GitHub repos`);
  } catch (error: unknown) {
    console.error(`   ❌ Error discovering PyPI packages:`, error instanceof Error ? error.message : String(error));
  }

  return packages;
}

// ============= Crates.io (Rust) =============
async function discoverCratesIoPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n🦀 Discovering top ${limit} crates.io packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Crates.io API - sorted by downloads
    const response = await axios.get(`https://crates.io/api/v1/crates`, {
      params: {
        page: 1,
        per_page: limit,
        sort: 'downloads',
      },
    });

    for (const crate of response.data.crates) {
      if (crate.repository) {
        const match = crate.repository.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match) {
          const githubRepo = match[1].replace('.git', '');
          packages.push({
            name: crate.name,
            language: 'rust',
            ecosystem: 'crates.io',
            categories: crate.keywords?.slice(0, 3) || ['Utilities'],
            githubRepo,
          });
        }
      }
    }

    console.log(`   ✅ Found ${packages.length} crates.io packages with GitHub repos`);
  } catch (error: unknown) {
    console.error(`   ❌ Error discovering crates.io packages:`, error instanceof Error ? error.message : String(error));
  }

  return packages;
}

// ============= pkg.go.dev (Go) =============
async function discoverGoPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n🔷 Discovering top ${limit} Go packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular Go packages
  const topGoPackages = [
    { name: 'gin', repo: 'gin-gonic/gin', categories: ['Web Frameworks'] },
    { name: 'echo', repo: 'labstack/echo', categories: ['Web Frameworks'] },
    { name: 'fiber', repo: 'gofiber/fiber', categories: ['Web Frameworks'] },
    { name: 'chi', repo: 'go-chi/chi', categories: ['Web Frameworks'] },
    { name: 'gorilla/mux', repo: 'gorilla/mux', categories: ['Routing'] },
    { name: 'gorm', repo: 'go-gorm/gorm', categories: ['Database'] },
    { name: 'sqlx', repo: 'jmoiron/sqlx', categories: ['Database'] },
    { name: 'cobra', repo: 'spf13/cobra', categories: ['CLI Tools'] },
    { name: 'viper', repo: 'spf13/viper', categories: ['Configuration'] },
    { name: 'zap', repo: 'uber-go/zap', categories: ['Logging'] },
    { name: 'logrus', repo: 'sirupsen/logrus', categories: ['Logging'] },
    { name: 'testify', repo: 'stretchr/testify', categories: ['Testing'] },
    { name: 'colly', repo: 'gocolly/colly', categories: ['Web Scraping'] },
    { name: 'chromedp', repo: 'chromedp/chromedp', categories: ['Automation'] },
    { name: 'go-redis', repo: 'redis/go-redis', categories: ['Database'] },
    { name: 'mongo-go-driver', repo: 'mongodb/mongo-go-driver', categories: ['Database'] },
    { name: 'grpc-go', repo: 'grpc/grpc-go', categories: ['RPC'] },
    { name: 'protobuf', repo: 'golang/protobuf', categories: ['Serialization'] },
  ];

  packages.push(...topGoPackages.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'go',
    ecosystem: 'pkg.go.dev',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} Go packages`);
  return packages;
}

// ============= Maven (Java) =============
async function discoverMavenPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n☕ Discovering top ${limit} Maven packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular Java packages
  const topJavaPackages = [
    { name: 'spring-boot', repo: 'spring-projects/spring-boot', categories: ['Web Frameworks'] },
    { name: 'spring-framework', repo: 'spring-projects/spring-framework', categories: ['Frameworks'] },
    { name: 'hibernate', repo: 'hibernate/hibernate-orm', categories: ['ORM'] },
    { name: 'junit5', repo: 'junit-team/junit5', categories: ['Testing'] },
    { name: 'mockito', repo: 'mockito/mockito', categories: ['Testing'] },
    { name: 'lombok', repo: 'projectlombok/lombok', categories: ['Utilities'] },
    { name: 'guava', repo: 'google/guava', categories: ['Utilities'] },
    { name: 'jackson', repo: 'FasterXML/jackson', categories: ['JSON'] },
    { name: 'gson', repo: 'google/gson', categories: ['JSON'] },
    { name: 'okhttp', repo: 'square/okhttp', categories: ['HTTP Client'] },
    { name: 'retrofit', repo: 'square/retrofit', categories: ['HTTP Client'] },
    { name: 'netty', repo: 'netty/netty', categories: ['Networking'] },
    { name: 'kafka', repo: 'apache/kafka', categories: ['Messaging'] },
    { name: 'elasticsearch', repo: 'elastic/elasticsearch', categories: ['Search'] },
  ];

  packages.push(...topJavaPackages.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'java',
    ecosystem: 'maven',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} Java packages`);
  return packages;
}

// ============= NuGet (C#) =============
async function discoverNuGetPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n💜 Discovering top ${limit} NuGet packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Use NuGet API v3
    const response = await axios.get(`https://api-v2v3search-0.nuget.org/query`, {
      params: {
        q: '',
        take: limit,
        prerelease: false,
      },
    });

    for (const pkg of response.data.data) {
      let githubRepo = '';
      
      // Try to find GitHub repo in projectUrl or repository
      if (pkg.projectUrl) {
        const match = pkg.projectUrl.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match) githubRepo = match[1].replace('.git', '');
      }

      if (githubRepo) {
        packages.push({
          name: pkg.id,
          language: 'csharp',
          ecosystem: 'nuget',
          categories: pkg.tags?.slice(0, 3) || ['Utilities'],
          githubRepo,
        });
      }
    }

    console.log(`   ✅ Found ${packages.length} NuGet packages with GitHub repos`);
  } catch (error: any) {
    console.error(`   ❌ Error discovering NuGet packages:`, error.message);
  }

  return packages;
}

// ============= RubyGems (Ruby) =============
async function discoverRubyGemsPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n💎 Discovering top ${limit} RubyGems...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Use RubyGems API - get most downloaded gems
    const response = await axios.get('https://rubygems.org/api/v1/downloads/top.json', {
      params: { period: 'total' },
    });

    const gems = response.data.gems || [];
    
    for (const gem of gems.slice(0, limit)) {
      let githubRepo = '';
      
      // Get gem details for source code URL
      try {
        const detailResponse = await axios.get(`https://rubygems.org/api/v1/gems/${gem[0]}.json`);
        const gemData = detailResponse.data;
        
        if (gemData.source_code_uri) {
          const match = gemData.source_code_uri.match(/github\.com\/([^/]+\/[^/]+)/);
          if (match) githubRepo = match[1].replace('.git', '');
        } else if (gemData.homepage_uri) {
          const match = gemData.homepage_uri.match(/github\.com\/([^/]+\/[^/]+)/);
          if (match) githubRepo = match[1].replace('.git', '');
        }

        if (githubRepo) {
          packages.push({
            name: gem[0],
            language: 'ruby',
            ecosystem: 'rubygems',
            categories: ['Utilities'],
            githubRepo,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 150)); // Rate limit
      } catch (error) {
        // Skip if gem details fail
      }
    }

    console.log(`   ✅ Found ${packages.length} RubyGems with GitHub repos`);
  } catch (error: any) {
    console.error(`   ❌ Error discovering RubyGems:`, error.message);
  }

  return packages;
}

// ============= Packagist (PHP) =============
async function discoverPackagistPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n🐘 Discovering top ${limit} Packagist packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Search for popular PHP frameworks and libraries
    const searchTerms = ['laravel', 'symfony', 'framework', 'api', 'http', 'database', 'test', 'orm', 'cache'];
    
    for (const term of searchTerms) {
      try {
        const response = await axios.get('https://packagist.org/search.json', {
          params: {
            q: term,
            per_page: 15,
          },
        });

        for (const pkg of response.data.results) {
          if (packages.length >= limit) break;
          
          if (pkg.repository) {
            const match = pkg.repository.match(/github\.com\/([^/]+\/[^/]+)/);
            if (match && !packages.find(p => p.name === pkg.name)) {
              packages.push({
                name: pkg.name,
                language: 'php',
                ecosystem: 'packagist',
                categories: ['Utilities'],
                githubRepo: match[1].replace('.git', ''),
              });
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
      } catch (error) {
        // Skip this search term
      }
      
      if (packages.length >= limit) break;
    }

    console.log(`   ✅ Found ${packages.length} Packagist packages with GitHub repos`);
  } catch (error: any) {
    console.error(`   ❌ Error discovering Packagist packages:`, error.message);
  }

  return packages;
}

// ============= pub.dev (Dart/Flutter) =============
async function discoverPubDevPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n🎯 Discovering top ${limit} pub.dev packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Use pub.dev API
    const response = await axios.get(`https://pub.dev/api/search`, {
      params: {
        q: '',
        page: 1,
      },
    });

    for (const pkg of response.data.packages.slice(0, limit)) {
      let githubRepo = '';
      
      // Fetch package details to get repository
      try {
        const detailResponse = await axios.get(`https://pub.dev/api/packages/${pkg.package}`);
        const repository = detailResponse.data.latest?.pubspec?.repository || 
                          detailResponse.data.latest?.pubspec?.homepage;
        
        if (repository) {
          const match = repository.match(/github\.com\/([^/]+\/[^/]+)/);
          if (match) githubRepo = match[1].replace('.git', '');
        }

        if (githubRepo) {
          packages.push({
            name: pkg.package,
            language: 'dart',
            ecosystem: 'pub.dev',
            categories: ['Flutter', 'Dart'],
            githubRepo,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
      } catch (error) {
        // Skip if details fail
      }
    }

    console.log(`   ✅ Found ${packages.length} pub.dev packages with GitHub repos`);
  } catch (error: any) {
    console.error(`   ❌ Error discovering pub.dev packages:`, error.message);
  }

  return packages;
}

// ============= Hex.pm (Elixir) =============
async function discoverHexPmPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n💧 Discovering top ${limit} Hex.pm packages...`);
  const packages: DiscoveredPackage[] = [];
  
  try {
    // Use Hex.pm API
    const response = await axios.get(`https://hex.pm/api/packages`, {
      params: {
        sort: 'downloads',
      },
    });

    for (const pkg of response.data.slice(0, limit)) {
      let githubRepo = '';
      
      // Try to get package details
      try {
        const detailResponse = await axios.get(`https://hex.pm/api/packages/${pkg.name}`);
        const links = detailResponse.data.meta?.links;
        
        if (links?.GitHub) {
          const match = links.GitHub.match(/github\.com\/([^/]+\/[^/]+)/);
          if (match) githubRepo = match[1].replace('.git', '');
        }

        if (githubRepo) {
          packages.push({
            name: pkg.name,
            language: 'elixir',
            ecosystem: 'hex.pm',
            categories: ['Elixir'],
            githubRepo,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Skip if details fail
      }
    }

    console.log(`   ✅ Found ${packages.length} Hex.pm packages with GitHub repos`);
  } catch (error: any) {
    console.error(`   ❌ Error discovering Hex.pm packages:`, error.message);
  }

  return packages;
}

// ============= CocoaPods (Swift/iOS) =============
async function discoverCocoaPodsPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n🔶 Discovering top ${limit} CocoaPods...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular CocoaPods
  const topPods = [
    { name: 'Alamofire', repo: 'Alamofire/Alamofire', categories: ['Networking'] },
    { name: 'SwiftyJSON', repo: 'SwiftyJSON/SwiftyJSON', categories: ['JSON'] },
    { name: 'SDWebImage', repo: 'SDWebImage/SDWebImage', categories: ['Image Loading'] },
    { name: 'Kingfisher', repo: 'onevcat/Kingfisher', categories: ['Image Loading'] },
    { name: 'SnapKit', repo: 'SnapKit/SnapKit', categories: ['UI'] },
    { name: 'RxSwift', repo: 'ReactiveX/RxSwift', categories: ['Reactive'] },
    { name: 'Moya', repo: 'Moya/Moya', categories: ['Networking'] },
    { name: 'RealmSwift', repo: 'realm/realm-swift', categories: ['Database'] },
    { name: 'Lottie', repo: 'airbnb/lottie-ios', categories: ['Animation'] },
    { name: 'Charts', repo: 'danielgindi/Charts', categories: ['Visualization'] },
  ];

  packages.push(...topPods.slice(0, limit).map(pod => ({
    name: pod.name,
    language: 'swift',
    ecosystem: 'CocoaPods',
    categories: pod.categories,
    githubRepo: pod.repo,
  })));

  console.log(`   ✅ Found ${packages.length} CocoaPods`);
  return packages;
}

// ============= Maven (Kotlin) =============
async function discoverKotlinPackages(limit = 30): Promise<DiscoveredPackage[]> {
  console.log(`\n🟣 Discovering top ${limit} Kotlin packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular Kotlin packages
  const topKotlinPkgs = [
    { name: 'kotlinx.coroutines', repo: 'Kotlin/kotlinx.coroutines', categories: ['Concurrency'] },
    { name: 'ktor', repo: 'ktorio/ktor', categories: ['Web Frameworks'] },
    { name: 'exposed', repo: 'JetBrains/Exposed', categories: ['Database'] },
    { name: 'arrow', repo: 'arrow-kt/arrow', categories: ['Functional'] },
    { name: 'koin', repo: 'InsertKoinIO/koin', categories: ['DI'] },
    { name: 'mockk', repo: 'mockk/mockk', categories: ['Testing'] },
    { name: 'kotest', repo: 'kotest/kotest', categories: ['Testing'] },
    { name: 'serialization', repo: 'Kotlin/kotlinx.serialization', categories: ['Serialization'] },
  ];

  packages.push(...topKotlinPkgs.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'kotlin',
    ecosystem: 'maven',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} Kotlin packages`);
  return packages;
}

// ============= Hackage (Haskell) =============
async function discoverHackagePackages(limit = 30): Promise<DiscoveredPackage[]> {
  console.log(`\n🎩 Discovering top ${limit} Hackage packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular Haskell packages
  const topHaskellPkgs = [
    { name: 'aeson', repo: 'haskell/aeson', categories: ['JSON'] },
    { name: 'servant', repo: 'haskell-servant/servant', categories: ['Web Frameworks'] },
    { name: 'yesod', repo: 'yesodweb/yesod', categories: ['Web Frameworks'] },
    { name: 'lens', repo: 'ekmett/lens', categories: ['Utilities'] },
    { name: 'parsec', repo: 'haskell/parsec', categories: ['Parsing'] },
    { name: 'attoparsec', repo: 'haskell/attoparsec', categories: ['Parsing'] },
    { name: 'conduit', repo: 'snoyberg/conduit', categories: ['Streaming'] },
    { name: 'text', repo: 'haskell/text', categories: ['Text Processing'] },
  ];

  packages.push(...topHaskellPkgs.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'haskell',
    ecosystem: 'Hackage',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} Hackage packages`);
  return packages;
}

// ============= Maven (Scala) =============
async function discoverScalaPackages(limit = 30): Promise<DiscoveredPackage[]> {
  console.log(`\n🔴 Discovering top ${limit} Scala packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular Scala packages
  const topScalaPkgs = [
    { name: 'akka', repo: 'akka/akka', categories: ['Concurrency'] },
    { name: 'play-framework', repo: 'playframework/playframework', categories: ['Web Frameworks'] },
    { name: 'cats', repo: 'typelevel/cats', categories: ['Functional'] },
    { name: 'circe', repo: 'circe/circe', categories: ['JSON'] },
    { name: 'http4s', repo: 'http4s/http4s', categories: ['Web Frameworks'] },
    { name: 'fs2', repo: 'typelevel/fs2', categories: ['Streaming'] },
    { name: 'zio', repo: 'zio/zio', categories: ['Functional'] },
    { name: 'slick', repo: 'slick/slick', categories: ['Database'] },
  ];

  packages.push(...topScalaPkgs.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'scala',
    ecosystem: 'maven',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} Scala packages`);
  return packages;
}

// ============= vcpkg (C++) =============
async function discoverVcpkgPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n⚡ Discovering top ${limit} vcpkg packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular C++ packages
  const topCppPkgs = [
    { name: 'boost', repo: 'boostorg/boost', categories: ['Utilities'] },
    { name: 'fmt', repo: 'fmtlib/fmt', categories: ['Formatting'] },
    { name: 'spdlog', repo: 'gabime/spdlog', categories: ['Logging'] },
    { name: 'nlohmann-json', repo: 'nlohmann/json', categories: ['JSON'] },
    { name: 'catch2', repo: 'catchorg/Catch2', categories: ['Testing'] },
    { name: 'opencv', repo: 'opencv/opencv', categories: ['Computer Vision'] },
    { name: 'grpc', repo: 'grpc/grpc', categories: ['RPC'] },
    { name: 'protobuf', repo: 'protocolbuffers/protobuf', categories: ['Serialization'] },
    { name: 'abseil', repo: 'abseil/abseil-cpp', categories: ['Utilities'] },
    { name: 'asio', repo: 'chriskohlhoff/asio', categories: ['Networking'] },
  ];

  packages.push(...topCppPkgs.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'cpp',
    ecosystem: 'vcpkg',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} vcpkg packages`);
  return packages;
}

// ============= CRAN (R) =============
async function discoverCRANPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n📊 Discovering top ${limit} CRAN packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular R packages
  const topRPkgs = [
    { name: 'ggplot2', repo: 'tidyverse/ggplot2', categories: ['Visualization'] },
    { name: 'dplyr', repo: 'tidyverse/dplyr', categories: ['Data Manipulation'] },
    { name: 'tidyr', repo: 'tidyverse/tidyr', categories: ['Data Manipulation'] },
    { name: 'shiny', repo: 'rstudio/shiny', categories: ['Web Frameworks'] },
    { name: 'caret', repo: 'topepo/caret', categories: ['Machine Learning'] },
    { name: 'data.table', repo: 'Rdatatable/data.table', categories: ['Data Manipulation'] },
    { name: 'plotly', repo: 'plotly/plotly.R', categories: ['Visualization'] },
    { name: 'stringr', repo: 'tidyverse/stringr', categories: ['String Manipulation'] },
    { name: 'lubridate', repo: 'tidyverse/lubridate', categories: ['Date/Time'] },
    { name: 'knitr', repo: 'yihui/knitr', categories: ['Documentation'] },
  ];

  packages.push(...topRPkgs.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'r',
    ecosystem: 'CRAN',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} CRAN packages`);
  return packages;
}

// ============= JuliaRegistries (Julia) =============
async function discoverJuliaPackages(limit = 50): Promise<DiscoveredPackage[]> {
  console.log(`\n🟢 Discovering top ${limit} Julia packages...`);
  const packages: DiscoveredPackage[] = [];
  
  // Curated list of popular Julia packages
  const topJuliaPkgs = [
    { name: 'Plots', repo: 'JuliaPlots/Plots.jl', categories: ['Visualization'] },
    { name: 'DataFrames', repo: 'JuliaData/DataFrames.jl', categories: ['Data Science'] },
    { name: 'Flux', repo: 'FluxML/Flux.jl', categories: ['Machine Learning'] },
    { name: 'DifferentialEquations', repo: 'SciML/DifferentialEquations.jl', categories: ['Scientific'] },
    { name: 'JuMP', repo: 'jump-dev/JuMP.jl', categories: ['Optimization'] },
    { name: 'Distributions', repo: 'JuliaStats/Distributions.jl', categories: ['Statistics'] },
    { name: 'HTTP', repo: 'JuliaWeb/HTTP.jl', categories: ['Web Development'] },
    { name: 'Makie', repo: 'MakieOrg/Makie.jl', categories: ['Visualization'] },
    { name: 'CSV', repo: 'JuliaData/CSV.jl', categories: ['Data Science'] },
    { name: 'MLJ', repo: 'alan-turing-institute/MLJ.jl', categories: ['Machine Learning'] },
  ];

  packages.push(...topJuliaPkgs.slice(0, limit).map(pkg => ({
    name: pkg.name,
    language: 'julia',
    ecosystem: 'JuliaRegistries',
    categories: pkg.categories,
    githubRepo: pkg.repo,
  })));

  console.log(`   ✅ Found ${packages.length} Julia packages`);
  return packages;
}

// ============= MAIN AUTO-DISCOVERY FUNCTION =============
async function autoDiscoverPackages() {
  console.log('🤖 AUTOMATED PACKAGE DISCOVERY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚡ Automatically fetching popular packages from ALL 17 languages...\n');

  const allDiscoveredPackages: DiscoveredPackage[] = [];

  // Discover packages from ALL registries (17 languages)
  const npmPackages = await discoverNpmPackages(150);
  const pypiPackages = await discoverPyPiPackages(100);
  const rustPackages = await discoverCratesIoPackages(100);
  const goPackages = await discoverGoPackages(50);
  const javaPackages = await discoverMavenPackages(50);
  const csharpPackages = await discoverNuGetPackages(80);
  const rubyPackages = await discoverRubyGemsPackages(60);
  const phpPackages = await discoverPackagistPackages(80);
  const dartPackages = await discoverPubDevPackages(60);
  const elixirPackages = await discoverHexPmPackages(40);
  const swiftPackages = await discoverCocoaPodsPackages(30);
  const kotlinPackages = await discoverKotlinPackages(30);
  const haskellPackages = await discoverHackagePackages(25);
  const scalaPackages = await discoverScalaPackages(25);
  const cppPackages = await discoverVcpkgPackages(40);
  const rPackages = await discoverCRANPackages(40);
  const juliaPackages = await discoverJuliaPackages(30);

  allDiscoveredPackages.push(
    ...npmPackages, 
    ...pypiPackages, 
    ...rustPackages, 
    ...goPackages, 
    ...javaPackages,
    ...csharpPackages,
    ...rubyPackages,
    ...phpPackages,
    ...dartPackages,
    ...elixirPackages,
    ...swiftPackages,
    ...kotlinPackages,
    ...haskellPackages,
    ...scalaPackages,
    ...cppPackages,
    ...rPackages,
    ...juliaPackages
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✨ Total discovered: ${allDiscoveredPackages.length} packages across ALL 17 languages!\n`);

  // Save to JSON file for review
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '../../../data/discovered-packages.json');
  
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(allDiscoveredPackages, null, 2));
  console.log(`💾 Saved to: data/discovered-packages.json`);
  console.log(`📝 Review the file and then run the import script\n`);

  console.log('📊 Breakdown by language:');
  const breakdown = allDiscoveredPackages.reduce((acc, pkg) => {
    acc[pkg.language] = (acc[pkg.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by count descending
  const sortedBreakdown = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  
  sortedBreakdown.forEach(([lang, count]) => {
    const emoji = {
      nodejs: '📦', python: '🐍', rust: '🦀', go: '🔷', java: '☕',
      csharp: '💜', ruby: '💎', php: '🐘', swift: '🔶', kotlin: '🟣',
      dart: '🎯', elixir: '💧', haskell: '🎩', scala: '🔴', cpp: '⚡',
      r: '📊', julia: '🟢'
    }[lang] || '📦';
    console.log(`   ${emoji} ${lang}: ${count} packages`);
  });

  console.log('\n✅ Discovery complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Review data/discovered-packages.json');
  console.log('   2. Run: npm run import-discovered');
  console.log('   3. Sit back and relax! 🚀\n');
}

// Run if called directly
if (require.main === module) {
  autoDiscoverPackages()
    .catch((e) => {
      console.error('❌ Discovery failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { autoDiscoverPackages, DiscoveredPackage };
