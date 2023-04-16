export const allAttributes = ["str", "dex", "int", "fai", "arc"] as const;

export type Attribute = typeof allAttributes[number];
export type Attributes = Record<Attribute, number>;
