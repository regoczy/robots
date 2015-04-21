function $(id) {
    return document.getElementById(id);
}

var n = 0;
var m = 0;
var score = 0;
var safeTPs = 0;
var currTPs = 0;
var numOfRobots = 10;
var currRobs = numOfRobots;
var matrix;
var live = false;

window.addEventListener('load', function () {
	$('Startbtn').addEventListener('click', start, false);
} , false);

function start() {
	if (document.getElementById('nsize').value > 0 
		&& document.getElementById('msize').value > 0 
			&& document.getElementById('msize').value > 0) 
	{
		$('form').style.display = 'none';
		$('stats').style.display = 'inline';
		n = document.getElementById('nsize').value;
		m = document.getElementById('msize').value;
		safeTPs = document.getElementById('tps').value;
		currTPs = safeTPs;
		generateTable();
		document.addEventListener("keydown", checkKeyPressed, false);
		matrix = generateMatrix();
		setPieces();
		live = true;
		syncTable();
	}
	else {
		alert("Please, fill every field with a natural number!");
	}
}

function nextLvl() {
	$('vicbtn').style.display = 'none';
	clearMatrix();
	numOfRobots += 10;
	currRobs = numOfRobots;
	currTPs = safeTPs;
	setPieces();
	live = true;
	syncTable();
}

function checkKeyPressed(e) {
	if (live) {
		if ((e.keyCode > 36 && e.keyCode < 41) 
			|| (e.keyCode == 65) || (e.keyCode == 68) 
				|| (e.keyCode == 83) || (e.keyCode == 87))
		{
			moveJ(e.keyCode);
			//console.log(getNumOfRobs());
		}
		if (e.keyCode == 16 || e.keyCode == 84) {
			initiateTeleport();
		}
		if (isWon()) {
			live = false;
			$('vicbtn').style.display = 'inline';
			$('vicbtn').addEventListener('click', function() {
				nextLvl();
			}, false);
		}
	}
}

function moveJ(direction) {
	var newPos = new Array();

	switch (direction) {
		case 37: case 65:
			if (getIndexOfJ()[1] != 0) {
				newPos = [getIndexOfJ()[0], getIndexOfJ()[1] - 1];
			}
			else {
				newPos = [getIndexOfJ()[0], getIndexOfJ()[1]];
			}
			break;
		case 38: case 87:
			if (getIndexOfJ()[0] != 0) {
				newPos = [getIndexOfJ()[0] - 1, getIndexOfJ()[1]];
			}
			else {
				newPos = [getIndexOfJ()[0], getIndexOfJ()[1]];
			}
			break;
		case 39: case 68:
			if (getIndexOfJ()[1] != (m - 1)) {
				newPos = [getIndexOfJ()[0], getIndexOfJ()[1] + 1];
			}
			else {
				newPos = [getIndexOfJ()[0], getIndexOfJ()[1]];
			}
			break;
		case 40: case 83:
			if (getIndexOfJ()[0] != (n - 1)) {
				newPos = [getIndexOfJ()[0] + 1, getIndexOfJ()[1]];
			}
			else {
				newPos = [getIndexOfJ()[0], getIndexOfJ()[1]];
			}
			break;
	}
	
	if (matrix[newPos[0]][newPos[1]] == "R" || matrix[newPos[0]][newPos[1]] == "X") {
		gameOver();
	}
	else {
		matrix[getIndexOfJ()[0]][getIndexOfJ()[1]] = "0";
		matrix[newPos[0]][newPos[1]] = "J";
	}
	
	moveRobots();
	score--;
	syncTable();
}

function moveRobots() {
	var positions = new Array();

	for (var i = 0; i < n; i++) {
		for (var j = 0; j < m; j++) {
			if (matrix[i][j] == "R") {
				matrix[i][j] = "0";
				positions.push([i, j]);
			}
		}
	}
	
	for (var i = 0; i < positions.length; i++) {
		if (live) {
			moveRobot(positions[i]);
			positions.splice(i, 0);
		}
		if (!(live)) {
			matrix[positions[i][0]][positions[i][1]] = "R";
		}
	}
}

function moveRobot(indexes) {	
	var newPos = indexes.slice(0);

	var nDistance = Math.abs(getIndexOfJ()[0] - indexes[0]);
	var mDistance = Math.abs(getIndexOfJ()[1] - indexes[1]);

	if (nDistance > mDistance) {
		if (getIndexOfJ()[0] > indexes[0]) {
			newPos[0]++;
		}
		else {
			newPos[0]--;
		}
	}
	else {
		if (getIndexOfJ()[1] > indexes[1]) {
			newPos[1]++;
		}
		else {
			newPos[1]--;
		}
	}
	
	if (matrix[newPos[0]][newPos[1]] == "J") {
		gameOver();
	}
	else if (matrix[newPos[0]][newPos[1]] == "X") {
		score += 20;
		//console.log("+20");
		currRobs--;
		updateStats();
	}
	else if (matrix[newPos[0]][newPos[1]] == "R") {
		matrix[newPos[0]][newPos[1]] = "X";
		score += 40;
		//console.log("+40");
		currRobs = currRobs - 2;
		updateStats();
	}
	else if (matrix[newPos[0]][newPos[1]] == "0") {
		matrix[newPos[0]][newPos[1]] = "R";
	}
}

function isJaniAlive() {
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < m; j++) {
			if (matrix[i][j] == "J") {
				return true;
			}
			else {
				return false;
			}
		}
	}
}

