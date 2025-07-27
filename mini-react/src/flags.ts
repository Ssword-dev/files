export enum Flags {
  NoFlags = 0,
  Placement = 1 << 1,
  Update = 1 << 2,
  Deletion = 1 << 3,
  Passive = 1 << 7,
  Layout = 1 << 8,
}
