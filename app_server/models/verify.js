// Run from the project root: node ./app_server/models/verify.js
const assert = require('node:assert/strict');
const mongoose = require('./db');
const Trip = require('./travlr');
const expected = require('../../data/trips.json');

const verifyDB = async () => {
  let exitCode = 0;
  try {
    // Retrieve stored trips with Mongoose and serialize them for API use.
    const trips = await Trip.find({}).sort({ code: 1 }).exec();
    assert.equal(trips.length, expected.length, 'Trip count must match seed data');
    const json = JSON.stringify(trips, null, 2);
    const returnedTrips = JSON.parse(json);

    for (const seed of expected) {
      const stored = trips.find(trip => trip.code === seed.code);
      const returned = returnedTrips.find(trip => trip.code === seed.code);
      assert.ok(stored, `Missing trip: ${seed.code}`);
      await stored.validate();
      assert.ok(stored.start instanceof Date, 'start must be stored as a date');
      for (const [field, value] of Object.entries(seed)) {
        assert.deepEqual(returned[field],
          field === 'start' ? new Date(value).toISOString() : value,
          `Incorrect ${field} for ${seed.code}`);
      }
    }

    console.log(json);
    console.log(`Verified ${trips.length} trips: schema validation, seed values, dates, and JSON retrieval passed.`);
  } catch (err) {
    console.error('Database verification failed:', err.message);
    exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
  process.exit(exitCode);
};

verifyDB().catch(err => {
  console.error('Database connection cleanup failed:', err.message);
  process.exit(1);
});
