### Rexjs-Template - 是一种具有数据绑定功能的 html 模板解析器
------
#### 快速使用
`./temp.html`
```html
<div onclick="<%= this.onclick %>">
	<span data-key="<%= this.key %>" >
		<% if(this.isRed){ %>
			<p><%= this.red %></p>
		<% }else{ %>
			<p><%= this.blue %></p>
		<% } %>
	</span>
	<br />
	<ul class="my-url-class">
		<% for(var i = 0;i < 3;i++){ %>
			<li><%= i %></li>
		<% } %>
	</ul>
</div>
```

`JavaScript`
```js
// babel 解析 es6 版
import { RexjsTemplate } from "./rexjs-template.min.js";
// Rexjs（https://github.com/china-liji/Rexjs） 解析 es6 版
import { RexjsTemplate } from "./rexjs-template-unhelper.min.js";
// script 标签形式：<script src="./rexjs-template.min.js"></script>
let RexjsTemplate = window.RexjsTemplate;

// 加载 html 模板
import temp from "./temp.html";

// 初始化数据
let data = {
	isRed: false,
	red: "#f00",
	blue: "#00f",
	key: "hello",
	onclick: function(){
		alert(99999)
	}
};

// 编译模板，获取元素
let returnElement = RexjsTemplate.compile(
	// html 模板字符串
	temp,
	// 模板数据
	data,
	// 模板中所关联的选择器映射，只处理模板中的 id 与 class
	{ myUlClass: "my-ul-class-gd6" }
);

// 添加到 body
document.body.appendChild(returnElement);

// 2 秒后修改 data.blue 属性
setTimeout(() => {
	// 修改数据
	data.blue = "#22f";

	// 主动刷新数据相关模板
	RexjsTemplate.refresh(data);
}, 2000);
```

#### 最终渲染结果 - `returnElement.outerHTML`
```html
<div rex-template>
	<span data-key="hello">
		
			<p>#22f</p>
		
	</span>
	<br>
	<ul class="my-url-class">
		
			<li>0</li>
		
			<li>1</li>
		
			<li>2</li>
		
	</ul>
</div>
```

#### 属性
`RexjsTemplate.watching`：是否处于自动监听数据中。
* `@type {Boolean}`

#### 方法
`RexjsTemplate.addRef(ref)`：添加需要判断引用类型实例的构造函数。
* `@params {Function} ref` - 需要判断引用类型实例的构造函数

`RexjsTemplate.compile(template, data, _selectorMap)`：编译模板，返回生成的模板根元素。
* `@param {String} template` - `html`模板
* `@param {Object, Array} data` - 模板数据
* `@param {Rexjs.CSSSelectorMap, Object} _selectorMap` - 选择器映射表
* `@returns {HTMLElement}`

`RexjsTemplate.refresh(_data)`：根据数据刷新对应模板，返回受影响而被刷新的模板数量。
* `@param {Object, Array} _data` - 模板数据
* `@returns {Number}`

`RexjsTemplate.watch()`：自动监听数据：当数据发生变动时，如果对应模板在**视窗范围**内，则会在**下一帧**时自动更新模板信息。

`RexjsTemplate.unwatch()`：取消自动监听数据。

-----

#### 相关产品
* `Rexjs`（https://github.com/china-liji/Rexjs） - 是一款又快、又小、性价比极高的 JavaScript(ES6+) 语法的编译器！

-----
### 谢谢使用