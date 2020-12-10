/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * */
import getStore from './store';

export default async function pollForInactiveRooms() {
  const store = getStore();
  const rooms = (await store.getAll('rooms')) || {};

  Object.keys(rooms).forEach(async (roomId) => {
    const room = JSON.parse(rooms[roomId]);
    const timeSinceUpdatedInSeconds = (Date.now() - room.updatedAt) / 1000;
    const timeSinceUpdatedInDays = Math.round(
      timeSinceUpdatedInSeconds / 60 / 60 / 24
    );
    if (timeSinceUpdatedInDays > 7) {
      await store.del('rooms', roomId);
    }
  });

  setTimeout(pollForInactiveRooms, 1000 * 60 * 60); // every hour
}
