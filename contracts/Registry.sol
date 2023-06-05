// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Registry {
    struct UserEscrows {
        address escrowContract;
        address user;
        address beneficiary;
        uint value;
        bool deposited;
        bool released;
    }

    mapping(address => UserEscrows[]) public userEscrows;
    mapping(address => UserEscrows[]) public beneficiaryEscrows;
    mapping(address => UserEscrows) public escrows;

    UserEscrows[] public registry;
    UserEscrows[] public pendingEscrows;

    event Received(address sender, uint256 amount);

    function initiateEscrow(address _depositor, address _escrowContract, address _beneficiary, uint _value) public payable {

        UserEscrows memory escrow = UserEscrows({
            escrowContract: _escrowContract,
            user: _depositor,
            beneficiary: _beneficiary,
            value: _value,
            deposited: true,
            released: false
        });

        escrows[_escrowContract] = escrow;
        pendingEscrows.push(escrow);
    }
    function addEscrowContract(address _escrowContract, address _user, address _beneficiary) external {
        require(escrowExists(_escrowContract), "Escrow does not exist");
        require(escrows[_escrowContract].deposited, "Funds not deposited");
        require(!escrows[_escrowContract].released, "Funds already released");

        userEscrows[_user].push(escrows[_escrowContract]);
        beneficiaryEscrows[_beneficiary].push(escrows[_escrowContract]);
        registry.push(escrows[_escrowContract]);
    }

    function updateReleased() external {
        for (uint256 i = 0; i < pendingEscrows.length; i++) {
            if (pendingEscrows[i].escrowContract == msg.sender) {
                pendingEscrows[i].released = true;
                
                pendingEscrows[i] = pendingEscrows[pendingEscrows.length - 1];
                
                pendingEscrows.pop();
                break;
            }
        }
    }

    function viewUserRegistry(address _user) external view returns (UserEscrows[] memory) {
        return userEscrows[_user];
    }

    function viewBeneficiaryRegistry(address _beneficary) external view returns (UserEscrows[] memory) {
        return beneficiaryEscrows[_beneficary];
    }

    function viewRegistry() external view returns (UserEscrows[] memory) {
        return registry;
    }

    function viewPendingEscrows() external view returns (UserEscrows[] memory) {
        return pendingEscrows;
    }

    function escrowExists(address _escrowContract) private view returns (bool) {
        return escrows[_escrowContract].user != address(0);
    }

    receive() external payable {
        uint256 amount = msg.value;
        emit Received(msg.sender, amount);
    }
}