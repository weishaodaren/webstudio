import { useState, useEffect } from "react";
import {
  StyleValue,
  toValue,
  type FunctionValue,
  type KeywordValue,
} from "@webstudio-is/css-engine";
import { parseCssValue } from "@webstudio-is/css-data";
import {
  Label,
  Tooltip,
  Flex,
  Text,
  Select,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@webstudio-is/design-system";
import {
  defaultFunctions,
  easeInFunctions,
  easeOutFunctions,
  easeInOutFunctions,
  timingFunctions,
  type TimingFunctions,
  findTimingFunctionFromValue,
} from "./transition-utils";

type TransitionTimingProps = {
  timing: StyleValue;
  easingLabel: string;
  easingDescription: string;
  defaultLabel: string;
  customLabel: string;
  easeInLabel: string;
  easeOutLabel: string;
  easeInOutLabel: string;
  onTimingSelection: (params: { timing: KeywordValue | FunctionValue }) => void;
};

const options: TimingFunctions[] = [
  ...Object.keys(timingFunctions),
  "custom",
] as TimingFunctions[] & "custom";

/**
 * Component
 */
export const TransitionTiming = ({
  timing,
  easingLabel,
  easingDescription,
  defaultLabel,
  customLabel,
  easeInLabel,
  easeOutLabel,
  easeInOutLabel,
  onTimingSelection,
}: TransitionTimingProps) => {
  /**
   * State
   */
  const [value, setValue] = useState<TimingFunctions | "custom">(
    findTimingFunctionFromValue(toValue(timing)) ?? "custom"
  );

  /**
   * Effect
   */
  useEffect(
    () => setValue(findTimingFunctionFromValue(toValue(timing)) ?? "custom"),
    [timing]
  );

  const handleTimingChange = (value: TimingFunctions | "custom") => {
    setValue(value);

    if (value === "custom") {
      onTimingSelection({ timing: { type: "keyword", value: "" } });
      return;
    }

    const selectedTiming = timingFunctions[value];
    const parsedEasing = parseCssValue(
      "transitionTimingFunction",
      selectedTiming
    );

    if (parsedEasing.type === "invalid") {
      return;
    }
    const easingValue =
      parsedEasing.type === "layers" ? parsedEasing.value[0] : parsedEasing;

    if (easingValue.type === "keyword" || easingValue.type === "function") {
      onTimingSelection({ timing: easingValue });
    }
  };

  return (
    <>
      <Flex align="center">
        <Tooltip
          variant="wrapped"
          content={
            <Flex gap="2" direction="column">
              <Text variant="regularBold">{easingLabel}</Text>
              <Text variant="monoBold" color="moreSubtle">
                transition-timing-function
              </Text>
              <Text>{easingDescription}</Text>
            </Flex>
          }
        >
          <Label css={{ display: "inline" }}>{easingLabel}</Label>
        </Tooltip>
      </Flex>
      <Select options={options} value={value} onChange={handleTimingChange}>
        <SelectGroup>
          <SelectLabel>{defaultLabel}</SelectLabel>
          {Object.keys(defaultFunctions).map((defaultFunc) => {
            return (
              <SelectItem key={defaultFunc} value={defaultFunc} text="sentence">
                {defaultFunc}
              </SelectItem>
            );
          })}
          <SelectItem key="custom" value="custom">
            {customLabel}
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{easeInLabel}</SelectLabel>
          {Object.keys(easeInFunctions).map((easeIn) => {
            return (
              <SelectItem key={easeIn} value={easeIn} text="sentence">
                {easeIn}
              </SelectItem>
            );
          })}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{easeOutLabel}</SelectLabel>
          {Object.keys(easeOutFunctions).map((easeOut) => {
            return (
              <SelectItem key={easeOut} value={easeOut} text="sentence">
                {easeOut}
              </SelectItem>
            );
          })}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{easeInOutLabel}</SelectLabel>
          {Object.keys(easeInOutFunctions).map((easeInOut) => {
            return (
              <SelectItem key={easeInOut} value={easeInOut} text="sentence">
                {easeInOut}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </Select>
    </>
  );
};
