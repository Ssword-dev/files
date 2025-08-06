class AssetRegistry {
  constructor() {
    this.registry = Object.create(null);
  }

  addAsset(name, url) {
    const responsePromise = fetch(url);

    this.registry[name] = responsePromise.then(async function (value) {
      if (value.ok) {
        this.registry[name] = await value.text();
      } else {
        throw new Error(`Error loading Asset: ${value.statusText}`);
      }
    });
  }

  async getAsset(name) {
    if (typeof this.registry[name] === "undefined") {
      throw new Error(
        `Cannot find given asset '${name}'. please add it to the registry.`,
      );
    }

    let asset = this.registry[name];

    if (asset instanceof Promise) {
      asset = await asset;
    }

    return asset;
  }
}

export default AssetRegistry;
