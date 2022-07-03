import React, { ChangeEvent, KeyboardEvent, useCallback } from "react";
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
        onChange(value + step, evt);
        evt.preventDefault();
        return;
      }

      if (evt.key === "ArrowDown") {
        onChange(value - step, evt);
        evt.preventDefault();
        return;
      }

      evt.preventDefault();
    },
    [value, step, onChange],
  );

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = evt.currentTarget.value;

      if (newValue === "") {
        onChange?.(0, evt);
        return;
      }

      const n = +newValue.replace(/[,.]/g, "");
      if (!isNaN(n)) {
        const truncated = Math.floor(Math.min(Math.max(n, min), max) / step) * step;
        evt.currentTarget.value = truncated.toString();
        onChange?.(truncated, evt);
      }
    },
    [onChange, step, min, max],
  );

  return (
    <TextField
      {...props}
      inputMode={step < 1 ? "decimal" : "numeric"}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      value={value}
    />
  );
};

export default NumberTextField;