function initiateTeleport() {
	if (currTPs > 0) {
		safeport();
	}
	else {
		teleport();
	}
	moveRobots();
	syncTable();
	score -= 100;
	//console.log("-100")
	updateStats();
}

function safeport() {
	var safeSpots = new Array();
	
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < m; j++) {
			if (isSafe([i, j])) {
				safeSpots.push([i, j]);
			}
		}
	}
	
	var newPos = safeSpots[Math.floor((Math.random() * safeSpots.length))];
	matrix[getIndexOfJ()[0]][getIndexOfJ()[1]] = "0";
	matrix[newPos[0]][newPos[1]] = "J";
	
	currTPs--;
}

function teleport() {
	matrix[getIndexOfJ()[0]][getIndexOfJ()[1]] = "0";
	
	var i = Math.floor(Math.random() * n);
	var j = Math.floor(Math.random() * m);
	matrix[i][j] = "J";
	
	if (matrix[i][j] == "R" || matrix[i][j] == "X") {
		gameOver();
	}
	
}

function isSafe(indexes) {
	if (getCellValue(indexes) != "0") {
		return false;
	}
	
	for (var k = 0; k < getAdjacents(indexes).length; k++) {
		if (getCellValue(getAdjacents(indexes)[k]) == "R") {
			return false;
		}
	}
	
	return true;
}

function getCellValue(indexes) {
	var i = indexes[0];
	var j = indexes[1];
	
	return matrix[i][j];
}

function getAdjacents(indexes) {
	var array = new Array();
	
	var i = indexes[0];
	var j = indexes[1];

	var up = [i - 1, j];
	var down = [i + 1, j];
	var left = [i, j - 1];
	var right = [i, j + 1];
	
	if (up[0] >= 0) {
		array.push(up);
	}
	if (down[0] < n) {
		array.push(down);
	}
	if (left[1] >= 0) {
		array.push(left);
	}
	if (right[1] < m) {
		array.push(right);
	}
	
	return array;
}

function getIndexOfJ() {
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < m; j++) {
			if (matrix[i][j] == "J") {
				var array = [i, j];
			}
		}
	}
	return array;
}

function generateTable() {
	var stringTable = '<table border id="gameTable">';
	for (var i = 0; i < n; i++) {
		stringTable += '<tr>';
		for (var j = 0; j < m; j++) {
			stringTable += '<td><span id="n' + i + 'm' + j + '" /></td>';
		}
		stringTable += '</tr>';
	}
	stringTable += '<table>';
	
	$('spantable').innerHTML = stringTable;
}

function syncTable() {
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < m; j++) {
			var IdString = 'n' + i + 'm' + j;
			//$(IdString).innerHTML  = matrix[i][j];
			switch(matrix[i][j]) {
				case "0":
					$(IdString).innerHTML  = '<img src="images/blank.png" alt="0">';
					break;
				case "J":
					if (live) {
						$(IdString).innerHTML  = '<img src="images/jani.png" alt="J">';
					}
					else {
						$(IdString).innerHTML  = '<img src="images/rip.png" alt="J">';
					}
					break;
				case "R":
					$(IdString).innerHTML  = '<img src="images/rob.png" alt="R">';
					break;
				case "X":
					$(IdString).innerHTML  = '<img src="images/fire.gif" alt="R">';
					break;
			}
		}
	}
	
	updateStats();
}

function updateStats() {
	$('score').innerHTML = score;
	$('currtps').innerHTML = currTPs;
	$('robs').innerHTML = currRobs;
}

function generateMatrix() {
	var matrix = new Array(n)
	for (var i = 0; i < n; i++) {
		matrix[i] = new Array(m);
		for (var j = 0; j < m; j++) {
			matrix[i][j] = "0";
		}
	}

	return matrix;
}

function printMatrix(matrix){
	var string = '<br><table border>';
	var row;
	for (row = 0; row < matrix.length; row++)
	{
		string += '<tr>';
		var col;
		for (col = 0; col < matrix[row].length; col++)
			string += '<td>' + matrix[row][col] + '</td>';
		string += '</tr>';
	}
	string += '</table>';
	
	$('spantable').innerHTML += string;
}

function clearMatrix() {
	matrix = generateMatrix();
	syncTable();
}

var bin = new Array();

function generateRandomEmptyIndexes() {
	var i = Math.floor(Math.random() * n);
	var j = Math.floor(Math.random() * m);
	var number = i + j * n;
	
	if (bin.indexOf(number) !== -1) {
		return generateRandomEmptyIndexes();
	}
	
	bin.push(number);
	var array = [i, j];
	return array;
}

function setPieces() {
	var tmp = generateRandomEmptyIndexes().slice(0);
	matrix[tmp[0]][tmp[1]] = "J";
	
	for (var k = 0; k < numOfRobots; k++) {
		tmp = generateRandomEmptyIndexes().slice(0);
		matrix[tmp[0]][tmp[1]] = "R";
	}
	
	bin = new Array();
}

function getNumOfRobs() {
	var sum = 0;
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < m; j++) {
			if (matrix[i][j] == "R") {
				sum++;
			}
		}
	}
	return sum;
}

function isWon(){
	if (getNumOfRobs() == 0) {
		return true;
	}
	else {
	return false;
	}
}

function gameOver() {
	live = false;
	syncTable();
	$('gobtn').style.display = 'inline';
	$('gobtn').addEventListener('click', function() {
		location.reload();
	}, false);
}