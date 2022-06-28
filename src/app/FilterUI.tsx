import { useState } from "react";
import { allWeaponTypes, allAffinities, WeaponType, Affinity } from "../calculator/calculator";

interface Props {
  weaponTypes: readonly WeaponType[];
  affinities: readonly Affinity[];
  maxWeight: number;
  effectiveWithCurrentAttributes: boolean;
  onWeaponTypesChanged(weaponTypes: readonly WeaponType[]): void;
  onAffinitiesChanged(affinities: readonly Affinity[]): void;
  onMaxWeightChanged(maxWeight: number): void;
  onEffectiveWithCurrentAttributesChanged(effectiveWithCurrentAttributes: boolean): void;
}

const FilterUI = ({
  weaponTypes,
  affinities,
  maxWeight,
  effectiveWithCurrentAttributes,
  onWeaponTypesChanged,
  onAffinitiesChanged,
  onMaxWeightChanged,
  onEffectiveWithCurrentAttributesChanged,
}: Props) => {
  const [showAllWeaponTypes, setShowAllWeaponTypes] = useState(false);

  const renderWeaponTypeCheckbox = (weaponType: WeaponType) => (
    <>
      <label>
        <input
          key={weaponType}
          type="checkbox"
          name="weaponType"
          checked={weaponTypes.includes(weaponType)}
          value={weaponType}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              onWeaponTypesChanged([...weaponTypes, weaponType]);
            } else {
              onWeaponTypesChanged(weaponTypes.filter((value) => value !== weaponType));
            }
          }}
        />
        {weaponType}
      </label>
      <br />
    </>
  );

  const renderAffinityCheckbox = (affinity: Affinity) => (
    <>
      <label>
        <input
          type="checkbox"
          name="affinity"
          checked={affinities.includes(affinity)}
          value={affinity}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              onAffinitiesChanged([...affinities, affinity]);
            } else {
              onAffinitiesChanged(affinities.filter((value) => value !== affinity));
            }
          }}
        />
        {affinity}
      </label>
      <br />
    </>
  );

  return (
    <>
      <label>
        Maximum Weight
        <br />
        <input
          type="range"
          min={0}
          max={30}
          step={0.1}
          value={maxWeight}
          onChange={(e) => onMaxWeightChanged(e.currentTarget.valueAsNumber)}
        />{" "}
        {maxWeight}
      </label>
      <fieldset>
        <legend>Weapon Type</legend>
        {/* TODO: sort by in-game order */}
        {renderWeaponTypeCheckbox("Axe")}
        {renderWeaponTypeCheckbox("Claw")}
        {renderWeaponTypeCheckbox("Colossal Sword")}
        {renderWeaponTypeCheckbox("Colossal Weapon")}
        {renderWeaponTypeCheckbox("Curved Greatsword")}
        {renderWeaponTypeCheckbox("Curved Sword")}
        {renderWeaponTypeCheckbox("Dagger")}
        {renderWeaponTypeCheckbox("Fist")}
        {renderWeaponTypeCheckbox("Flail")}
        {renderWeaponTypeCheckbox("Greataxe")}
        {renderWeaponTypeCheckbox("Great Hammer")}
        {renderWeaponTypeCheckbox("Great Spear")}
        {renderWeaponTypeCheckbox("Greatsword")}
        {renderWeaponTypeCheckbox("Halberd")}
        {renderWeaponTypeCheckbox("Hammer")}
        {renderWeaponTypeCheckbox("Heavy Thrusting Sword")}
        {renderWeaponTypeCheckbox("Katana")}
        {renderWeaponTypeCheckbox("Reaper")}
        {renderWeaponTypeCheckbox("Spear")}
        {renderWeaponTypeCheckbox("Straight Sword")}
        {renderWeaponTypeCheckbox("Thrusting Sword")}
        {renderWeaponTypeCheckbox("Torch")}
        {renderWeaponTypeCheckbox("Twinblade")}
        {renderWeaponTypeCheckbox("Whip")}
        <br />
        {showAllWeaponTypes ? (
          <>
            {renderWeaponTypeCheckbox("Ballista")}
            {renderWeaponTypeCheckbox("Bow")}
            {renderWeaponTypeCheckbox("Crossbow")}
            {renderWeaponTypeCheckbox("Greatbow")}
            {renderWeaponTypeCheckbox("Light Bow")}
            <br />
            {renderWeaponTypeCheckbox("Small Shield")}
            {renderWeaponTypeCheckbox("Medium Shield")}
            {renderWeaponTypeCheckbox("Greatshield")}
            <br />
            {renderWeaponTypeCheckbox("Glintstone Staff")}
            {renderWeaponTypeCheckbox("Sacred Seal")}
            <br />
            <button onClick={() => setShowAllWeaponTypes(false)}>Show less</button>
          </>
        ) : (
          <button onClick={() => setShowAllWeaponTypes(true)}>Show more</button>
        )}
        <br />
        <br />
        <button
          onClick={() => {
            onWeaponTypesChanged(allWeaponTypes);
            setShowAllWeaponTypes(true);
          }}
          disabled={weaponTypes.length === allWeaponTypes.length}
        >
          Select all
        </button>{" "}
        <button onClick={() => onWeaponTypesChanged([])} disabled={weaponTypes.length === 0}>
          Clear
        </button>
      </fieldset>
      <fieldset>
        <legend>Affinity</legend>
        <div style={{ display: "grid", gridAutoFlow: "column" }}>
          <div>
            {renderAffinityCheckbox("None")}
            {renderAffinityCheckbox("Heavy")}
            {renderAffinityCheckbox("Keen")}
            {renderAffinityCheckbox("Quality")}
          </div>
          <div>
            {renderAffinityCheckbox("Magic")}
            {renderAffinityCheckbox("Cold")}
            {renderAffinityCheckbox("Fire")}
            {renderAffinityCheckbox("Flame Art")}
          </div>
          <div>
            {renderAffinityCheckbox("Lightning")}
            {renderAffinityCheckbox("Sacred")}
            {renderAffinityCheckbox("Poison")}
            {renderAffinityCheckbox("Blood")}
            {renderAffinityCheckbox("Occult")}
          </div>
        </div>
        <br />
        <button
          onClick={() => onAffinitiesChanged(allAffinities)}
          disabled={affinities.length === allAffinities.length}
        >
          Select all
        </button>{" "}
        <button onClick={() => onAffinitiesChanged([])} disabled={affinities.length === 0}>
          Clear
        </button>
      </fieldset>
      <label>
        Effective with current attributes
        <input
          type="checkbox"
          name="effective"
          value="effective"
          checked={effectiveWithCurrentAttributes}
          onChange={(e) => onEffectiveWithCurrentAttributesChanged(e.currentTarget.checked)}
        />
      </label>
    </>
  );
};

export default FilterUI;
