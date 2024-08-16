import { Suspense, type ComponentProps } from "react";
import {
  Flex,
  TooltipProvider,
  globalCss,
  theme,
} from "@webstudio-is/design-system";
import type { DashboardProject } from "@webstudio-is/dashboard";
import { Header } from "./header";
import { Projects } from "./projects";
import type { User } from "~/shared/db/user.server";
import type { UserPlanFeatures } from "~/shared/db/user-plan-features.server";
import { Await, useAsyncValue } from "@remix-run/react";
// import { Resources } from "./resources";

const globalStyles = globalCss({
  body: {
    margin: 0,
    background: theme.colors.brandBackgroundDashboard,
  },
});

const Main = (props: ComponentProps<typeof Flex>) => {
  return (
    <Flex
      {...props}
      as="main"
      direction="column"
      gap="5"
      css={{ padding: theme.spacing[13] }}
    />
  );
};

const Section = (props: ComponentProps<typeof Flex>) => {
  return (
    <Flex
      {...props}
      justify="center"
      as="section"
      css={{ minWidth: theme.spacing[33] }}
    />
  );
};

type DashboardProps = {
  user: User;
  projects: Array<DashboardProject>;
  projectTemplates: Array<DashboardProject>;
  userPlanFeatures: UserPlanFeatures;
  publisherHost: string;
  imageBaseUrl: string;
};

export const Dashboard = ({
  user,
  projects,
  projectTemplates,
  userPlanFeatures,
  publisherHost,
  imageBaseUrl,
}: DashboardProps) => {
  globalStyles();
  return (
    <Suspense>
      <TooltipProvider>
        <Header user={user} userPlanFeatures={userPlanFeatures} />
        <Main>
          {/* 暂时隐藏 */}
          <Section>{/* <Resources /> */}</Section>
          <Section>
            <Projects
              projects={projects}
              projectTemplates={projectTemplates}
              hasProPlan={userPlanFeatures.hasProPlan}
              publisherHost={publisherHost}
              imageBaseUrl={imageBaseUrl}
            />
          </Section>
        </Main>
      </TooltipProvider>
    </Suspense>
  );
};
