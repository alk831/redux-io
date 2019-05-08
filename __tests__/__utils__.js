
exports.waitForServerConnection = (ioServer, timeout = 2000) =>
  new Promise((resolve, reject) => {
    ioServer.on('connection', resolve);
    setTimeout(
      () => reject(new Error('Server didn\'t found any connected socket')),
      timeout
    );
  });

exports.waitForEvent = (socket, eventType, timeout = 2000) =>
  new Promise((resolve, reject) => {
    socket.on(eventType, (...args) => resolve([...args]));
    setTimeout(
      () => reject(new Error(`Waiting for event has timed out after ${timeout} ms`)),
      timeout
    );
  });

exports.wait = (delay = 50) => new Promise(r => setTimeout(r, delay));