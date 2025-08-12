import React, { useState } from 'react';
import { Copy, RefreshCw, Key, Shield, Hash, Clock } from 'lucide-react';

const APIKeyGenerator = () => {
  const [generatedKeys, setGeneratedKeys] = useState({
    random: '',
    uuid: '',
    jwt: '',
    hash: ''
  });
  const [keyLength, setKeyLength] = useState(32);
  const [includePrefix, setIncludePrefix] = useState(true);
  const [copiedKey, setCopiedKey] = useState('');

  // Generate cryptographically secure random key
  const generateRandomKey = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => chars[byte % chars.length]).join('');
    return includePrefix ? `sk_${key}` : key;
  };

  // Generate UUID v4
  const generateUUID = () => {
    const key = crypto.randomUUID();
    return includePrefix ? `api_${key.replace(/-/g, '')}` : key;
  };

  // Generate simple JWT-style token
  const generateJWT = () => {
    const header = btoa(JSON.stringify({typ: 'JWT', alg: 'HS256'})).replace(/=/g, '');
    const payload = btoa(JSON.stringify({
      iss: 'api-generator',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    })).replace(/=/g, '');
    const signature = generateRandomKey(16).slice(0, 16);
    return `${header}.${payload}.${signature}`;
  };

  // Generate hash-based key
  const generateHashKey = async () => {
    const data = `${Date.now()}_${Math.random()}_${navigator.userAgent}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const key = hashHex.slice(0, keyLength);
    return includePrefix ? `hk_${key}` : key;
  };

  const generateAllKeys = async () => {
    setGeneratedKeys({
      random: generateRandomKey(keyLength),
      uuid: generateUUID(),
      jwt: generateJWT(),
      hash: await generateHashKey()
    });
  };

  const copyToClipboard = async (text, keyType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyType);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const KeyDisplay = ({ label, value, type, icon: Icon, description }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 w-full">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">{label}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex items-center bg-gray-50 border rounded p-3 font-mono text-sm break-all">
        <span style={{flex: 1}}>{value || 'Click "Generate Keys" to create...'}</span>
        <button
          onClick={() => copyToClipboard(value || '', type)}
          className="ml-2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
          title="Copy to clipboard"
          disabled={!value}
        >
          <Copy className="h-4 w-4" />
        </button>
        {copiedKey === type && (
          <span className="ml-2 text-xs text-green-600 font-medium">Copied!</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Key className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">API Key Generator</h1>
        </div>
        <p className="text-gray-600">Generate secure API keys using different methods</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Length (for random keys)
            </label>
            <select
              value={keyLength}
              onChange={(e) => setKeyLength(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={16}>16 characters</option>
              <option value={24}>24 characters</option>
              <option value={32}>32 characters</option>
              <option value={48}>48 characters</option>
              <option value={64}>64 characters</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includePrefix"
              checked={includePrefix}
              onChange={(e) => setIncludePrefix(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includePrefix" className="ml-2 text-sm text-gray-700">
              Include prefixes (sk_, api_, etc.)
            </label>
          </div>
          <div className="flex justify-end">
            <button
              onClick={generateAllKeys}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Keys
            </button>
          </div>
        </div>
      </div>

      {/* Generated Keys */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeyDisplay
          label="Random Key"
          value={generatedKeys.random}
          type="random"
          icon={Shield}
          description="Cryptographically secure random string - most common for API authentication"
        />
        <KeyDisplay
          label="UUID Key"
          value={generatedKeys.uuid}
          type="uuid"
          icon={Hash}
          description="UUID v4 based key - guarantees uniqueness across systems"
        />
        <KeyDisplay
          label="JWT Token"
          value={generatedKeys.jwt}
          type="jwt"
          icon={Clock}
          description="JWT-style token with expiration - good for temporary access"
        />
        <KeyDisplay
          label="Hash-based Key"
          value={generatedKeys.hash}
          type="hash"
          icon={Key}
          description="SHA-256 hash of system data - deterministic but unpredictable"
        />
      </div>

      {/* Security Notes */}
  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-6 w-full">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>• Store API keys securely - never commit them to version control</li>
          <li>• Use environment variables or secure key management systems</li>
          <li>• Implement key rotation policies for production systems</li>
          <li>• Add rate limiting and usage monitoring for API keys</li>
          <li>• Use HTTPS only when transmitting API keys</li>
          <li>• Consider adding IP restrictions or time-based expiration</li>
        </ul>
      </div>
    </div>
  );
};

export default APIKeyGenerator;