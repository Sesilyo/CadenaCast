// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Ballot
{
    struct Voter
    {
        string name;
        bool eligibleToVote;
        bool hasVoted;
    }
    mapping(uint256 => Voter) public voters;

    struct Candidate
    {
        string name;
        string partylist;
        uint256 voteCount;
    }
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;

    //keeps track of who has voted
    mapping(address => bool) public hasVoted;

    address public admin;

    constructor()
    {
        admin = msg.sender;

        //dummy candidates
        candidates[1] = Candidate("Rarate, Jmargo",       "Masarigan Partylist",       0);
        candidates[2] = Candidate("Selecam, Repsaj",      "Mapagkatiwalaan Partylist", 0);
        candidates[3] = Candidate("Jomafa, Carlie Josie", "Mahigugmahon Partylist",    0);
        candidateCount = 3;
    }

    function vote(uint256 _candidateID) public
    {
        require(!hasVoted[msg.sender], "You can only vote once");
        require(_candidateID > 0 && _candidateID <= candidateCount, "Invalid candidate ID");

        candidates[_candidateID].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function getWinningCandidate() public view returns (string memory winnerCandidate,
                                                        uint256 totalVotes)
    {
        uint256 mostVotes = 0;
        uint256 winnerID = 1;

        for (uint256 i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > mostVotes) {
                mostVotes = candidates[i].voteCount;
                winnerID = i;
            }
        }
        winnerCandidate = candidates[winnerID].name;
        totalVotes = candidates[winnerID].voteCount;
    }
}
//Seth was here