// ! Things that need special conversion should be listed here
// ! This is created as an object with null prototype because
// ! some keys (like __proto__) causes unexpected behaviour
/** @type {Record<string, string>} */
const evtSpecMap = Object.create(null);

/**
 * evt name (camel) -> spec compatible name
 */
function evtToSpecCompat(name) {
  if (typeof name !== "string") return null;

  if (typeof evtSpecMap[name] === "string") {
    return evtSpecMap[name];
  }

  return name.slice(2).toLowerCase();
}

export { evtToSpecCompat };
