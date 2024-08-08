import { type ComponentProps, type Ref, forwardRef } from "react";
import * as Primitive from "@radix-ui/react-popover";
import { css, theme, styled, type CSS } from "../stitches.config";
import { Separator } from "./separator";

export const Popover = Primitive.Root;

export const PopoverPortal = Primitive.Portal;

const contentStyle = css({
  border: `1px solid ${theme.colors.borderMain}`,
  boxShadow: `${theme.shadows.menuDropShadow}, inset 0 0 0 1px ${theme.colors.borderMenuInner}`,
  background: theme.colors.backgroundMenu,
  borderRadius: theme.borderRadius[6],
  display: "flex",
  flexDirection: "column",
  maxWidth: "max-content",
  "&:focus": {
    // override browser default
    outline: "none",
  },
});

const ArrowBackground = styled("path", { fill: theme.colors.backgroundMenu });
const ArrowInnerBorder = styled("path", { fill: theme.colors.borderMenuInner });
const ArrowOuterBorder = styled("path", { fill: theme.colors.borderMain });
const ArrowSgv = styled("svg", { transform: "translateY(-3px)" });
const Arrow = () => (
  <Primitive.Arrow width={16} height={11} asChild>
    <ArrowSgv xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 11">
      <ArrowOuterBorder d="M8.73 9.76a1 1 0 0 1-1.46 0L.5 2.54h15L8.73 9.76Z" />
      <ArrowInnerBorder d="M8.146 8.909a.2.2 0 0 1-.292 0L.5 1.065h15L8.146 8.909Z" />
      <ArrowBackground d="M8.073 7.52a.1.1 0 0 1-.146 0L.877 0h14.246l-7.05 7.52Z" />
    </ArrowSgv>
  </Primitive.Arrow>
);

export const PopoverContent = forwardRef(
  (
    {
      children,
      className,
      css,
      hideArrow,
      sideOffset,
      ...props
    }: ComponentProps<typeof Primitive.Content> & {
      hideArrow?: boolean;
      css?: CSS;
    },
    ref: Ref<HTMLDivElement>
  ) => (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset ?? 4}
        collisionPadding={4}
        className={contentStyle({ className, css })}
        {...props}
        ref={ref}
      >
        {children}
        {hideArrow !== true && <Arrow />}
      </Primitive.Content>
    </Primitive.Portal>
  )
);
PopoverContent.displayName = "PopoverContent";

export const PopoverTrigger = Primitive.Trigger;
export const PopoverClose = Primitive.Close;

export const PopoverMenuItemRightSlot = styled("span", {
  marginLeft: "auto",
  display: "flex",
});

export const PopoverSeparator = styled(Separator);
