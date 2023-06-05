import { ethers } from 'ethers';
import Registry from './artifacts/contracts/Registry.sol/Registry';

export default async function deployRegistry(signer, arbiter, beneficiary, value) {
  const registryFactory = new ethers.ContractFactory(
    Registry.abi,
    Registry.bytecode,
    signer
  );
  return registryFactory.deploy(arbiter, beneficiary, { value });
}
