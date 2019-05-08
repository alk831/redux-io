
exports.waitForServerConnection = (ioServer, timeout = 2000) =>
  new Promise((resolve, reject) => {
    ioServer.on('connection', resolve);
    setTimeout(
      () => reject(new Error('Server didn\'t found any connected socket')),
      timeout
    );
  });

exports.wait = (delay = 50) => new Promise(r => setTimeout(r, delay));