import { useState, useEffect } from 'react';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/search/hybrid?q=web+framework&limit=5');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      setData(json);
      console.log('API Response:', json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">API Test Page</h1>
      
      <button 
        onClick={testAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test API
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      {data && (
        <div>
          <h2 className="text-xl font-bold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
