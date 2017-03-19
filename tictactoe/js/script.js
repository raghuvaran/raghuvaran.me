
var cgiPath = "https://cecas.clemson.edu/~rchowda/sd/pp2/view/cgi-bin/ttt.cgi";

var playerList = {};

var boardCursor = "000000000";

var tmp_player = {
    1:{}, 2:{}

};
var player = {
    1:{

    }, 2:{

    }

};

var sel1 = document.getElementById('sel1');
var sel2 = document.getElementById('sel2');

var btn1 = document.getElementById('btn1');
var btn2 = document.getElementById('btn2');

var are_players_set = false;
var lock_cell = false;

var table = document.getElementById('table');
table.setAttribute('class','inactive');

var cells = Array.from(document.getElementById('table').children);
var playResponse = {};

var player_num =1;


//Fetch all players
getAllPlayers();

//Event listeners for board
cells.forEach(function (cell) {

    var handler = function(){
        if(are_players_set && !lock_cell) {
            lock_cell = true;
            informPlaying(cell.id);
            togglePlayer();
            lock_cell = false;
            cell.removeEventListener('click',handler);
        }



    };

    cell.addEventListener('click',handler);
});

//TODO check if other tmp_player is also set? then change @are_players_set to true
//Event listeners for tmp_player dropdown fields
sel1.addEventListener('change',function () {
    updatePlayerByDD(this, 1, 'p1_n', 'p1_m','playerSel1');

});
sel2.addEventListener('change',function () {
    updatePlayerByDD(this, 2, 'p2_n', 'p2_m','playerSel2');
});

//Event listeners for 'done' buttons
//TODO call cgi to validate and print tmp_player names from response
btn1.addEventListener('click',function () {
    updatePlayerByForm(1,'usr1','mrkr1','playerSel1');
});

btn2.addEventListener('click',function () {
    updatePlayerByForm(2,'usr2','mrkr2','playerSel2');
});


function togglePlayer(){
    if(player_num == 1){
        player_num = 2;
    }else{
        player_num = 1;
    }
}


function display(id,mark,curr_player){
var cell = document.getElementById(id);
    cell.innerHTML = mark;
    if(curr_player == 1) cell.setAttribute('style','color:red');
    else cell.setAttribute('style','color:blue');
    playResponse= {
        "player": curr_player,
        "position": id
    };
    console.log(JSON.stringify(playResponse));
}

//done
function getAllPlayers(){
    var xhttp = new XMLHttpRequest();
    var outJson = {};
    outJson.identifier="G";

    xhttp.open("POST",cgiPath,true);
    xhttp.send(JSON.stringify(outJson));


    xhttp.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            var inJson = JSON.parse(this.responseText);
            playerList = inJson.players;

            inJson.players.forEach(function (player) {
                var listItem = document.createElement("option");var listItem2 = document.createElement("option");
                var item = document.createTextNode(player.name + " (" + player.marker + ")");var item2 = document.createTextNode(player.name + " (" + player.marker + ")");
                listItem.appendChild(item);listItem2.appendChild(item2);
                sel1.appendChild(listItem);
                sel2.appendChild(listItem2);
            })

            //TODO uncomment this if necessary
            // document.getElementById('p1_n').innerHTML = playerList[sel1.selectedIndex].name;
            // document.getElementById('p1_m').innerHTML = playerList[sel1.selectedIndex].marker;
            // document.getElementById('p2_n').innerHTML = playerList[sel2.selectedIndex].name;
            // document.getElementById('p2_m').innerHTML = playerList[sel2.selectedIndex].marker;
        }
    };


}

//done
function updatePlayerByDD(dd, playerId, p_name, p_marker,p_form){
    if(dd.selectedIndex == 0) return;
  //  console.log(playerList[dd.selectedIndex-1]);
    tmp_player[playerId].name = playerList[dd.selectedIndex-1].name;
    tmp_player[playerId].marker = playerList[dd.selectedIndex-1].marker;
    validatePlayers();
    // document.getElementById(p_name).innerHTML = playerList[dd.selectedIndex-1].name;
    // document.getElementById(p_marker).innerHTML = playerList[dd.selectedIndex-1].marker;
    // document.getElementById(p_form).setAttribute('class','done');

}

