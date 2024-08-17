import { ContentEmbedIcon } from "@webstudio-is/icons/svg";
import { imagePlaceholderDataUrl } from "@webstudio-is/image";
import {
  WsEmbedTemplate,
  descendantComponent,
  type WsComponentMeta,
} from "@webstudio-is/react-sdk";

const htmlSample = `
<h1>内容嵌入的HTML样式</h1>
<p>内容嵌入允许对HTML进行样式化，这主要来自外部数据。</p>
<h2>如何使用内容嵌入</h2>
<ul>
  <li>每个元素都显示在导航器中。</li>
  <li>应用样式和令牌到每个元素上。</li>
  <li>对元素的调整在此嵌入中普遍适用，确保整个内容的一致性。</li>
</ul>
<hr>
<h2>这个示例文本包含了所有可以设置样式的元素。</h2>
<p>上面未使用的元素将在下面使用。</p>
<h3>标题 3</h3>
<h4>标题 4</h4>
<h5>标题 5</h5>
<h6>标题 6</h6>
<p><a href="#">链接</a> 将内容与相关资源连接起来。</p>
<p><strong>粗体</strong> 让你的重点突出。</p>
<p><em>斜体</em> 非常适合强调。</p>
<ol>
  <li>第一步</li>
  <li>第二步</li>
</ol>
<img src="${imagePlaceholderDataUrl}">
<blockquote>用有力的引语吸引注意力。</blockquote>
<p>使用 <code>console.log("Hello World");</code> 会在控制台出现。</p>
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
  type: "control",
  icon: ContentEmbedIcon,
  order: 3,
  template: [
    {
      type: "instance",
      component: "HtmlEmbed",
      label: "嵌入内容",
      props: [
        {
          name: "code",
          type: "string",
          value: htmlSample,
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
