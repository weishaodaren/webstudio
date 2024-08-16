import {
  ChevronDownIcon,
  UpgradeIcon,
  WebstudioIcon,
} from "@webstudio-is/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuLabel,
  Flex,
  Avatar,
  css,
  rawTheme,
  theme,
  Button,
  ProBadge,
  DropdownMenuSeparator,
  Text,
} from "@webstudio-is/design-system";
import { useNavigate } from "@remix-run/react";
import { logoutPath, userPlanSubscriptionPath } from "~/shared/router-utils";
import type { User } from "~/shared/db/user.server";
import type { UserPlanFeatures } from "~/shared/db/user-plan-features.server";
import { useStore } from "@nanostores/react";
import { $tProject } from "~/shared/nano-states";

const containerStyle = css({
  px: theme.spacing[13],
  bc: theme.colors.backgroundPanel,
  height: theme.spacing[15],
  boxShadow: theme.shadows.brandElevationBig,
});

const getAvatarLetter = (title?: string) => {
  return (title || "X").charAt(0).toLocaleUpperCase();
};

const defaultUserName = "007";

const Menu = ({
  user,
  userPlanFeatures,
}: {
  user: User;
  userPlanFeatures: UserPlanFeatures;
}) => {
  const t = useStore($tProject);
  const navigate = useNavigate();
  const nameOrEmail = user.username ?? user.email ?? defaultUserName;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="ghost" aria-label="Menu Button" css={{ height: "100%" }}>
          <Flex gap="1" align="center">
            {/* 暂时隐藏 */}
            {userPlanFeatures.hasProPlan && (
              <>
                {/* <ProBadge>{userPlanFeatures.planName}</ProBadge> */}
                <ProBadge>Pro</ProBadge>
                <div />
              </>
            )}

            <Avatar
              src={user?.image || undefined}
              fallback={getAvatarLetter(nameOrEmail)}
              alt={nameOrEmail}
            />

            <ChevronDownIcon
              width={15}
              height={15}
              color={rawTheme.colors.foregroundMain}
            />
          </Flex>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {user.username ?? defaultUserName}
            {/* <Text>{user.email}</Text> */}
          </DropdownMenuLabel>
          {/* 暂时隐藏 */}
          {/* {userPlanFeatures.hasSubscription && (
            <DropdownMenuItem
              onSelect={() => navigate(userPlanSubscriptionPath())}
            >
              Manage Subscription
            </DropdownMenuItem>
          )} */}
          {userPlanFeatures.hasProPlan === false && (
            <DropdownMenuItem
              onSelect={() => {
                window.open("https://webstudio.is/pricing");
              }}
              css={{
                gap: theme.spacing[3],
              }}
            >
              <UpgradeIcon />
              <div>Upgrade to Pro</div>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate(logoutPath())}>
            {t.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

export const Header = ({
  user,
  userPlanFeatures,
}: {
  user: User;
  userPlanFeatures: UserPlanFeatures;
}) => {
  return (
    <Flex
      as="header"
      align="center"
      justify="between"
      className={containerStyle()}
    >
      <WebstudioIcon size={22} />

      <Menu user={user} userPlanFeatures={userPlanFeatures} />
    </Flex>
  );
};
