import { useRef, useMemo } from "react";
import type { Point } from "./geometry-utils";

// Time between frames of scroll animation in milliseconds
const FRAME_PERIOD = 30;

export const getSpeed = (
  pointerPosition: number,
  containerStart: number,
  containerEnd: number,
  edgeDistanceThreshold: number,
  minSpeed: number,
  maxSpeed: number
) => {
  const thresholdSafe = Math.min(
    (containerEnd - containerStart) / 2,
    edgeDistanceThreshold
  );

  const startAdjusted = containerStart + thresholdSafe;
  const endAdjusted = containerEnd - thresholdSafe;

  const distanceFromEdgeToSpeed = (distance: number) => {
    // between 0 and 1
    const normalized = Math.min(distance, thresholdSafe) / thresholdSafe;

    // speed in pixels per second
    return minSpeed + normalized * (maxSpeed - minSpeed);
  };

  if (pointerPosition < startAdjusted) {
    return -1 * distanceFromEdgeToSpeed(startAdjusted - pointerPosition);
  }

  if (pointerPosition > endAdjusted) {
    return distanceFromEdgeToSpeed(pointerPosition - endAdjusted);
  }

  return 0;
};

type UseAutoScrollProps = {
  edgeDistanceThreshold?: number;

  // If set to true the entire document will be scrolled.
  // No need to set targetRef in this case.
  fullscreen?: boolean;

  // min/max speed of the scroll animation in pixels per second
  minSpeed?: number;
  maxSpeed?: number;
};

type UseAutoScrollHandlers = {
  handleMove: (pointerCoordinate: Point) => void;
  setEnabled: (enabled: boolean) => void;
  targetRef: (element: HTMLElement | null) => void;
};

export const useAutoScroll = (
  props: UseAutoScrollProps = {}
): UseAutoScrollHandlers => {
  // We want to use fresh props every time we use them,
  // but we don't need to react to updates.
  // So we can put them in a ref and make useMemo below very efficient.
  const latestProps = useRef<UseAutoScrollProps>(props);
  latestProps.current = props;

  const state = useRef({
    target: null as HTMLElement | null,
    enabled: false,
    prevTimestamp: 0,
    speedX: 0,
    speedY: 0,
    stepScheduled: false,
  });

  return useMemo(() => {
    const getViewportRect = () => {
      if (latestProps.current.fullscreen) {
        return {
          top: 0,
          left: 0,
          bottom: window.innerHeight,
          right: window.innerWidth,
        };
      }

      if (state.current.target === null) {
        return;
      }

      return state.current.target.getBoundingClientRect();
    };

    const scrollBy = (x: number, y: number) => {
      if (latestProps.current.fullscreen) {
        window.scrollBy(x, y);
      }

      if (state.current.target === null) {
        return;
      }

      state.current.target.scrollBy(x, y);
    };

    const step = (timestamp: number) => {
      state.current.stepScheduled = false;

      if (
        !state.current.enabled ||
        (Math.round((state.current.speedX / 1000) * FRAME_PERIOD) === 0 &&
          Math.round((state.current.speedY / 1000) * FRAME_PERIOD) === 0)
      ) {
        return;
      }

      const elapsed = timestamp - state.current.prevTimestamp;

      // to avoid a big jump when auto-scroll becomes enabled
      if (elapsed > FRAME_PERIOD * 100) {
        state.current.prevTimestamp = timestamp;
        scheduleStep();
        return;
      }

      if (elapsed < FRAME_PERIOD) {
        scheduleStep();
        return;
      }

      state.current.prevTimestamp = timestamp;

      scrollBy(
        (state.current.speedX / 1000) * elapsed,
        (state.current.speedY / 1000) * elapsed
      );

      scheduleStep();
    };

    const scheduleStep = () => {
      if (!state.current.stepScheduled) {
        state.current.stepScheduled = true;
        window.requestAnimationFrame(step);
      }
    };

    const {
      edgeDistanceThreshold = 20,
      minSpeed = 1,
      maxSpeed = 500,
    } = latestProps.current;

    return {
      handleMove({ x, y }) {
        if (!state.current.enabled) {
          return;
        }

        const rect = getViewportRect();
        if (rect === undefined) {
          return;
        }

        state.current.speedY = getSpeed(
          y,
          rect.top,
          rect.bottom,
          edgeDistanceThreshold,
          minSpeed,
          maxSpeed
        );

        state.current.speedX = getSpeed(
          x,
          rect.left,
          rect.right,
          edgeDistanceThreshold,
          minSpeed,
          maxSpeed
        );

        scheduleStep();
      },
      setEnabled(newEnabled) {
        state.current.enabled = newEnabled;
        scheduleStep();
      },
      targetRef: (element) => {
        state.current.target = element;
      },
    };
  }, []);
};
