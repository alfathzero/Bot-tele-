const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

class Database {
  constructor() {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, orders: [] }, null, 2));
    }
    this.data = JSON.parse(fs.readFileSync(DB_FILE));
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
  }

  getUser(userId) {
    if (!this.data.users[userId]) {
      this.data.users[userId] = {
        id: userId,
        balance: 0,
        orders: [],
      };
      this.save();
    }
    return this.data.users[userId];
  }

  addBalance(userId, amount) {
    const user = this.getUser(userId);
    user.balance += amount;
    this.save();
    return user.balance;
  }

  deductBalance(userId, amount) {
    const user = this.getUser(userId);
    if (user.balance < amount) return false;
    user.balance -= amount;
    this.save();
    return true;
  }
}

module.exports = new Database();
