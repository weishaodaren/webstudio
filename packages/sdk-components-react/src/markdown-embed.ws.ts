import { MarkdownEmbedIcon } from "@webstudio-is/icons/svg";
import { imagePlaceholderDataUrl } from "@webstudio-is/image";
import {
  descendantComponent,
  type WsComponentMeta,
  type WsComponentPropsMeta,
  type WsEmbedTemplate,
} from "@webstudio-is/react-sdk";
import { props } from "./__generated__/markdown-embed.props";

const markdownSample = `
# Markdown样式 与 嵌入Markdown 

嵌入Markdown允许设置Markdown样式，这主要来自于外部数据。

## 如何使用嵌入Markdown

- 每个元素都显示在导航器中。
- 应用样式和令牌到每个元素上。
- 对元素的调整在此嵌入中普遍适用，确保整个内容的一致性。

---

## 这个示例文本包含了所有可以设置样式的元素。

上面未使用的元素将在下面使用。

### 标题 3
#### 标题 4
##### 标题 5
###### 标题 6

[链接](#) 将内容与相关资源连接起来。

**粗体** 让你的重点突出。

*斜体* 非常适合强调。

1. 第一步
2. 第二步

![图片](${imagePlaceholderDataUrl})

> 用有力的引语吸引注意力。 

使用 \`console.log("Hello World");\` 会在控制台出现。
`.trim();

const descendant = (label: string, tag: string): WsEmbedTemplate[number] => {
  return {
    type: "instance",
    component: descendantComponent,
    label,
    props: [{ type: "string", name: "selector", value: ` ${tag}` }],
    children: [],
  };
};

export const meta: WsComponentMeta = {
  category: "data",
  type: "embed",
  icon: MarkdownEmbedIcon,
  presetStyle: {
    div: [
      {
        property: "display",
        value: { type: "keyword", value: "contents" },
      },
    ],
  },
  order: 4,
  template: [
    {
      type: "instance",
      component: "MarkdownEmbed",
      props: [
        {
          name: "code",
          type: "string",
          value: markdownSample,
        },
      ],
      children: [
        descendant("Paragraph", "p"),
        descendant("Heading 1", "h1"),
        descendant("Heading 2", "h2"),
        descendant("Heading 3", "h3"),
        descendant("Heading 4", "h4"),
        descendant("Heading 5", "h5"),
        descendant("Heading 6", "h6"),
        descendant("Bold", ":where(strong, b)"),
        descendant("Italic", ":where(em, i)"),
        descendant("Link", "a"),
        descendant("Image", "img"),
        descendant("Blockquote", "blockquote"),
        descendant("Code Text", "code"),
        descendant("List", ":where(ul, ol)"),
        descendant("List Item", "li"),
        descendant("Separator", "hr"),
      ],
    },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props: {
    ...props,
    code: {
      required: true,
      control: "code",
      language: "markdown",
      type: "string",
    },
  },
  initialProps: ["className"],
};
