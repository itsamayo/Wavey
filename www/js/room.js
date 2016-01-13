function Room(info) {
  this.name = info.name;
  this.clientSocket = info.clientSocket;
  
  //this.clientSocket.on('message', function(data){
  //  
  //});
}

Room.prototype.sendMessage = function(msgDetails) {
  var data = { sender: msgDetails.username, message: msgDetails.message, isLog: false, color: msgDetails.color, timestamp: moment().calendar() };
  this.clientSocket.emit('Message', data);
};
