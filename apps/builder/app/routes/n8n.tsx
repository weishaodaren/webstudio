import type { ServerRuntimeMetaFunction as MetaFunction } from "@remix-run/server-runtime";
import { Root } from "~/shared/remix/root";

export const meta: MetaFunction = () => {
  return [{ title: "编辑器" }];
};

export default Root;
