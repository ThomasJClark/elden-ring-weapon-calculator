import { ChangeEvent, KeyboardEvent, useCallback, useState } from "react";
import type { TextFieldProps } from "@mui/material";
import { TextField } from "@mui/material";

const clampValue = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max);

interface Props extends Omit<TextFieldProps, "value" | "inputMode" | "onKeyDown" | "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange(
    value: number,
    evt: ChangeEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>,
  ): void;
}

export default function NumberTextField({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  ...props
}: Props) {
  const [valueStr, setValueStr] = useState(value.toString());

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      // Allow typing numbers or using built-in keyboard shortcuts normally
      if (
        evt.altKey ||
        evt.ctrlKey ||
        evt.shiftKey ||
        evt.key.match(/^[0-9]$/) ||
        evt.key.match(/^F[0-9]{1,2}$/) ||
        [".", "ArrowLeft", "ArrowRight", "Backspace", "Enter", "Tab"].includes(evt.key)
      ) {
        return;
      }

      evt.preventDefault();

      let newValue = value;

      // Custom keyboard shortcuts: Up/Down increment/decrement by one step, Page Up/Down by 10
      // steps, and Home/End set the value to the minimum or maximum
      if (evt.key === "ArrowUp") {
        newValue = clampValue(Math.floor(value / step + 1) * step, min, max);
      } else if (evt.key === "ArrowDown") {
        newValue = clampValue(Math.ceil(value / step - 1) * step, min, max);
      } else if (evt.key === "PageUp") {
        newValue = clampValue(Math.floor(value / step + 10) * step, min, max);
      } else if (evt.key === "PageDown") {
        newValue = clampValue(Math.ceil(value / step - 10) * step, min, max);
      } else if (evt.key === "Home" && max != null) {
        newValue = max;
      } else if (evt.key === "End" && min != null) {
        newValue = min;
      }

      if (newValue !== value) {
        onChange(newValue, evt);
        setValueStr(newValue.toString());
      }
    },
    [value, min, max, step, onChange],
  );

  const handleChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const newValueStr = evt.currentTarget.value;

      if (newValueStr === "") {
        setValueStr("");
        onChange?.(min, evt);
        return;
      }

      const newValue = +newValueStr;
      if (isNaN(newValue)) {
        return;
      }

      const clamped = clampValue(newValue, min, max);
      setValueStr(newValue === clamped ? newValueStr : clamped.toString());
      onChange?.(clamped, evt);
    },
    [min, max, onChange],
  );

  const handleBlur = useCallback(() => {
    setValueStr(value.toString());
  }, [value]);

  return (
    <TextField
      {...props}
      inputProps={{ inputMode: "decimal" }}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      value={valueStr}
    />
  );
}
