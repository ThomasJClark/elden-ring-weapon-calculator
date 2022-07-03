import { ChangeEvent, KeyboardEvent, useCallback, useState } from "react";
import type { TextFieldProps } from "@mui/material";
import { TextField } from "@mui/material";

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

const NumberTextField = ({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  ...props
}: Props) => {
  const [valueStr, setValueStr] = useState(value.toString());

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      if (
        evt.altKey ||
        evt.ctrlKey ||
        evt.shiftKey ||
        [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
          "ArrowLeft",
          "ArrowRight",
          "Backspace",
          "Enter",
          "Tab",
        ].includes(evt.key)
      ) {
        return;
      }

      if (evt.key === "ArrowUp") {
        const newValue = Math.min(Math.max(Math.floor(value / step + 1) * step, min), max);
        onChange(newValue, evt);
        setValueStr(newValue.toString());
        evt.preventDefault();
        return;
      }

      if (evt.key === "ArrowDown") {
        const newValue = Math.min(Math.max(Math.ceil(value / step - 1) * step, min), max);
        onChange(newValue, evt);
        setValueStr(newValue.toString());
        return;
      }

      evt.preventDefault();
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

      const clamped = Math.min(Math.max(newValue, min), max);
      setValueStr(newValue === clamped ? newValueStr : clamped.toString());
      onChange?.(clamped, evt);
    },
    [onChange, min, max],
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
};

export default NumberTextField;
