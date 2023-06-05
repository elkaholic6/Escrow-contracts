import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow.json';
import Registry from './artifacts/contracts/Registry.sol/Registry';


const provider = new ethers.providers.Web3Provider(window.ethereum);
const localHostProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545");


const registryContract = '0x04C89607413713Ec9775E14b954286519d836FEf';
const abi = Registry.abi;
const contract = new ethers.Contract(registryContract, abi, localHostProvider);
console.log("AppContract: ", contract);

export { contract };



function App() {
  const [userRegistrys, setUserRegistrys] = useState([]);
  const [beneficiaryRegistrys, setBeneficiaryRegistrys] = useState([]);
  const [totalRegistrys, setTotalRegistrys] = useState([]);
  const [account, setAccount] = useState("Need to sign in...");
  const [signer, setSigner] = useState();
  const [initiatedEscrows, setInitiatedEscrows] = useState([]);
  const [approveTxn, setApprovedTxn] = useState();

  window.ethereum.on('accountsChanged', (accounts) => {
    setAccount(accounts[0]);
  });

  useEffect(() => {

    console.log("useeffect is running.....")
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
      console.log('signer: ', signer);
      depositorRegistrys();
      beneficiaryEscrows();
    }

    getAccounts();
    readRegistry();

  }, [account]);


  useEffect(() => {
    newEscrow();
    depositorRegistrys();
    beneficiaryEscrows();
  }, [approveTxn]);


  useEffect(() => {
    async function fetchData() {
      await newEscrow();
    }
  
    fetchData();
  }, []);
  


  async function depositorRegistrys() {
      try {
        const viewUserRegistryTxn = await contract.viewUserRegistry(account);
        setUserRegistrys(() =>
          viewUserRegistryTxn.map(txn => [
            txn.escrowContract,
            txn.user,
            txn.beneficiary,
            ethers.utils.formatEther(txn.value.toString()),
          ])
        );
      } catch (error) {
        console.error(error);
      }
    };

    async function beneficiaryEscrows() {
      try {
        const viewBeneficiaryRegistryTxn = await contract.viewBeneficiaryRegistry(account);
        setBeneficiaryRegistrys(() =>
          viewBeneficiaryRegistryTxn.map(txn => [
            txn.escrowContract,
            txn.user,
            txn.beneficiary,
            ethers.utils.formatEther(txn.value.toString()),
          ])
        );
      } catch (error) {
        console.error(error);
      }
    };

  async function readRegistry() {
    try {
      const viewRegistries = await contract.viewRegistry();
      setTotalRegistrys(() =>
        viewRegistries.map(registry => [
          registry.escrowContract,
          registry.user,
          registry.beneficiary,
          ethers.utils.formatEther(registry.value.toString()),
        ])
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function newEscrow() {
    const _pendingEscrows = await contract.viewPendingEscrows();
      console.log('pendingEscrows: ', _pendingEscrows);
      
      setInitiatedEscrows(() => 
        _pendingEscrows.map(txn => [
          txn.escrowContract,
          txn.user,
          txn.beneficiary,
          ethers.utils.formatEther(txn.value.toString()),
        ])
      );
  }

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const weiInputValue = document.getElementById('wei').value;
    const parsedValue = parseFloat(weiInputValue.replace(',', ''));

    if (isNaN(parsedValue)) {
      console.error('Invalid input value');
      return;
    }
    const value = ethers.utils.parseUnits(parsedValue.toString(), 18);

    try {
      console.log("Initiating escrow contract deployment...");
      await deploy(signer, beneficiary, value);

      newEscrow();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleApprove(escrowAddress) {
    const escrowContractInstance = new ethers.Contract(escrowAddress, Escrow.abi, localHostProvider);
    const approveTxn = await escrowContractInstance.connect(signer).approve();
    await approveTxn.wait();

    escrowContractInstance.on('Approved', async () => {
      setApprovedTxn(approveTxn);
        readRegistry();
    });
  }

  return (
    <>
      <div className='navbar'>Signed in as {account.slice(0, 5)}...{account.slice(-5)}</div>

      <div className="new-contract-container">
        <div className="contract">
          <h1> New Contract </h1>
          <label>
            Beneficiary Address
            <input type="text" id="beneficiary" />
          </label>

          <label>
            Deposit Amount (in Ether)
            <input type="text" id="wei" />
          </label>

          <div
            className="button"
            id="deploy"
            onClick={(e) => {
              e.preventDefault();

              newContract();
            }}
          >
            Deploy
          </div>
        </div>

        <div className="existing-contracts">
          <h1>Pending Contracts...</h1>

          <div id="container">
            <div className='existing-contract'>
              {initiatedEscrows.map((escrow, index) => {
                return (
                  <ul key={index}>
                    <li>
                    <div> Escrow Contract </div>
                    <div>{escrow[0]}</div>
                    </li>
                    <li>
                    <div> Depositor </div>
                    <div>{escrow[1]}</div>
                    </li>
                    <li>
                    <div> Beneficiary </div>
                    <div>{escrow[2]}</div>
                    </li>
                    <li>
                    <div> Value </div>
                    <div>{escrow[3]} ETH</div>
                    </li>
                    <div
                      className="button"
                      id={escrow[0]}
                      onClick={(e) => {
                        e.preventDefault();

                        handleApprove(escrow[0]);
                      }}
                    >
                      Approve
                    </div>
                  </ul>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className='userEscrow-container'>
        <div className="userRegistry-contracts">
          <h1>Deposited contracts for: {account.slice(0, 5)}...{account.slice(-5)}</h1>

          <div id="userRegistry-container">
            <div className='userRegistry-contract'>
              {userRegistrys.map((userRegistry, index) => {
                return (
                  <ul key={index}>
                    <li>
                    <div> Escrow Contract </div>
                    <div>{userRegistry[0]}</div>
                    </li>
                    <li>
                    <div> Depositor </div>
                    <div>{userRegistry[1]}</div>
                    </li>
                    <li>
                    <div> Beneficiary </div>
                    <div>{userRegistry[2]}</div>
                    </li>
                    <li>
                    <div> Value </div>
                    <div>{userRegistry[3]} ETH</div>
                    </li>
                  </ul>
                )
              })}
            </div>
          </div>
        </div>

        <div className="beneficiaryRegistry-contracts">
          <h1>Received contracts for: {account.slice(0, 5)}...{account.slice(-5)}</h1>

          <div id="beneficiaryRegistry-container">
            <div className='beneficiaryRegistry-contract'>
              {beneficiaryRegistrys.map((beneficiaryRegistry, index) => {
                return (
                  <ul key={index}>
                    <li>
                    <div> Escrow Contract </div>
                    <div>{beneficiaryRegistry[0]}</div>
                    </li>
                    <li>
                    <div> Depositor </div>
                    <div>{beneficiaryRegistry[1]}</div>
                    </li>
                    <li>
                    <div> Beneficiary </div>
                    <div>{beneficiaryRegistry[2]}</div>
                    </li>
                    <li>
                    <div> Value </div>
                    <div>{beneficiaryRegistry[3]} ETH</div>
                    </li>
                  </ul>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className='registry-container'>
        <div className="registry-contracts">
          <h1> Registry </h1>

          <div id="registry-container">
            <div className='registry-contract'>
              {totalRegistrys.map((registry, index) => {
                return (
                  <ul key={index}>
                    <li>
                    <div> Escrow Contract </div>
                    <div>{registry[0]}</div>
                    </li>
                    <li>
                    <div> Depositor </div>
                    <div>{registry[1]}</div>
                    </li>
                    <li>
                    <div> Beneficiary </div>
                    <div>{registry[2]}</div>
                    </li>
                    <li>
                    <div> Value </div>
                    <div>{registry[3]} ETH</div>
                    </li>
                  </ul>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
