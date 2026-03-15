import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [requests, setRequests] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');
  const [currentId, setCurrentId] = useState(null);
  
  // Execution State
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests`);
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  const loadRequest = (req) => {
    setTitle(req.title);
    setUrl(req.url);
    setMethod(req.method);
    setBody(req.body || '');
    setCurrentId(req._id);
    setResponse(null); // Clear previous response when loading a new request
  };

  const deleteRequest = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE}/requests/${id}`);
      if (currentId === id) resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Failed to delete request', error);
    }
  };

  const handleSave = async () => {
    if (!title || !url) {
      alert('Please provide a title and URL to save.');
      return;
    }
    const payload = { title, url, method, body };
    try {
      if (currentId) {
        await axios.put(`${API_BASE}/requests/${currentId}`, payload);
      } else {
        const res = await axios.post(`${API_BASE}/requests`, payload);
        setCurrentId(res.data._id);
      }
      fetchRequests();
      alert('Request saved successfully.');
    } catch (error) {
      console.error('Failed to save request', error);
      alert('Error saving request.');
    }
  };

  const handleSend = async () => {
    if (!url) {
      alert('URL is required.');
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post(`${API_BASE}/proxy`, { url, method, body });
      setResponse({ status: 200, data: res.data });
    } catch (error) {
      const errorData = error.response ? error.response.data : { error: error.message };
      const status = error.response ? error.response.status : 'Error';
      setResponse({ status, data: errorData });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setMethod('GET');
    setBody('');
    setCurrentId(null);
    setResponse(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-wide flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
            </svg>
            API Vault
          </h2>
          <button onClick={resetForm} className="text-gray-400 hover:text-white" title="New Request">
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {requests.map((req) => (
            <div 
              key={req._id} 
              onClick={() => loadRequest(req)}
              className={`p-3 border-b border-gray-700 cursor-pointer flex justify-between items-center group transition-colors ${currentId === req._id ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
            >
              <div className="overflow-hidden">
                <div className="font-medium text-sm truncate">{req.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold leading-none ${req.method === 'GET' ? 'text-green-400' : req.method === 'POST' ? 'text-blue-400' : req.method === 'PUT' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {req.method}
                  </span>
                  <span className="text-xs text-gray-400 truncate w-40">{req.url}</span>
                </div>
              </div>
              <button onClick={(e) => deleteRequest(req._id, e)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm italic">
              No saved requests.
            </div>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full bg-[#0d1117]">
        
        {/* Top Form Area */}
        <div className="p-6 border-b border-gray-800 bg-gray-900 flex-none shadow-sm z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">API Client</h1>
            <div className="flex gap-3">
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 font-medium rounded-lg text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Save
              </button>
              <button 
                onClick={handleSend}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2 font-medium rounded-lg text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'bg-blue-600/50 cursor-not-allowed text-white/50' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
              >
                {loading ? (
                  <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Sending
                  </>
                ) : (
                  <>
                     Send <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Request Title (Optional)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Fetch Users List"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-md p-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
             </div>

            <div className="flex gap-2 relative">
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="bg-[#0d1117] border border-gray-700 rounded-md p-2.5 text-sm font-bold text-gray-200 outline-none focus:border-blue-500 cursor-pointer w-28 appearance-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-20 flex items-center px-2 text-gray-400">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://api.example.com/endpoint"
                className="flex-1 bg-[#0d1117] border border-gray-700 rounded-md p-2.5 font-mono text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            {method !== 'GET' && method !== 'DELETE' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">JSON Body</label>
                  <button onClick={() => {
                    try { setBody(JSON.stringify(JSON.parse(body), null, 2)) } catch(e) { }
                  }} className="text-xs text-blue-400 hover:text-blue-300">Format JSON</button>
                </div>
                <textarea 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  placeholder='{ "key": "value" }'
                  rows="5"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-md p-3 font-mono text-sm text-green-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y shadow-inner"
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Response Viewer */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]">
          <div className="px-6 py-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center text-sm font-medium">
             <span className="text-gray-400 font-semibold tracking-wide uppercase text-xs">Response</span>
             {response && (
               <span className={`px-2 py-0.5 rounded text-xs font-bold ${response.status >= 200 && response.status < 300 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 Status: {response.status}
               </span>
             )}
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar relative">
            {!response && !loading && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 flex-col gap-3">
                 <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                 <span className="text-sm font-medium tracking-wide">Ready to send request</span>
              </div>
            )}
            
            {response && (
              <pre className="font-mono text-sm leading-relaxed text-[#e5c07b]">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
        
      </div>
      
      {/* Global generic styles that could go to an external css file but placed nicely in component implicitly via tailwind */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
      `}} />
    </div>
  );
}

export default App;
