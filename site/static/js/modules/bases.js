class BaseError extends Error {
  constructor(message) {
    super(message);

    // * This basically auto assigns the name based
    // * on the subclass's name. (OOP)
    this.name = this.constructor.name;
  }
}

export { BaseError };
