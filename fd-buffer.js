const fs = require("fs");
class fileBuffer {
  constructor(path) {
    this.path = path;
    try {
      this.date = require(this.path);
    } catch (error) {
      this.date = {};
    }
  }

  set(id, value) {
    this.date[id] = value;
    this.writeToFile();
  }

  get(id) {
    if (this.date[id]) {
      return this.date[id];
    } else return false;
  }

  async change(id, fn) {
    const result = await fn(this.date[i]);
    if (result) {
      this.date[id] = result;
    }
  }

  async find(fn) {
    for (const key in this.date) {
      if (fn(this.date[key])) {
        return this.date[key];
      }
    }

    return false
  }

  del(id) {
    if (this.date[id]) {
      delete this.date[id];
      this.writeToFile();
      return true;
    } else return false;
  }

  writeToFile() {
    fs.writeFileSync(this.path, JSON.stringify(this.date));
  }

  keys() {
    return Object.keys(this.date);
  }
}

module.exports = { fileBuffer };
