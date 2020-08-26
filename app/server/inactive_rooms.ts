/* eslint-disable no-console */
import getStore from './store';

export default async function pollForInactiveRooms() {
  const store = getStore();

  console.log('Checking for inactive rooms...');
  const rooms = (await store.getAll('rooms')) || {};
  console.log(`${Object.keys(rooms).length} rooms found`);

  Object.keys(rooms).forEach(async (roomId) => {
    const room = JSON.parse(rooms[roomId]);
    const timeSinceUpdatedInSeconds = (Date.now() - room.updatedAt) / 1000;
    const timeSinceUpdatedInDays = Math.round(
      timeSinceUpdatedInSeconds / 60 / 60 / 24
    );
    if (timeSinceUpdatedInDays > 7) {
      console.log(
        `Deleting roomId ${roomId} which hasn't been used in ${timeSinceUpdatedInDays} days`
      );
      await store.del('rooms', roomId);
    }
  });

  setTimeout(pollForInactiveRooms, 1000 * 60 * 60 * 12); // every 12 hours
}
