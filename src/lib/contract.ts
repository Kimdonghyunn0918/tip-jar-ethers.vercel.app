import { ethers } from 'ethers';
import { contractAddress } from './constants';
import abi from './TipJar.json'; // ABI 파일

export async function getContract(signer?: ethers.Signer) {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  if (signer) {
    return contract.connect(signer);
  }
  return contract;
}

export async function getBalance() {
  const contract = await getContract();
  const balance = await contract.getBalance();
  return ethers.formatEther(balance);
}

export async function sendTip(amount: string) {
  const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
  const contract = await getContract(signer);
  const tx = await contract.tip({ value: ethers.parseEther(amount) });
  await tx.wait();
}

export async function withdrawTips() {
  const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
  const contract = await getContract(signer);
  const tx = await contract.withdrawTips();
  await tx.wait();
}

export async function getOwner() {
  const contract = await getContract();
  return await contract.owner();
}
