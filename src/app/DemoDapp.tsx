'use client';
import { useState } from 'react';
import { openZkKycPopup, verifyZkKycProof } from '@zkproofport/sdk';
import Confetti from 'react-confetti';
import { JsonRpcProvider } from 'ethers';

export default function AirdropVerifierDApp() {
  const [status, setStatus] = useState<'idle' | 'fetchingProof' | 'loading' | 'ready' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [rawProof, setRawProof] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL);

  const handleOpenProofPortal = async () => {
    setStatus('fetchingProof');
    setError(null);
    try {
      const proof = await openZkKycPopup();
      setRawProof(proof);
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to get proof');
    }
  };

  const handleVerifyMode = async (mode: 'offchain' | 'onchain') => {
    if (!rawProof) return;
    setStatus('loading');
    setError(null);

    const result = await verifyZkKycProof({
      ...rawProof,
      mode,
      provider,
      verifierAddress: '0xB3705B6d33Fe7b22e86130Fa12592B308a191483',
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

  const handleCopy = () => {
    if (rawProof) {
      navigator.clipboard.writeText(
        JSON.stringify(
          {
            proof: rawProof.proof,
            publicInputs: rawProof.publicInputs,
          },
          null,
          2
        )
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center px-6 py-24 relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-3xl shadow-xl grid md:grid-cols-2 gap-8 p-10 relative">
        <div className="flex flex-col justify-between bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-inner">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">DAO Airdrop Eligibility — Example Dapp</h1>
            <p className="text-gray-700 text-sm mb-4">
              Privately prove your eligibility via zkProofport without revealing your wallet address or personal data.
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-4">
              <li>No wallet connection on this Dapp</li>
              <li>Generate proofs securely in the Proof Portal</li>
              <li>Return here to verify offchain or onchain (Base)</li>
              <li>
                Verifier on Base:{' '}
                <a
                  href="https://basescan.org/address/0xB3705B6d33Fe7b22e86130Fa12592B308a191483#code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-700"
                >
                  BaseScan
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-8 shadow-inner relative">
          <div className="top-4 right-6 space-y-4 w-full max-w-xs">
            {!rawProof && status === 'idle' && (
              <button
                onClick={handleOpenProofPortal}
                className="w-full py-3 px-6 text-sm font-semibold rounded-xl shadow-md bg-gradient-to-r from-gray-800 to-gray-600 text-white hover:brightness-110 active:scale-95"
              >
                Continue to Coinbase Proof Portal
              </button>
            )}

            {rawProof && (
              <>
                <button
                  onClick={handleOpenProofPortal}
                  className="w-full py-3 px-6 text-sm font-semibold rounded-xl shadow-md bg-gradient-to-r from-gray-800 to-gray-600 text-white hover:brightness-110 active:scale-95"
                >
                  Regenerate proof
                </button>
                <button
                  onClick={() => handleVerifyMode('offchain')}
                  className="w-full py-3 text-sm font-semibold rounded-xl shadow-md bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Verify Offchain
                </button>
                <button
                  onClick={() => handleVerifyMode('onchain')}
                  className="w-full py-3 text-sm font-semibold rounded-xl shadow-md bg-violet-500 text-white hover:bg-violet-600 transition"
                >
                  Verify Onchain
                </button>
              </>
            )}
          </div>

          <div className="mt-6 h-[64px] flex flex-col justify-center items-center text-center space-y-2 text-xs text-gray-500">
            {status === 'ready' && (
              <div className="flex flex-col items-center space-y-2 mt-6 text-center text-xs text-gray-500 leading-relaxed">
                <p>Each proof can be used only once.</p>
                <button
                  onClick={handleCopy}
                  className="inline-block w-full px-5 py-2 text-xs font-medium rounded-md border border-green-600 text-green-700 hover:bg-green-50 transition"
                >
                  {copied ? 'Copied!' : 'Copy proof JSON'}
                </button>
              </div>
            )}
            {status === 'fetchingProof' && <p className="text-xs text-gray-500">📝 Waiting for proof…</p>}
            {status === 'loading' && <p className="text-xs text-gray-500">⏳ Verifying…</p>}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded-md px-4 py-3 shadow-sm mt-2">
                Verification failed: {error}
              </div>
            )}
            {status === 'success' && (
              <div className="mt-4 space-y-3">
                <div className="bg-green-100 border border-green-300 text-green-800 text-sm rounded-md px-4 py-3 shadow-sm">
                  Proof verified! You can now join the airdrop pool.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
