import { useMemo, useState } from "react";
import useWeapons from "./useWeapons";
import getWeaponAttack, {
  Affinity,
  Attribute,
  Attributes,
  DamageType,
  getAttributeLabel,
  getDamageTypeLabel,
  getScalingLabel,
  maxRegularUpgradeLevel,
  Weapon,
  WeaponAttackPower,
  WeaponType,
} from "../calculator/calculator";
import filterWeapons, {
  FilterWeaponsOptions,
  toSpecialUpgradeLevel,
} from "../search/filterWeapons";
import FilterUI from "./FilterUI";

const PlayerDisplay = ({
  attributes,
  onAttributesChanged,
}: {
  attributes: Attributes;
  onAttributesChanged(attributes: Attributes): void;
}) => (
  <table border={1}>
    <tbody>
      {(Object.entries(attributes) as [Attribute, number][]).map(([attribute, value]) => (
        <tr key={attribute}>
          <th>{getAttributeLabel(attribute)}</th>
          <td>
            <input
              type="number"
              name={attribute}
              value={value}
              min={1}
              max={99}
              style={{ width: "100%" }}
              onChange={(evt) => {
                onAttributesChanged({
                  ...attributes,
                  [attribute]: evt.currentTarget.valueAsNumber,
                });
              }}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * TODO: compact, default, detailed
 */
const WeaponDisplay = ({ weapon, attributes }: { weapon: Weapon; attributes: Attributes }) => {
  const weaponAttack = useMemo(() => getWeaponAttack({ weapon, attributes }), [weapon, attributes]);

  return (
    <div style={{ border: "solid 1px black", padding: 16 }}>
      <b>
        <a
          href={`https://eldenring.wiki.fextralife.com/${encodeURIComponent(
            weapon.metadata.weaponName,
          )}`}
          rel="noreferrer"
          target="_blank"
        >
          {weapon.name}
        </a>
      </b>
      <br />
      {weapon.metadata.weaponType}
      <br />
      Weight: {weapon.metadata.weight}
      <br />
      <br />
      <b>Attack Power</b>
      <br />
      <table border={1}>
        <tbody>
          {(Object.entries(weaponAttack) as [DamageType, WeaponAttackPower][]).map(
            ([damageType, { baseAttackPower, scalingAttackPower }]) => {
              const displayedTotal = Math.floor(baseAttackPower + scalingAttackPower);
              const displayedBase = Math.floor(baseAttackPower);
              const displayedScaling = Math.floor(scalingAttackPower);
              if (displayedScaling === 0) {
                return (
                  <tr key={damageType}>
                    <th>{getDamageTypeLabel(damageType)}</th>
                    <td>{displayedTotal}</td>
                  </tr>
                );
              } else if (displayedScaling >= 0) {
                return (
                  <tr key={damageType}>
                    <th>{getDamageTypeLabel(damageType)}</th>
                    <td>
                      {displayedTotal} ({displayedBase} base + {displayedScaling} from{" "}
                      {weapon.damageScalingAttributes[damageType]?.join(", ")})
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={damageType}>
                    <th>{getDamageTypeLabel(damageType)}</th>
                    <td>
                      {displayedTotal} ({displayedBase} - {-displayedScaling} from{" "}
                      {weapon.damageScalingAttributes[damageType]?.join(", ")})
                    </td>
                  </tr>
                );
              }
            },
          )}
        </tbody>
      </table>
      <br />
      <b>Attribute Scaling</b>
      <br />
      <table border={1}>
        <tbody>
          {(Object.entries(weapon.attributeScaling) as [Attribute, number][]).map(
            ([attribute, scaling]) => (
              <tr key={attribute}>
                <th>{getAttributeLabel(attribute)}</th>
                <td>
                  {getScalingLabel(scaling)} ({Math.round(scaling * 100)}%)
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
      <br />
      <b>Attribute Requirements</b>
      <br />
      <table border={1}>
        <tbody>
          {(Object.entries(weapon.requirements) as [Attribute, number][]).map(
            ([attribute, requirement]) => (
              <tr key={attribute}>
                <th>{getAttributeLabel(attribute)}</th>
                <td>{requirement}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

const App = () => {
  const weapons = useWeapons();

  const [attributes, setAttributes] = useState({ str: 10, dex: 10, int: 10, fai: 10, arc: 10 });
  const [upgradeLevel, setUpgradeLevel] = useState(17);
  const [weaponTypes, setWeaponTypes] = useState<readonly WeaponType[]>([]);
  const [affinities, setAffinities] = useState<readonly Affinity[]>([]);
  const [maxWeight, setMaxWeight] = useState(30);
  const [effectiveWithCurrentAttributes, setEffectiveWithCurrentAttributes] = useState(false);

  const filterOptions = useMemo<FilterWeaponsOptions>(
    () => ({
      upgradeLevel,
      weaponTypes,
      affinities,
      maxWeight,
      effectiveWithAttributes: effectiveWithCurrentAttributes ? attributes : undefined,
    }),
    [upgradeLevel, weaponTypes, affinities, maxWeight, effectiveWithCurrentAttributes, attributes],
  );

  const filteredWeapons = useMemo(
    () => filterWeapons(weapons.values(), filterOptions),
    [weapons, filterOptions],
  );

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "grid",
          alignContent: "start",
          gap: 16,
          padding: 16,
          width: 400,
          backgroundColor: "#f2f2f2",
        }}
      >
        <PlayerDisplay attributes={attributes} onAttributesChanged={setAttributes} />
        <label>
          Upgrade Level
          <br />
          <select
            value={upgradeLevel}
            onChange={(evt) => {
              setUpgradeLevel(+evt.currentTarget.value);
            }}
          >
            {Array.from({ length: maxRegularUpgradeLevel + 1 }, (_, regularUpgradeLevel) => (
              <option key={regularUpgradeLevel} value={regularUpgradeLevel}>
                +{regularUpgradeLevel}/+{toSpecialUpgradeLevel(regularUpgradeLevel)}
              </option>
            ))}
          </select>
        </label>

        <FilterUI
          weaponTypes={weaponTypes}
          affinities={affinities}
          maxWeight={maxWeight}
          effectiveWithCurrentAttributes={effectiveWithCurrentAttributes}
          onWeaponTypesChanged={setWeaponTypes}
          onAffinitiesChanged={setAffinities}
          onMaxWeightChanged={setMaxWeight}
          onEffectiveWithCurrentAttributesChanged={setEffectiveWithCurrentAttributes}
        />
      </div>
      <div style={{ flex: "1 1 0", padding: 16 }}>
        <b>{filteredWeapons.length} results</b>
        {filteredWeapons.slice(0, 5).map((weapon) => (
          <WeaponDisplay key={weapon.name} weapon={weapon} attributes={attributes} />
        ))}
      </div>
    </div>
  );
};

export default App;
