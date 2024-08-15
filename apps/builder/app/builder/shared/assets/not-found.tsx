import { Flex, Text } from "@webstudio-is/design-system";

export const NotFound = ({ label }: { label: string }) => {
  return (
    <Flex align="center" justify="center" css={{ height: 100 }}>
      <Text>{label}</Text>
    </Flex>
  );
};
