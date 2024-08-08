import { Button, Flex, InputField, theme } from "@webstudio-is/design-system";
import { CommitIcon } from "@webstudio-is/icons";
import { useState } from "react";
import { authPath } from "~/shared/router-utils";
import { BrandButton } from "./brand-button";

export const SecretLogin = () => {
  const [isSecretLoginOpen, setIsSecretLoginOpen] = useState(false);
  if (isSecretLoginOpen) {
    return (
      <Flex
        as="form"
        action={authPath({ provider: "dev" })}
        method="post"
        css={{
          width: "fit-content",
          flexDirection: "row",
          gap: theme.spacing[5],
        }}
      >
        <InputField
          name="secret"
          type="text"
          minLength={2}
          required
          autoFocus
          placeholder="Auth secret"
          css={{ flexGrow: 1 }}
        />
        <Button>Login</Button>
      </Flex>
    );
  }

  return (
    <BrandButton
      onClick={() => setIsSecretLoginOpen(true)}
      icon={<CommitIcon size={22} />}
    >
      Login with Secret
    </BrandButton>
  );
};
