// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ballot
{
    struct voter
    {
        string name;
        bool   eligibleToVote;
        bool   hasVoted;
    }
    
    struct candidate
    {
        string  name;
        string  partylist;
        uint256 voteCount;
    }

    address public admin;
}