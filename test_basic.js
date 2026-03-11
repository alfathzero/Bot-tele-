const db = require('./database');
const assert = require('assert');

// Test database
const userId = 123456789;
const initialUser = db.getUser(userId);
assert.strictEqual(initialUser.id, userId);
assert.strictEqual(initialUser.balance, 0);

db.addBalance(userId, 10000);
const updatedUser = db.getUser(userId);
assert.strictEqual(updatedUser.balance, 10000);

const success = db.deductBalance(userId, 5000);
assert.strictEqual(success, true);
assert.strictEqual(db.getUser(userId).balance, 5000);

const failure = db.deductBalance(userId, 10000);
assert.strictEqual(failure, false);
assert.strictEqual(db.getUser(userId).balance, 5000);

console.log('Database tests passed!');

// Test service imports
try {
  require('./services/pterodactyl');
  require('./services/digitalocean');
  require('./services/rumahotp');
  require('./services/premku');
  require('./services/fayupedia');
  require('./services/pakasir');
  require('./services/atlantik');
  console.log('All services imported successfully!');
} catch (error) {
  console.error('Service import failed:', error.message);
  process.exit(1);
}
