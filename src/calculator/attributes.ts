export const allAttributes = ["str", "dex", "int", "fai", "arc"] as const;

export type Attribute = typeof allAttributes[number];
export type Attributes = Record<Attribute, number>;


export const allAggs = ["sum", "max", "min"] as const;

export type Agg = typeof allAggs[number];
export type Aggs = Record<Agg, number>;