//done
function updatePlayerByForm(playerId, name_field, marker_field,form_class){
    tmp_player[playerId].name = document.getElementById(name_field).value;
    tmp_player[playerId].marker = document.getElementById(marker_field).value;

    if(tmp_player[playerId].name != "" && tmp_player[playerId].marker != "") {
        validatePlayers();
    }else{
        alert('Name or marker can\'t be empty fields');
    }
}

//not yet done
function validatePlayers(){
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST",cgiPath,true);
    var outJson ={
        identifier:"",player1_name:null,player1_marker:null,player2_name:"",player2_marker:""
    };
    outJson.identifier = "X";

    if(tmp_player[1].name == undefined || tmp_player[1].marker == undefined) outJson.identifier = "Y";
    outJson.player1_name = tmp_player[1].name;
    outJson.player1_marker = tmp_player[1].marker;
    outJson.player2_name = tmp_player[2].name;
    outJson.player2_marker = tmp_player[2].marker;

    xhttp.send(JSON.stringify(outJson));

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var inJson = JSON.parse(this.responseText);
            var players = inJson.players;
            if (players[0].id > 0) {
                document.getElementById('playerSel1').setAttribute('class', 'done');
                document.getElementById('p1_n').innerHTML = players[0].name;
                document.getElementById('p1_m').innerHTML = players[0].marker;
                player[1].name = players[0].name;
                player[1].marker = players[0].marker;
            }
            if (players[1].id > 0) {
                document.getElementById('playerSel2').setAttribute('class', 'done');
                document.getElementById('p2_n').innerHTML = players[1].name;
                document.getElementById('p2_m').innerHTML = players[1].marker;
                player[2].name = players[1].name;
                player[2].marker = players[1].marker;
            }
            if (players[0].id > 0 && players[1].id > 0) {
                are_players_set = true;
                table.className = "active";
            }
        }
    }

}

function informPlaying(id) {
    if(player_num == 1) boardCursor = boardCursor.substring(0,id-1) + '1' + boardCursor.substring(id,9);
        else boardCursor = boardCursor.substring(0,id-1) + '2' + boardCursor.substring(id,9);
    var xhttp2 = new XMLHttpRequest();

    xhttp2.open("POST",cgiPath,true);
    var shootJson = {};
    shootJson.identifier = "P";
    shootJson.player1_name = player[1].name;
    shootJson.player1_marker = player[1].marker;
    shootJson.player2_name = player[2].name;
    shootJson.player2_marker = player[2].marker;
    shootJson.cursor = boardCursor;
    console.log(JSON.stringify(shootJson));

    xhttp2.send(JSON.stringify(shootJson));

    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var inJson = JSON.parse(this.responseText);

            boardCursor = inJson.cursor;
            displayBoard();
            if (inJson.winner > 0 && inJson.winner < 4) {
                declareWinner(inJson.winner);
                are_players_set = false;
                table.className = "inactive";
            }

        }

    }

}


function displayBoard() {
    var curr_player = player_num;
    for(var i=0; i <9; i++){
        if(boardCursor[i]==1) {
            display(i+1,player[1].marker,1);
        } //id, marker
        else if(boardCursor[i]==2) {
            display(i+1,player[2].marker,2);
        } //id, marker
        else if(boardCursor[i]==0){

        }else console.log('error in displayBoard:'+boardCursor[i]);

    }        console.log('displayBoard: '+boardCursor);

}


function declareWinner(winner) {
    var result = document.getElementById('winner');
    var resultDiv = document.getElementById('result');
    switch(winner){
        case 1: result.innerHTML = player[1].name; break;
        case 2: result.innerHTML = player[2].name; break;
        case 3: result.innerHTML = 'Tie'; break;
    }
    resultDiv.className = "";
}
