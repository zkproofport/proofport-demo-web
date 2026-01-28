'use client';
import { useState } from 'react';
import { openProofPortal, verifyProof, verifySolanaProofSimulate } from '@zkproofport/sdk';
import Confetti from 'react-confetti';
import { JsonRpcProvider } from 'ethers';

type ChainOption = 'base' | 'solana';

interface SolanaVerifyResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  error?: string;
}

export default function BotProtectionVerifierDApp() {
  const [status, setStatus] = useState<'idle' | 'fetchingProof' | 'loading' | 'ready' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [rawProof, setRawProof] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedChain, setSelectedChain] = useState<ChainOption>('base');
  const [proofChain, setProofChain] = useState<ChainOption | null>(null);
  const [solanaResult, setSolanaResult] = useState<SolanaVerifyResult | null>(null);

  const baseProvider = new JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL);

  const handleOpenProofPortal = async () => {
    setStatus('fetchingProof');
    setError(null);
    setProofChain(null);
    setSolanaResult(null);
    try {
      const circuitId = selectedChain === 'base' ? 'coinbase_kyc' : 'coinbase_kyc_solana';
      const proof = await openProofPortal({ circuitId });
      setRawProof(proof);
      setProofChain(selectedChain);
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to get proof');
    }
  };

  const handleVerifyBase = async (mode: 'offchain' | 'onchain') => {
    if (!rawProof) return;
    setStatus('loading');
    setError(null);

    const result = await verifyProof({
      ...rawProof,
      mode,
      provider: baseProvider,
    });

    if (result.success) {
      setStatus('success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setStatus('error');
      setError((result as any).error || 'Verification failed');
    }
  };

  const handleVerifySolana = async () => {
    if (!rawProof) return;
    setStatus('loading');
    setError(null);
    setSolanaResult(null);

    try {
      const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
      const programId = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID;
      
      if (!programId) {
        throw new Error('NEXT_PUBLIC_SOLANA_PROGRAM_ID is not configured');
      }

      if (!rawProof.proof) {
        throw new Error('Proof data is missing');
      }

      const publicWitness = rawProof.publicWitness || rawProof.publicInputs || '';

      console.log('[DemoDapp] Verifying Solana proof...');
      console.log('[DemoDapp] Program ID:', programId);
      console.log('[DemoDapp] Proof length:', rawProof.proof.length);
      console.log('[DemoDapp] Public witness:', publicWitness ? `${String(publicWitness).length} chars` : 'empty');

      const result = await verifySolanaProofSimulate({
        proof: rawProof.proof,
        publicWitness: publicWitness,
        verifierProgramId: programId,
        rpcUrl: solanaRpcUrl,
      });

      if (result.success) {
        console.log('[DemoDapp] ✅ Solana proof verified!');
        setSolanaResult({
          success: true,
          signature: result.signature,
          explorerUrl: result.explorerUrl,
        });
        setStatus('success');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        throw new Error(result.error || 'Verification failed');
      }
      
    } catch (err: any) {
      console.error('[DemoDapp] Solana verification error:', err);
      setStatus('error');
      setError(err.message || 'Solana verification failed');
    }
  };

  const handleCopy = () => {
    if (rawProof) {
      navigator.clipboard.writeText(
        JSON.stringify(
          {
            proof: rawProof.proof,
            publicInputs: rawProof.publicInputs,
            meta: rawProof.meta,
          },
          null,
          2
        )
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleCopyTxSignature = () => {
    if (solanaResult?.signature) {
      navigator.clipboard.writeText(solanaResult.signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const isSolanaProof = proofChain === 'solana';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex items-center justify-center px-6 py-24 relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Demo DApp Banner */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-black py-2 px-4 text-center text-sm font-medium z-50">
        🎮 <strong>Demo DApp</strong> — This app only uses the SDK. Your wallet connects securely in the Portal, not here.
      </div>
      
      <div className="w-full max-w-5xl bg-slate-50 backdrop-blur-sm border border-slate-300 rounded-3xl shadow-xl shadow-slate-400/20 grid md:grid-cols-2 gap-8 p-10 relative mt-8">
        <div className="flex flex-col justify-between bg-slate-100 border border-slate-200 rounded-2xl p-6 shadow-inner">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bot Protection Gateway</h1>
                <p className="text-gray-500 text-xs">Powered by zkProofport</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Prove you're a verified human without revealing your identity. Stop bots and sybil attacks with zero-knowledge proofs.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Verification Chain</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as ChainOption)}
                disabled={rawProof !== null}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="base">Base</option>
                <option value="solana">Solana (Devnet)</option>
              </select>
              {rawProof && (
                <p className="text-xs text-blue-600 mt-1">
                  Chain locked to {proofChain === 'solana' ? 'Solana' : 'Base'} for this proof
                </p>
              )}
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded-lg text-sm mb-4">
              <h4 className="font-bold flex items-center gap-2">
                <span>⚠️</span> Requirements
              </h4>
              <p className="mt-1 text-blue-800">
                To use this demo, you need a wallet that has completed <strong>Coinbase Identity Verification</strong> (on-chain EAS attestation on Base).
                The ZK proof verifies this attestation without revealing your identity.
              </p>
            </div>
            <ul className="text-sm text-gray-600 list-none space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> No wallet connection on this page
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Generate proofs in secure Proof Portal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Verify on-chain with cryptographic guarantees
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span>
                <a
                  href={selectedChain === 'base' 
                    ? `https://repo.sourcify.dev/8453/0x4C163fa6756244e7f29Cb5BEA0458eA993Eb0F6d`
                    : `https://explorer.solana.com/address/${process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID}?cluster=devnet`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  View Verifier Contract
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between bg-slate-100 border border-slate-200 rounded-2xl px-6 py-8 shadow-inner relative">
          <div className="top-4 right-6 space-y-4 w-full max-w-xs">
            {!rawProof && status === 'idle' && (
              <button
                onClick={handleOpenProofPortal}
                className="w-full py-3 px-6 text-sm font-semibold rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 active:scale-95 transition-all"
              >
                🚀 Start Human Verification
              </button>
            )}

            {rawProof && !isSolanaProof && (
              <>
                <button
                  onClick={handleOpenProofPortal}
                  className="w-full py-3 px-6 text-sm font-semibold rounded-xl shadow-md bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
                >
                  🔄 Regenerate Proof
                </button>
                <button
                  onClick={() => handleVerifyBase('offchain')}
                  className="w-full py-3 text-sm font-semibold rounded-xl shadow-md bg-blue-600 text-white hover:bg-blue-500 transition"
                >
                  Verify Offchain
                </button>
                <button
                  onClick={() => handleVerifyBase('onchain')}
                  className="w-full py-3 text-sm font-semibold rounded-xl shadow-md bg-violet-600 text-white hover:bg-violet-500 transition"
                >
                  Verify Onchain (Base)
                </button>
              </>
            )}

            {rawProof && isSolanaProof && (
              <>
                <button
                  onClick={handleOpenProofPortal}
                  className="w-full py-3 px-6 text-sm font-semibold rounded-xl shadow-md bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
                >
                  🔄 Regenerate Proof
                </button>
                <button
                  onClick={handleVerifySolana}
                  className="w-full py-3 text-sm font-semibold rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition"
                >
                  ⚡ Verify Onchain (Solana)
                </button>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col justify-center items-center text-center space-y-2 text-xs text-gray-500 w-full">
            {status === 'ready' && (
              <div className="flex flex-col items-center space-y-2 mt-6 text-center text-xs text-gray-500 leading-relaxed">
                <p>Each proof can be used only once.</p>
                <button
                  onClick={handleCopy}
                  className="inline-block w-full px-5 py-2 text-xs font-medium rounded-md border border-purple-500 text-purple-400 hover:bg-purple-500/10 transition"
                >
                  {copied ? 'Copied!' : '📋 Copy Proof JSON'}
                </button>
              </div>
            )}
            {status === 'fetchingProof' && <p className="text-xs text-purple-400">📝 Waiting for proof from portal…</p>}
            {status === 'loading' && <p className="text-xs text-purple-400">⏳ Verifying on-chain…</p>}
            {status === 'error' && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-300 text-xs rounded-md px-4 py-3 shadow-sm mt-2">
                ❌ Verification failed: {error}
              </div>
            )}
            {status === 'success' && (
              <div className="mt-4 space-y-3 w-full">
                <div className="bg-green-900/50 border border-green-500/50 text-green-300 text-sm rounded-md px-4 py-3 shadow-sm">
                  ✅ Human verified! Bot protection passed.
                </div>
                
                {/* Solana specific: TX link and copy */}
                {isSolanaProof && solanaResult?.signature && (
                  <div className="space-y-2">
                    <a
                      href={solanaResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 text-xs font-medium rounded-md bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 transition text-center"
                    >
                      🔗 View Transaction on Solana Explorer
                    </a>
                    <button
                      onClick={handleCopyTxSignature}
                      className="w-full py-2 px-4 text-xs font-medium rounded-md border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition"
                    >
                      {copied ? 'Copied!' : '📋 Copy TX Signature'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}