import { KarmaClient } from './karma';
import { IO } from './platform';
import { StatusUpdater } from './updater';
import { createStartFn } from './adapter';
export function startupTest() {
  const socket = new IO();
  const updater = new StatusUpdater(socket);
  let karmaClient = new KarmaClient(updater, socket);
  createStartFn(karmaClient, jasmine.getEnv())();
}
