// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Base} from "./Base.t.sol";
import {MockChog} from "./mocks/MockChog.sol";

/// The claim, line by line: "a possessor can never move, approve or list the Chog they control".
contract ProofTest is Base {
    bytes4[5] internal forbidden = [
        bytes4(0x095ea7b3), // approve(address,uint256)
        bytes4(0xa22cb465), // setApprovalForAll(address,bool)
        bytes4(0x23b872dd), // transferFrom(address,address,uint256)
        bytes4(0x42842e0e), // safeTransferFrom(address,address,uint256)
        bytes4(0xb88d4fde) //  safeTransferFrom(address,address,uint256,bytes)
    ];

    function _contains(bytes memory code, bytes4 sel) internal pure returns (bool) {
        for (uint256 i; i + 4 <= code.length; ++i) {
            if (code[i] == sel[0] && code[i + 1] == sel[1] && code[i + 2] == sel[2] && code[i + 3] == sel[3]) {
                return true;
            }
        }
        return false;
    }

    function test_NoCallPathToApproveOrTransfer() public view {
        bytes memory code = address(dybbo).code;
        for (uint256 i; i < forbidden.length; ++i) {
            assertFalse(_contains(code, forbidden[i]), "Dybbo bytecode holds an approve or transfer selector");
        }
        assertTrue(_contains(code, 0x6352211e), "ownerOf should be the one call Dybbo makes");
    }

    function test_PossessorTransferFromReverts() public {
        _possess(possessor, 1, 10);
        vm.prank(possessor);
        vm.expectRevert(abi.encodeWithSelector(MockChog.ERC721InsufficientApproval.selector, possessor, 1));
        chog.transferFrom(holder, possessor, 1);

        // Dybbo itself has no approval to lend either.
        vm.prank(address(dybbo));
        vm.expectRevert(abi.encodeWithSelector(MockChog.ERC721InsufficientApproval.selector, address(dybbo), 1));
        chog.transferFrom(holder, possessor, 1);
        assertEq(chog.ownerOf(1), holder);
    }

    function test_NoApprovalAfterAnyFlow() public {
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        dybbo.haunt(1, 3, 0);
        vm.prank(holder2);
        dybbo.setTerms(3, uint96(DEFAULT), false);
        vm.warp(block.timestamp + 300);
        vm.prank(holder);
        dybbo.haunt(1, 4, 1);
        vm.prank(holder);
        dybbo.claim(1);

        for (uint256 id = 1; id <= 4; ++id) {
            address o = chog.ownerOf(id);
            assertFalse(chog.isApprovedForAll(o, address(dybbo)));
            assertFalse(chog.isApprovedForAll(o, possessor));
            assertEq(chog.getApproved(id), address(0));
        }
        assertEq(chog.ownerOf(1), holder);
    }
}
