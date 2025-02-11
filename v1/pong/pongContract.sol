pragma solidity ^0.8.0;

contract PongScores {
	struct Player {
		string username;
		uint256 score;
	}

	mapping(address => Player) public players;

	function signup(string memory _username) public {
		require(bytes(players[msg.sender].username).length == 0, "Player already signed up");
		players[msg.sender] = Player(_username, 0);
	}

	function updateScore(uint256 _score) public {
		require(bytes(players[msg.sender].username).length != 0, "Player not signed up");
		players[msg.sender].score = _score;
	}

	function getScore(address _player) public view returns (uint256) {
		return players[_player].score;
	}
}
