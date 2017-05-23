module.exports = function(app, io, mongoose) {

    var util = require( "../model/Util.model.js" );
    var clients = [];

    // List of All members
    app.get('/api/groups/:id/members', function(req, res) {
        var c = [];
        for (var ci = 0; ci < clients.length; ci ++ ) {
            // TODO: exclude people not from this group ( or those who did not send their credentials )
            c.push( clients[ ci ] );
        }
        res.status(200).json( c );
    });


    // UPDATING member information
    app.post('/api/groups/:id/members/:socketid', function(req, res) {

        console.log(req.params);
        console.log(clients);

        for (var ci = 0; ci < clients.length; ci ++ ) {
            if ( clients[ci].clientId == '/#'+req.params.socketid ) {

                util.log( "Updating info for socket#" + clients[ci].clientId + " GROUP=" + req.params.id+ " " + JSON.stringify( req.body ) );
                clients[ci].member = req.body;
                clients[ci].groupId = req.params.id;

                res.status(200).json( clients[ci] );
                io.emit( "members-refresh" );
                return;
            }
        }
        res.status(404).json( [] );
        util.log( "Socket not found for info update #" + req.params.socketid + " " +JSON.stringify( req.body ) );
    });

    // GET member information
    app.get('/api/groups/:id/members/:socketid', function(req, res) {

        console.log(req.params);
        console.log(clients);

        for (var ci = 0; ci < clients.length; ci ++ ) {
            if ( clients[ci].clientId == '/#'+req.params.socketid ) {

                util.log( "Updating info for socket#" + clients[ci].clientId + " GROUP=" + req.params.id+ " " + JSON.stringify( req.body ) );
                clients[ci].member = req.body;
                clients[ci].groupId = req.params.id;

                res.status(200).json( clients[ci] );
                io.emit( "members-refresh" );
                return;
            }
        }
        res.status(404).json( [] );
        util.log( "Socket not found for info update #" + req.params.socketid + " " +JSON.stringify( req.body ) );
    });



    // DISCONNECT MEMBER - REMOVE ITS PERSONAL INFORMATION
    app.delete('/api/groups/:id/members/:socketid', function(req, res) {

        for (var ci = 0; ci < clients.length; ci ++ ) {
            if ( clients[ci].clientId == req.params.socketid ) {
                util.log( "Removing info for socket#" + clients[ci].clientId + " GROUP=" + req.params.id+ " ");
                delete clients[ci].member;

                res.status(200).json( [] );
                io.emit( "members-refresh" );
                return;
            }
        }

        res.status(404).json( [] );
        util.log( "Socket not found for deletion #" + req.params.socketid );
    });



    io.on('connection', function(socket){
      var clientInfo = {};
      clientInfo.clientId = socket.id;
      clientInfo.ua = socket.request.headers['user-agent'];
      clientInfo.ip  = socket.request.socket.remoteAddress;
      clientInfo.url = socket.request.headers['referer'];
      clients.push( clientInfo );
      //console.log( clientInfo );

      util.log( 'SOCKET #' + socket.id  + ' connected, IP:' + clientInfo.ip );

      socket.on( 'disconnect', function(){
          util.log( 'SOCKET #' + socket.id + ' disconnected');
          for( var i=0, len = clients.length; i<len; ++i ){
              var c = clients[i];
              if ( c.clientId == socket.id ){ clients.splice(i,1); break; }
          }
          io.emit( "members-refresh" );
      });
        socket.on('record-start', function (data) {
            console.log(data);
            io.emit( "record-start" , data);
        });


      io.emit( "members-refresh" );
  });
};
