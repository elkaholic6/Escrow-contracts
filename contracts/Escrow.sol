// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Registry.sol";


contract Escrow {
	Registry public registry;

	address public beneficiary;
	address public depositor;

	bool public isApproved;

	constructor(Registry _registry, address _beneficiary, uint256 _value) payable {
		registry = _registry;
		beneficiary = _beneficiary;
		depositor = msg.sender;

		_registry.initiateEscrow(depositor, address(this), _beneficiary, _value);
	}

	event Approved(uint);


	function approve() external {
		require(msg.sender == beneficiary, "Only beneficiary can approve");
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;

		registry.addEscrowContract(address(this), depositor, beneficiary);
		registry.updateReleased();
	}
	
	receive() external payable {
		require(msg.sender == depositor, "Only depositor can deposit funds");
	}

}
