class SimpleVirtualFileSystem {
  constructor() {
    this._files = Object.create(null);
  }

  read(path) {
    return this._files[path];
  }

  write(path, data) {
    this._files[path] = data;
  }

  append(path, data) {
    if (typeof this._files[path] === "undefined") {
      this._files[path] = "";
    }

    this._files[path] += data;
  }
}

module.exports = { SimpleVirtualFileSystem };
