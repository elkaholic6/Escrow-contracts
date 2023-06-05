import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';

export default async function deploy(signer, beneficiary, value) {
  const escrowFactory = new ethers.ContractFactory(
    Escrow.abi,
    Escrow.bytecode,
    signer
  );

  try {
    const escrowContract = await escrowFactory.deploy(
      '0x04C89607413713Ec9775E14b954286519d836FEf',
      beneficiary,
      value
    );

    console.log('Escrow contract deployed:', escrowContract.address);

  } catch (error) {
    console.error(error);
  }
}
