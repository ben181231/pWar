$(document).ready(function() {
    /* Fixing window size */
    var fixResize = function(){
        var w = $('body').width();
        var h = $('body').height();

        if(w * 1.0 / h > 16.0 / 10){
            $('body').removeClass('hBody').addClass('wBody');
        }else{
            $('body').removeClass('wBody').addClass('hBody');
        }

        var mh = $('#outerFrame').outerHeight();
        var mw = $('#outerFrame').outerWidth();
        $('#outerFrame').css('margin-top', -(mh / 2));
        $('#outerFrame').css('margin-left', -(mw / 2));
    };
    fixResize();
    $(window).resize(fixResize);

    var userName = getCookie('username');
    var roomID = window.sessionStorage.getItem('roomID');
    if(!roomID || !roomID.length || roomID.length == 0){
        // roomID = "testRoom";
        window.location = "/";
    }

    console.log('Get from Cookie / SessionStorage: {userName: ' + userName + ', roomID: ' + roomID + '}');

    /* Connect Socket.io and register event handlers */
    var connectedSocket = null;
    var maxPlayerNum = 3;
    var connectSocket = function(){
        var socket = io.connect(window.location.origin + '/game_room');
        
        socket.on('handshake', function(data){
            if(!data.seq || data.seq != 1) return;

            // send cookie data so that server 
            // can identify the socket
            socket.emit('handshake', {
                seq: 2,
                userName: userName,
                roomID: roomID
            }); //HandShake #2

            connectedSocket = socket;
            findPlayerID();
        });

        socket.on('idQuery', function(data){
            // filter invalid or queries from other rooms
            if(!data || data.roomID != roomID){ return; }

            console.log('ID Query: ' + JSON.stringify(data));
            if(data.userName && (data.userName == userName)){
                // the guy querying

                if(data.queryType == 'query'){
                    // get back my own query: set timeout
                    console.log('Get my query, setTimeout for playerID #' + (nextFindPlayerID - 1));

                    queryTimeout = setTimeout(function(){
                        // if this timeout can successfully, 
                        // that means user can successfully
                        // get the player ID

                        console.log('Got playerID #' + (nextFindPlayerID - 1));
                        myPlayerID = nextFindPlayerID - 1;
                        connectedSocket.emit('idQuery', {
                            roomID: roomID,
                            queryType: 'confirm',
                            confirmUserName: userName,
                            query: myPlayerID
                        });

                        stateQuery();
                    }, 2000);
                }else if(data.queryType == 'response' && data.response == true){

                    // get response of my own query
                    if(nextFindPlayerID == maxPlayerNum){
                        clearTimeout(queryTimeout);
                        alert('I cannot get an player ID... (T T)');
                        window.location = 'game_hall.html';
                    }else{
                        console.log('Get my response, clearTimeout for playerID #' + (nextFindPlayerID - 1));
                        clearTimeout(queryTimeout);

                        //set up DOM according to the socket data
                        $('#user-' + (nextFindPlayerID - 1) + ' > .name').html(data.playerInfo.name);
                        if(data.playerInfo.readyState){
                            $('#user-' + (nextFindPlayerID - 1)).addClass('ready');
                        }
                        $('#user-' + (nextFindPlayerID - 1)).removeClass('hide');

                        //continue to find next player ID
                        findPlayerID();  // recursive call
                    }
                }
            }else{
                // the client being queried 
                // --> only respond to query/confirm socket
                if(data.queryType == 'query'){
                    if(data.query == myPlayerID){
                        console.log('Respond to ID Query, refuse getting playerID #' + myPlayerID);

                        socket.emit('idQuery', {
                            roomID: roomID,
                            userName: data.userName,
                            queryType: 'response',
                            query: data.query,
                            response: true,
                            playerInfo: {
                                name: userName,
                                readyState: myReadyState
                            }
                        });
                    }
                }else if(data.queryType == 'confirm'){
                    $('#user-' + data.query + ' > .name').html(data.confirmUserName);
                    if(data.confirmUserName == userName){
                        $('#user-' + data.query).addClass('readyFrame');
                    }
                    $('#user-' + data.query).removeClass('ready').removeClass('hide');
                }
            }
        })

        socket.on('info', function(data){
            // console.log('Info ' + JSON.stringify(data));
        });

        socket.on('stateQuery', function(data){
            if( // Filter INVALID queries
                !data ||
                data.roomID != roomID ||
                (data.requestID != myPlayerID && data.queryID != myPlayerID)
            ){
                return;
            }

            if(data.requestID == myPlayerID){
                // get back your query back
                console.log('Get my stateQuery back from Player #' + data.playerInfo.id, data);
                $('#user-' + data.playerInfo.id + ' > .name').html(data.playerInfo.userName);
                if(data.playerInfo.readyState){
                    $('#user-' + data.playerInfo.id).addClass('ready');
                }
                $('#user-' + data.playerInfo.id).removeClass('hide');
            }else if(data.queryID == myPlayerID){
                // response when someone is querying you
                socket.emit('stateQuery', {
                    roomID: roomID,
                    requestID: data.userID,
                    queryType: 'response',
                    playerInfo: {
                        id: myPlayerID,
                        userName: userName,
                        readyState: myReadyState
                    }
                });
            }
        });

        socket.on('userAction', function(data){
            if(!data || data.roomID != roomID){ return; }

            console.log('User Action: ' + JSON.stringify(data));
            if(data.actionType == 'userReady'){
                $('#user-' + data.playerID).addClass('ready').removeClass('readyFrame');
                myReadyState = true;
                checkStart();
            }else if(data.actionType == 'startGame'){
                window.sessionStorage.setItem('playerID', myPlayerID);
                window.location = 'game.html';
            }
        });

        socket.on('userLeave', function(data){
            if(!data || data.roomID != roomID){ return; }

            console.log('User Leave: User [' + data.userName + ', ID#' + data.playerID + '] has left');
            $('#user-' + data.playerID).removeClass('ready').addClass('hide');
            $('#StartBtn').addClass('hide');
        });
    };
    connectSocket();

    /* find Player ID Protocols */
    var myPlayerID = -1; /* should be in {0..2} */
    var nextFindPlayerID = 0;
    var queryTimeout = null;
    var findPlayerID = function(){
        console.log('Send idQuery at player ID #' + nextFindPlayerID);
        connectedSocket.emit('idQuery', {
            roomID: roomID,
            userName: userName,
            queryType: 'query',
            query: nextFindPlayerID++
        });
    };

    /* fixing Player ID query -- state query */
    var stateQuery = function(){
        // query others state and build up DOM
        while(nextFindPlayerID < maxPlayerNum){
            console.log('State querying Player #' + nextFindPlayerID);
            connectedSocket.emit('stateQuery', {
                roomID: roomID,
                userID: myPlayerID,
                queryID: nextFindPlayerID,
                queryType: 'query'
            });
            nextFindPlayerID++;
        }

        setTimeout(function(){
            $('#waitingFrame').addClass('hide');
            $('#outerFrame').removeClass('hide');
            fixResize();
        }, 1500);
        setupReadyEvent();
    };

    /* user ready state action */
    var myReadyState = false;
    var setupReadyEvent = function(){
        $('#outerFrame > .frame').click(function(event) {
            if($(this).hasClass('readyFrame') && !($(this).hasClass('ready'))){
                var readyUserID = $(this).data('userid');
                userReady();
            }
        });
    };
    var userReady = function(){
        connectedSocket.emit('userAction', {
            roomID: roomID,
            userName: userName,
            actionType: 'userReady',
            playerID: myPlayerID
        });
    };
    var checkStart = function(){
        var readyUserCount = $('#outerFrame > .ready').length;
        console.log('Check Start, Count: ' + readyUserCount);
        if(myPlayerID == 0 && readyUserCount == maxPlayerNum){
            $('#StartBtn').removeClass('hide').click(function(event) {
                console.log('Start Button Event');
                $(this).addClass('hide');
                connectedSocket.emit('userAction', {
                    roomID: roomID,
                    actionType: 'startGame',
                    playerID: myPlayerID
                });
            });
        }
    };
});


