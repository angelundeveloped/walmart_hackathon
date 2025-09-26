'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export default function DatabaseTestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const updateTest = (name: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, duration }
        : test
    ));
  };

  const addTest = (name: string) => {
    setTests(prev => [...prev, { name, status: 'pending' }]);
  };

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    updateTest(name, 'running');
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, 'passed', 'Test passed successfully', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(name, 'failed', (error as Error).message, duration);
    }
  };

  const testEnvironmentVariables = async () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GEMINI_API_KEY'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
  };

  const testSupabaseConnection = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
  };

  const testDatabaseSchema = async () => {
    const supabase = createClient();
    const expectedTables = ['user_profiles', 'store_items', 'chat_sessions', 'shopping_history'];
    
    for (const tableName of expectedTables) {
      const { error } = await supabase.from(tableName).select('*').limit(1);
      if (error) {
        throw new Error(`Table ${tableName} access failed: ${error.message}`);
      }
    }
  };

  const testCRUDOperations = async () => {
    const supabase = createClient();
    const testUserId = 'test-user-' + Date.now();
    const testItemId = 'test-item-' + Date.now();

    // Create user profile
    const { error: userError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          mapFilters: {
            showSections: ['dairy', 'bakery'],
            showItems: true,
            showRoute: true,
            showAnchors: true,
            showServices: true
          },
          dietaryRestrictions: ['vegetarian'],
          brandPreferences: ['organic'],
          organicPreference: true
        }
      });

    if (userError) {
      throw new Error(`User profile creation failed: ${userError.message}`);
    }

    // Create store item
    const { error: itemError } = await supabase
      .from('store_items')
      .insert({
        id: testItemId,
        name: 'Test Organic Milk',
        category: 'dairy',
        description: 'Test organic milk for database testing',
        coordinates: { x: 10.5, y: 5.2 },
        price: 4.99,
        in_stock: true
      });

    if (itemError) {
      throw new Error(`Store item creation failed: ${itemError.message}`);
    }

    // Read operations
    const { error: readError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (readError) {
      throw new Error(`User profile read failed: ${readError.message}`);
    }

    // Update operations
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ name: 'Updated Test User' })
      .eq('id', testUserId);

    if (updateError) {
      throw new Error(`User profile update failed: ${updateError.message}`);
    }

    // Cleanup
    await supabase.from('user_profiles').delete().eq('id', testUserId);
    await supabase.from('store_items').delete().eq('id', testItemId);
  };

  const testAuthentication = async () => {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Authentication test failed: ${error.message}`);
    }

    // Test public data access
    const { error: publicError } = await supabase
      .from('store_items')
      .select('id, name, category')
      .limit(5);

    if (publicError) {
      throw new Error(`Public data access failed: ${publicError.message}`);
    }
  };

  const testGeminiAPI = async () => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test message for API connection'
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API connection failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Gemini API response format invalid');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTests([]);

    const testSuite = [
      { name: 'Environment Variables', fn: testEnvironmentVariables },
      { name: 'Supabase Connection', fn: testSupabaseConnection },
      { name: 'Database Schema', fn: testDatabaseSchema },
      { name: 'CRUD Operations', fn: testCRUDOperations },
      { name: 'Authentication', fn: testAuthentication },
      { name: 'Gemini API', fn: testGeminiAPI },
    ];

    // Add all tests
    testSuite.forEach(test => addTest(test.name));

    // Run tests sequentially
    for (const test of testSuite) {
      await runTest(test.name, test.fn);
    }

    setIsRunning(false);
    setOverallStatus('completed');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Database Testing Suite
          </h1>
          
          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {overallStatus === 'completed' && (
            <div className="mb-6 p-4 rounded-lg bg-gray-100">
              <h2 className="text-lg font-semibold mb-2">Test Results Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold">
                  Success Rate: {totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  <div>
                    <div className={`font-medium ${getStatusColor(test.status)}`}>
                      {test.name}
                    </div>
                    {test.message && (
                      <div className="text-sm text-gray-600 mt-1">
                        {test.message}
                      </div>
                    )}
                  </div>
                </div>
                {test.duration && (
                  <div className="text-sm text-gray-500">
                    {test.duration}ms
                  </div>
                )}
              </div>
            ))}
          </div>

          {tests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Click &quot;Run All Tests&quot; to start testing your database setup
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
