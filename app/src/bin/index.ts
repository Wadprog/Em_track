import config from 'config';
import { createServer } from 'http';

// Custom dependencies i need
import app from '../app';
// import database from '../models';
import Logger from '../utils/logger';

//  * Normalize a port into a number, string, or false.
function normalizePort(val: string): number | string | null {
  const port = parseInt(val, 10);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return null;
}

export function onListening(server) {
  return (): void => {
    const addr = server.address();
    const bind: string | null =
      typeof addr === 'string' ? `pipe  ${addr}` : `port ${addr?.port}`;
    Logger.info(`Listening on ${bind} `);
  };
}
const port = normalizePort(process.env.PORT || '6000');

export function onError(error: any): void {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      Logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      Logger.error(`${bind}  is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// database.sequelize.sync({ logging: false, alter: true }).then(() => {
  // Passing starting database and server.
  const server = createServer(app);
  // const sio = new Server(server, {
  //   cors: {
  //     origin: '*',
  //   },
  // });

  // sio.use(
  //   jwtAuth.authenticate(
  //     { secret: config.get<string>('JWT_SECRET') },
  //   )
  // );



  try {
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening(server));
  } catch (err: any) {
    Logger.error(err);
    process.exit(1);
  }
// });
