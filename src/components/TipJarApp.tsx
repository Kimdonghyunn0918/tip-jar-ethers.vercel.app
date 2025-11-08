'use client'; // 클라이언트 컴포넌트로 지정

import { useState, useEffect } from 'react';
import { getBalance, sendTip, withdrawTips, getOwner } from '@/lib/contract';

// MetaMask ethereum 타입 정의
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function TipJarApp() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [tipAmount, setTipAmount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWallet();
    loadBalance();
  }, []);

  async function checkWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setConnected(true);
        setAccount(accounts[0]);
        const owner = await getOwner();
        setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
      }
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts.length > 0) {
        setConnected(true);
        setAccount(accounts[0]);
        const owner = await getOwner();
        setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
      }
    }
  }

  async function loadBalance() {
    const bal = await getBalance();
    setBalance(bal);
  }

  async function handleSendTip() {
    setLoading(true);
    try {
      await sendTip(tipAmount);
      await loadBalance();
      setTipAmount('');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function handleWithdraw() {
    setLoading(true);
    try {
      await withdrawTips();
      await loadBalance();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Tip Jar App</h2>
      {!connected ? (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
          MetaMask 연결
        </button>
      ) : (
        <>
          <p>연결된 주소: {account}</p>
          <p>컨트랙트 잔액: {balance} ETH</p>
          <div className="my-4">
            <input
              type="text"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="팁 금액 (ETH)"
              className="border p-2 mr-2"
            />
            <button onClick={handleSendTip} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
              {loading ? '처리 중...' : '팁 보내기'}
            </button>
          </div>
          {isOwner && (
            <button onClick={handleWithdraw} disabled={loading} className="bg-red-500 text-white px-4 py-2 rounded">
              {loading ? '처리 중...' : '팁 인출'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
