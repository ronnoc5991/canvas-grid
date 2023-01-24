export type VertexConfig = {
  radius: number;
  stroke: { width: number; color: string };
  fill: string;
};

export type LineConfig = {
  color: string;
  width: number;
};

export type ViewportConfig = {
  vertex: VertexConfig;
  edge: LineConfig;
  grid: LineConfig;
};

const edgeConfig: LineConfig = {
  color: "#000000",
  width: 2,
};

const gridConfig: LineConfig = {
  color: "#000000",
  width: 1,
};

const vertexConfig: VertexConfig = {
  radius: 8,
  stroke: {
    width: 1,
    color: "#000000",
  },
  fill: "#FFFFFF",
};

const config: ViewportConfig = {
  vertex: vertexConfig,
  edge: edgeConfig,
  grid: gridConfig,
};

export default config;
