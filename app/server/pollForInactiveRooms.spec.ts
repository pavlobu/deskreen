import pollForInactiveRooms from './pollForInactiveRooms';
import getStore from './store';

const TEN_DAYS_PERIOD_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 10;
describe('Inactive rooms auto removed from store', () => {
  it('should remove inactive rooms from store that are updatedAt about 10 days ago', async () => {
    const store = getStore();
    store.set(
      'rooms',
      'roomId1',
      JSON.stringify({
        updatedAt: Date.now() - TEN_DAYS_PERIOD_IN_MILLISECONDS,
      })
    );

    pollForInactiveRooms();

    const rooms = (await store.getAll('rooms')) || {};
    expect(Object.keys(rooms).length).toBe(0);
  });
});
