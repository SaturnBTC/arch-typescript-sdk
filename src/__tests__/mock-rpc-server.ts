import express from 'express';
import { hex } from '@scure/base';

const app = express();
const PORT = 9002;

app.use(express.json());

// Mock responses for Arch RPC endpoints
app.post('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/getBestBlockHash', (req, res) => {
  console.log('Mock RPC: getBestBlockHash called');
  res.json({
    jsonrpc: '2.0',
    result: 'a8388b3b14896ab062c85f6a04c0ed3b98ab11090e96a215e3c81acaa27c25ab',
    id: req.body.id || 1
  });
});

app.post('/getAccountAddress', (req, res) => {
  console.log('Mock RPC: getAccountAddress called with:', req.body);
  res.json({
    jsonrpc: '2.0',
    result: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    id: req.body.id || 1
  });
});

app.post('/readAccountInfo', (req, res) => {
  console.log('Mock RPC: readAccountInfo called with:', req.body);
  res.json({
    jsonrpc: '2.0',
    result: {
      data: hex.encode(new Uint8Array(82).fill(1)),
      lamports: 1000000,
      owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    },
    id: req.body.id || 1
  });
});

app.post('/sendTransaction', (req, res) => {
  console.log('Mock RPC: sendTransaction called');
  console.log('Transaction data:', JSON.stringify(req.body, null, 2));
  
  // Check if the transaction format is valid
  const transaction = req.body.params?.[0];
  
  if (!transaction) {
    console.error('❌ Invalid transaction: Missing transaction data');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Missing transaction data'
      },
      id: req.body.id || 1
    });
  }

  if (!transaction.version) {
    console.error('❌ Invalid transaction: Missing version');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Missing transaction version'
      },
      id: req.body.id || 1
    });
  }

  if (!transaction.signatures || !Array.isArray(transaction.signatures)) {
    console.error('❌ Invalid transaction: Missing or invalid signatures');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Missing or invalid signatures'
      },
      id: req.body.id || 1
    });
  }

  if (!transaction.message) {
    console.error('❌ Invalid transaction: Missing message');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Missing message'
      },
      id: req.body.id || 1
    });
  }

  // Check message structure
  const message = transaction.message;
  if (!message.header) {
    console.error('❌ Invalid message: Missing header');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Message missing header'
      },
      id: req.body.id || 1
    });
  }

  if (!message.staticAccountKeys || !Array.isArray(message.staticAccountKeys)) {
    console.error('❌ Invalid message: Missing or invalid staticAccountKeys');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Message missing staticAccountKeys'
      },
      id: req.body.id || 1
    });
  }

  if (!message.recentBlockhash) {
    console.error('❌ Invalid message: Missing recentBlockhash');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Message missing recentBlockhash'
      },
      id: req.body.id || 1
    });
  }

  if (!message.compiledInstructions || !Array.isArray(message.compiledInstructions)) {
    console.error('❌ Invalid message: Missing or invalid compiledInstructions');
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Message missing compiledInstructions'
      },
      id: req.body.id || 1
    });
  }

  console.log('✅ Transaction format looks valid!');
  console.log('Transaction version:', transaction.version);
  console.log('Number of signatures:', transaction.signatures.length);
  console.log('Message header:', message.header);
  console.log('Number of account keys:', message.staticAccountKeys.length);
  console.log('Number of instructions:', message.compiledInstructions.length);
  console.log('Recent blockhash:', message.recentBlockhash);

  // Return a mock transaction ID
  res.json({
    jsonrpc: '2.0',
    result: 'mock_transaction_id_' + Math.random().toString(36).substr(2, 9),
    id: req.body.id || 1
  });
});

// Catch-all for other endpoints
app.post('*', (req, res) => {
  console.log('Mock RPC: Unknown endpoint called:', req.path);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  res.json({
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: 'Method not found'
    },
    id: req.body.id || 1
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Arch RPC server running on http://localhost:${PORT}`);
  console.log('📝 This server will help debug transaction format issues');
  console.log('🔍 Check the console for detailed transaction analysis');
});

export default app; 