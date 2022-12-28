export type LineConfig = {
  color: string;
  width: number;
};

// TODO: These should actually be editable by the user...

export const EDGE_CONFIG: LineConfig = {
  color: "#000000",
  width: 2,
};

export const GRID_CONFIG: LineConfig = {
  color: "#000000",
  width: 1,
};
