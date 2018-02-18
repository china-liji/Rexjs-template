export let { RexjsTemplate } = new function(DOMAction, ELEMENT_NODE, SYNTAX_REGEXP, document, screen, createdDocument, setTimeout, forEach, throwError, formatText){

this.Reference = function(refs, is){
	return class Reference {
		/**
		 * 拥有该引用属性的对象
		 * @type {Object}
		 */
		owner = null;

		/**
		 * 属性名称
		 * @type {String}
		 */
		name = "";

		/**
		 * 属性值
		 * @type {*}
		 */
		value = null;

		/**
		 * 对象的引用类型属性
		 * @param {Object} owner - 拥有该引用属性的对象
		 * @param {String} name - 属性名称
		 * @param {*} value - 属性值
		 */
		constructor(owner, name, value){
			this.bind(owner, name, value);
		};

		/**
		 * 添加需要判断引用类型实例的构造函数
		 * @param {Function} ref - 需要判断引用类型实例的构造函数
		 */
		static add(ref){
			refs.push(ref);
		};

		/**
		 * 判断是否为数据引用类型的实例
		 * @param {*} object - 需要判断的对象
		 * @returns {Boolean}
		 */
		static is(object){
			return !refs.every(is, object);
		};

		/**
		 * 绑定引用属性，如果与之前引用属性一样，则放回 false，否则返回 true
		 * @param {Object} o - 拥有该引用属性的对象
		 * @param {String} n - 属性名称
		 * @param {Function} v - 属性值
		 * @returns {Boolean}
		 */
		bind(o, n, v){
			// 如果与之前相同
			if(
				o === this.owner &&
				n === this.name &&
				v === this.value
			){
				// 返回
				return false;
			}

			// 覆盖属性
			this.owner = o;
			this.name = n;
			this.value = v;

			return true;
		};
	};
}(
	// refs
	(
		typeof $ === "function" && $.fn && $.fn.constructor ?
			[ $.fn.constructor ] :
			[]
	)
	.concat(
		[ Node, Function ]
	),
	// is
	function(ref){
		return !(this instanceof ref);
	}
);

this.Data = function(Reference, STATUS_NONE, STATUS_OVERRIDE, keys){
	return class Data {
		/**
		 * 数据无修改状态
		 * @type {Number}
		 */
		static STATUS_NONE = STATUS_NONE;

		/**
		 * 数据被修改状态
		 * @type {Number}
		 */
		static STATUS_OVERRIDE = STATUS_OVERRIDE;

		/**
		 * 数据源，即初始化时候的数据
		 * @type {*}
		 */
		origin = null;

		/**
		 * 引用属性列表
		 * @type {Array}
		 */
		refs = null;

		/**
		 * 当前比对中，引用属性的索引值
		 * @type {Number}
		 */
		refIndex = -1;

		/**
		 * 修改状态
		 * @type {Number}
		 */
		status = STATUS_NONE;

		/**
		 * 上一次的数据解析字符串，用于对比数据使用
		 * @type {String}
		 */
		string = "";

		/**
		 * 模板数据
		 * @param {origin} - 数据源，即初始化时候的数据
		 */
		constructor(origin){
			// 如果是 null 或者 不是对象
			if(origin === null || typeof origin !== "object"){
				origin = {};
			}

			this.refs = [];
			this.origin = origin;
		};

		/**
		 * 对比数据，看数据是否有被修改
		 * @returns {Boolean}
		 */
		compare(){
			var string, refIndex, refs = this.refs;

			// 重置索引
			this.refIndex = 0;
			// 重置状态
			this.status = STATUS_NONE;

			// 解析数据
			string = this.parse(this.origin);
			// 获取索引
			refIndex = this.refIndex;

			// 如果索引值不等于长度，说明某个方法被删除或者有新方法添加
			if(refIndex !== refs.length){
				// 根据长度来删除多余方法
				refs.splice(refIndex);

				// 设置状态为被修改
				this.status |= STATUS_OVERRIDE;
			}

			// 如果两次字符串对比不相同，说明有数据被修改
			if(this.string !== string){
				// 记录字符串
				this.string = string;
				// 设置状态为被修改
				this.status |= STATUS_OVERRIDE;
			}

			// 根据状态判断数据是否被修改过
			return (this.status & STATUS_OVERRIDE) === STATUS_OVERRIDE;
		};

		/**
		 * 解析源数据
		 * @param {*} origin - 需要解析的源数据
		 * @returns {Number}
		 */
		parse(origin){
			var string = "", ks = keys(origin);

			// 添加起始大括号
			string += "{";

			// 循环
			for(let i = 0, j = ks.length;i < j;i++){
				let key = ks[i], value = origin[key];

				// 添加键
				string += `"${key}":`;

				// 判断值类型
				switch(typeof value){
					// 如果是对象
					case "object":
						// 如果是引用实例
						if(Reference.is(value)){
							break;
						}

						// 继续解析该属性值
						string += this.parse(value);

						// 添加对象属性分隔符“逗号”
						string += ",";
						continue;

					// 如果是函数
					case "function":
						break;

					// 其他
					default:
						// 直接追加值
						string += `"${value}",`;
						continue;
				}

				let { refs, refIndex } = this;

				// 方法索引递增
				this.refIndex++;

				// 如果索引值小于长度
				if(refIndex < refs.length){
					// 如果被重新绑定，说明是不同方法
					if(refs[refIndex].bind(origin, key, value)){
						// 设置为被修改状态
						this.status |= STATUS_OVERRIDE;
					}
				}
				// 如果大于等于长度，说明有新方法增加
				else {
					// 记录方法
					refs.push(
						new Reference(origin, key, value)
					);

					// 设置为被修改状态
					this.status |= STATUS_OVERRIDE;
				}

				// 追加属性值为“空字符串”与属性分隔符“逗号”
				string += '"",';
			}

			// 追加结束大括号
			string += "}";
			return string;
		};
	};
}(
	this.Reference,
	// STATUS_NONE
	parseInt("0", 2),
	// STATUS_OVERRIDE
	parseInt("1", 2),
	Object.keys
);

this.DOMAction = DOMAction = function(Node, appendTo){
	return class DOMAction {
		/**
		 * 子节点实例在 ActionList 中的索引值集合
		 * @type {Array.<Number>}
		 */
		childIndexes = null;

		/**
		 * 根据 model.cloneNode() 而来，实际添加到文档中的节点
		 * @type {Array.<Node>}
		 */
		clones = null;

		/**
		 * 当前解析轮次数，标志着被当前解析了多少次
		 * @type {Number}
		 */
		count = 0;
		
		/**
		 * 记录该实例于 ActionList 中索引值
		 * @type {Number}
		 */
		index = -1;

		/**
		 * 记录该实例在模板语法上，是被第几个添加到父节点上的
		 * @type {Number}
		 */
		indexOf = -1;

		/**
		 * 添加子节点时，所记录的最后一个子节点实例于 ActionList 中的索引值
		 * @type {Number}
		 */
		indexBy = -1;

		/**
		 * 模型节点：根据模板解析时，所生成的最原始节点模型
		 * @type {Node}
		 */
		model = null;

		/**
		 * DOM 行为
		 * @param {Node} model - 模型节点：根据模板解析时，所生成的最原始节点模型
		 */
		constructor(model){
			this.childIndexes = [];
			this.clones = [];
			this.model = model;
		};

		/**
		 * 响应添加至父节点
		 * @param {ActionList} actionList - 行为列表
		 * @param {Number} parentIndex - 父节点实例于 ActionList 中的索引值
		 */
		applyAppendTo(actionList, parentIndex){
			var clones = this.clones, parentDomAction = actionList[parentIndex];

			// 如果总数大于长度，说明是新增到文档中的节点
			if(this.count >= clones.length){
				// 克隆出新的节点
				let clone = this.model.cloneNode();

				// 添加到父节点
				appendTo(clone, actionList, parentDomAction);
				// 添加到记录中
				clones.push(clone);
			}

			// 将当前实例于 actionList 中的索引值记录在父节点实例上
			parentDomAction.indexBy = this.indexOf;
			// 总数加一
			this.count++;
		};

		/**
		 * 响应设置属性
		 * @param {String} name - 属性名
		 * @param {String} value - 属性值
		 */
		applyAttr(name, value){
			var attribute = this.dom.attributes[name];

			// 如果值相同，说明没有被修改
			if(attribute.value === value){
				return;
			}

			// 重新设置值
			attribute.value = value;
		};

		/**
		 * 响应设置事件
		 * @param {String} name - 事件名
		 * @param {Function} listener - 监听器
		 */
		applyEvent(name, listener){
			var dom = this.dom;

			// 如果值相同，说明没有被修改
			if(dom[name] === listener){
				return;
			}

			// 重新设置值
			dom[name] = listener;
		};

		/**
		 * 响应替换节点
		 * @param {Node} node - 需要替换的节点
		 */
		applyReplace(node){
			var dom = this.dom;

			// 如果是同一个节点
			if(dom === node){
				return;
			}

			// 如果不是 Node 实例，但是有长度，作为 NodeList 操作
			if(!(node instanceof Node) && node.length > 0){
				// 取第一项
				node = node[0];
			}

			// 集合中替换当前节点
			this.clones.splice(-1, 1, node);
			// 父节点中替换当前节点
			dom.parentNode.replaceChild(node, dom);
		};

		/**
		 * 响应设置文本
		 * @param {String} value - 值
		 */
		applyText(value){
			var dom = this.dom;

			// 如果值相同，说明没有被修改
			if(dom.textContent === value){
				return;
			}

			// 重新设置值
			dom.textContent = value;
		};

		/**
		 * 获取当前节点
		 * @return {Node}
		 */
		get dom(){
			return this.clones[this.count - 1];
		};

		/**
		 * 行为完毕，说明此轮解析、更新结束
		 */
		finish(){
			var clones = this.clones, count = this.count;

			// 判断个数
			switch(clones.length){
				case 0:
				case count:
					break;

				// 如果长度不一致
				default:
					// 从 clones 中删除
					clones.splice(count).forEach((clone) => {
						var parentNode = clone.parentNode;

						// 移除节点
						parentNode && parentNode.removeChild(clone);
					});
					break;
			}

			// 重置
			this.count = 0;
			this.indexBy = -1;
		};
	};
}(
	Node,
	// appendTo
	(clone, actionList, parentDomAction) => {
		var { dom: parentDom, indexBy } = parentDomAction;

		// 如果父节点实例已经有添加过的子节点
		if(indexBy > -1){
			let sibling = (
				actionList[
					parentDomAction.childIndexes[indexBy]
				]
				.dom
				.nextSibling
			);

			// 如果兄弟节点存在
			if(sibling){
				// 插入到兄弟节点之前
				parentDom.insertBefore(clone, sibling);
				return;
			}
		}

		// 追加到最后
		parentDom.appendChild(clone);
	}
);

this.FragmentAction = function(every){
	return class FragmentAction extends DOMAction {
		/**
		 * 文档片段行为
		 */
		constructor(){
			super(
				createdDocument.createDocumentFragment()
			);
		};

		/**
		 * 获取当前节点
		 * @return {Node}
		 */
		get dom(){
			return this.model;
		};

		/**
		 * 当前解析轮次数，标志着被当前解析了多少次
		 * @type {Number}
		 */
		get count(){
			return 0;
		};

		/**
		 * 行为完毕，说明此轮解析、更新结束
		 */
		finish(){};

		/**
		 * 获取根元素
		 * @returns {Node}
		 */
		get rootElement(){
			var rootElement;

			// 遍历
			every.call(
				this.dom.childNodes,
				(node) => {
					// 如果不是元素
					if(node.nodeType !== ELEMENT_NODE){
						return true;
					}

					// 获取元素
					rootElement = node;
					return false;
				}
			);

			// 返回元素
			return rootElement;
		};
	};
}(
	Array.prototype.every
);

this.ActionList = function(push, splice){
	return class ActionList {
		/**
		 * 长度
		 * @type {Number}
		 */
		length = 0;

		/**
		 * 行为完毕，说明此轮解析、更新结束
		 */
		finishAll(){
			// 遍历
			this.forEach((domAction) => {
				domAction.finish();
			});
		};

		/**
		 * 遍历列表
		 */
		forEach(){
			return forEach.apply(this, arguments);
		};

		/**
		 * 获取最大索引值
		 * @type {Number}
		 */
		get max(){
			return this.length - 1;
		};

		/**
		 * 追加列表项
		 * @param {DOMAction} domAction - 需要追加的 DOMAction 实例
		 * @param {Number} parentIndex - 父节点实例于该列表中的索引值
		 * @returns {Number}
		 */
		push(domAction, parentIndex){
			var parentDomAction = this[parentIndex], index = this.length;

			// 记录于该列表中的索引值
			domAction.index = index;

			// 如果父节点实例存在
			if(parentDomAction){
				let childIndexes = parentDomAction.childIndexes;

				// 记录添加到父节点实例的顺序索引
				domAction.indexOf = childIndexes.length;

				// 记录到父节点实例的 childIndexes 中
				childIndexes.push(index);
			}

			// 返回原生函数的结果
			return push.call(this, domAction);
		};

		/**
		 * 删除并新增项
		 * @returns {Array.<DOMAction>}
		 */
		splice(){
			return splice.apply(this, arguments);
		};
	};
}(
	Array.prototype.push,
	Array.prototype.splice
);

this.ActionCompiler = function(
	ActionList, FragmentAction,
	EVENT_REGEXP, FORMAT_REGEXP, CLASS_REGEXP, SEPARATOR_REGEXP,
	body,
	hasOwnProperty, onlyElement, comment, execRegExp, pushAction
){
	return class ActionCompiler {
		/**
		 * DOM 行为列表
		 * @type {ActionList}
		 */
		actionList = null;

		/**
		 * 选择器映射表
		 * @type {CSSSelectorMap}
		 */
		selectorMap = null;

		/**
		 * 行为编译器
		 * @param {String} template - html 模板
		 * @param {Array.<String>} collector - 编译结果搜集器
		 * @param {Rexjs.CSSSelectorMap, Object} _selectorMap - 选择器映射表
		 */
		constructor(template, collector, _selectorMap){
			// 初始化行为列表
			var actionList = new ActionList();

			// 如果提供了选择器映射表
			if(_selectorMap){
				// 记录映射表
				this.selectorMap = _selectorMap;
			}

			// 记录行为列表
			this.actionList = actionList;
			// 格式化模板，并设置为 body 的 innerHTML
			body.innerHTML = this.format(template);

			// 判断 body 元素节点的长度
			switch(body.children.length){
				// 如果没有
				case 0:
					throwError("模板中需要一个根元素", body);
					return;
				
				case 1:
					// 判断是否有一个有效元素
					if(onlyElement(body, template)){
						break;
					}

					return;

				// 如果存在多个
				default:
					throwError("模板不应该存在多种（多个、循环、判断等）情况的根元素", template);
					return;
			}
			
			// 追加文档片段行为
			actionList.push(
				new FragmentAction(),
				-1
			);

			// 开始编译节点
			this.compile(body, collector);

			// 清空 innerHTML
			body.innerHTML = "";
		};

		/**
		 * 编译节点
		 * @param {Node} node - 需要编译的节点
		 * @param {Array.<String>} collector - 编译结果搜集器
		 */
		compile(node, collector){
			var actionList = this.actionList, parentIndex = actionList.max;

			// 遍历子节点
			forEach.call(
				node.childNodes,
				(node) => {
					// 如果不是元素
					if(node.nodeType !== ELEMENT_NODE){
						// 追加注释
						collector.push(
							comment(node.textContent)
						);

						// 追加行为
						pushAction(actionList, collector, node, parentIndex);
						return;
					}

					// 编译元素
					this.compileElement(node, collector, parentIndex);
				}
			);
		};

		/**
		 * 编译元素
		 * @param {Element} element - 需要编译的元素
		 * @param {Array.<String>} collector - 编译结果搜集器
		 * @param {Number} parentIndex - 父节点实例索引值
		 */
		compileElement(element, collector, parentIndex){
			var tagName = element.tagName;

			// 如果是模板语法脚本
			if(tagName === "SCRIPT" && element.getAttribute("type") === "rex/template"){
				// 编译脚本
				this.compileScript(
					element.childNodes[0],
					collector,
					element.getAttribute("data-modifier"),
					parentIndex
				);
				return;
			}

			// 如果需要编译选择器
			if(this.selectorMap){
				// 如果存在 id
				if(element.id){
					// 编译 id
					element.id = this.compileSelector(element.id);
				}

				// 如果存在 className
				if(element.className){
					// 编译 className
					element.className = this.compileSelectors(
						element.classList || element.className.match(CLASS_REGEXP)
					);
				}
			}

			// 追加行为
			pushAction(this.actionList, collector, element, parentIndex);

			// 追加注释
			collector.push(
				comment(`<${tagName.toLowerCase()}>`)
			);

			// 遍历属性
			forEach.call(element.attributes, (attr) => {
				// 编译属性
				this.compileAttr(element, attr, collector);
			});

			// 继续编译子节点
			this.compile(element, collector);
		};

		/**
		 * 编译属性
		 * @param {Node} node - 需要编译的节点
		 * @param {Attr} attr - 节点属性
		 * @param {Array.<String>} collector - 编译结果搜集器
		 */
		compileAttr(node, attr, collector){
			var lastContent, lastSubstring, valueList = [];

			// 执行语法匹配正则
			execRegExp(
				attr.value,
				(modifier, content, substring) => {
					// 如果没有等于号
					if(modifier !== "="){
						// 忽略
						return false;
					}

					// 记录值
					lastSubstring = substring;
					lastContent = content;

					// 追加属性值
					valueList.push(
						formatText(substring),
						`" + valueOf(${content}) + "`
					);
					
					return true;
				},
				(substring) => {
					var name = attr.name, index = this.actionList.max;

					// 如果是事件
					if(
						EVENT_REGEXP.test(name) &&
						valueList.length === 2 &&
						lastSubstring.trim().length === 0 &&
						substring.trim().length === 0
					){
						// 追加响应事件代码
						collector.push(
							`actionList[${index}].applyEvent("${name}", ${lastContent});`
						);

						// 移除该属性
						node.removeAttribute(name);
						return;
					}

					// 追加属性值
					valueList.push(
						formatText(substring)
					);

					// 追加响应属性代码
					collector.push(
						`actionList[${index}].applyAttr("${attr.name}", "${valueList.join("")}");`
					);
				}
			);
		};

		/**
		 * 编译选择器
		 * @param {String} selector - 选择器
		 */
		compileSelector(selector){
			// 获取映射表的键（属性名）
			var key, selectorMap = this.selectorMap;
			
			key = selector.replace(
				SEPARATOR_REGEXP,
				function(s){
					return s[1].toUpperCase();
				}
			);

			// 如果有该映射，则返回映射值，否则返回原选择器
			return hasOwnProperty.call(selectorMap, key) ? selectorMap[key] : selector;
		};

		/**
		 * 编译选择器集合
		 * @param {DOMTokenList} selectors - 选择器列表
		 */
		compileSelectors(selectors){
			var result = "";

			// 如果存在
			if(selectors){
				var length = selectors.length;

				// 如果长度大于 0
				if(length > 0){
					// 先编译第一个，因为第一个前面不需要加空格
					result = this.compileSelector(selectors[0]);

					// 编译第 2 至 n 项
					for(var i = 1;i < length;i++){
						// 编译单个选择器
						result += " " + this.compileSelector(selectors[i]);
					}
				}
			}

			return result;
		};

		/**
		 * 编译脚本
		 * @param {Node} node - 需要编译的节点
		 * @param {Array.<String>} collector - 编译结果搜集器
		 * @param {String} modifier - 修饰符
		 * @param {Number} parentIndex - 父节点实例的索引值
		 */
		compileScript(node, collector, modifier, parentIndex){
			var actionList = this.actionList, content = node.textContent;

			// 追加注释
			collector.push(
				comment(content)
			);

			// 如果有修饰符
			if(modifier){
				// 追加行为
				pushAction(actionList, collector, node, parentIndex);

				// 如果是冒号
				if(modifier === ":"){
					// 追加响应文本代码
					collector.push(
						`actionList[${actionList.max}].applyReplace(${content});`
					);
					return;
				}

				// 追加响应文本代码
				collector.push(
					`actionList[${actionList.max}].applyText(valueOf(${content}));`
				);
				return;
			}

			// 追加代码内容
			collector.push(content);
		};

		/**
		 * 格式化模板，目的是让模板解析更安全
		 * @param {String} template - html 模板
		 * @returns {String}
		 */
		format(template){
			// 替换语法标签
			return template.replace(FORMAT_REGEXP, function(str, modifier, content){
				// 如果内容不存在
				if(content === void 0){
					return str;
				}

				// 替换语法标签
				return content.trim() ? `<script type="rex/template" data-modifier="${modifier}"}>${content}</script>` : "";
			});
		};
	};
}(
	this.ActionList,
	this.FragmentAction,
	// EVENT_REGEXP
	/^on[A-z]+$/,
	// FORMAT_REGEXP
	new RegExp(
		[
			// 注释
			/<!--[\s\S]*?-->/,
			// 元素起始、结束标签
			/<\/?[A-z:_](?:"(?:\\"|[^"]+)*"|'(?:\\'|[^']+)*'|[^>]+?)*>/,
			// doctype 标签
			/<!doctype\s+\w+\s*>/,
			// 语法标签
			SYNTAX_REGEXP
		]
		.map((regexp) => {
			return regexp.source;
		})
		.join("|"),
		"g"
	),
	// CLASS_REGEXP
	/\S+/g,
	// SEPARATOR_REGEXP
	/(?:-|_)\w/g,
	// body
	createdDocument.body,
	Object.prototype.hasOwnProperty,
	// onlyElement
	(body, template) => {
		let firstElement = body.firstElementChild;

		switch(false){
			// 如果内容不一致，说明根元素外层还有其他字符
			case body.textContent.trim() === firstElement.textContent.trim():
				throwError("根元素外层不应该出现非注释形式的其他文本", template);
				return false;

			// 如果不是脚本
			case firstElement.tagName === "SCRIPT":
				return true;

			// 如果是脚本，但是不是格式化后的语法脚本
			case firstElement.getAttribute("type") === "rex/template":
				return true;
		}

		// 报错
		throwError("语法标签不允许出现在最外层", template);
		return false;
	},
	// comment
	(text) => {
		return text.length === 0 ? "/**/" : `/* ${text.split("*/").join("*\\/")} */`;
	},
	// execRegExp
	(value, onmatch, onsuccess, _onfail) => {
		var matched, lastIndex = -1;

		// 设置索引
		SYNTAX_REGEXP.lastIndex = 0;
		// 执行匹配
		matched = SYNTAX_REGEXP.exec(value);

		// 如果匹配到了内容
		while(matched){
			let matchedIndex = matched.index;

			// 调用匹配回调
			if(
				onmatch(
					matched[1],
					matched[2],
					value.substring(lastIndex, matchedIndex)
				)
			){
				// 记录 lastIndex
				lastIndex = matchedIndex + matched[0].length;
			}

			// 再次执行匹配
			matched = SYNTAX_REGEXP.exec(value);
		}

		// 如果索引值为 -1，说明没有匹配到任何内容
		if(lastIndex === -1){
			// 调用失败回调
			_onfail && _onfail(value);
			return;
		}

		// 调用成功回调
		onsuccess(
			value.substring(lastIndex)
		);
	},
	// pushAction
	(actionList, collector, node, parentIndex) => {
		// 追加新的行为实例
		actionList.push(
			new DOMAction(node),
			parentIndex
		);

		// 添加响应追加代码
		collector.push(
			`actionList[${actionList.max}].applyAppendTo(actionList, ${parentIndex});`
		);
	}
);

this.RexjsTemplate = window.RexjsTemplate = function(Reference, Data, ActionCompiler, Function, Date, watching, time, requestAnimationFrame, watcher, valueOf){
	return class RexjsTemplate {
		/**
		 * 行为列表
		 * @type {ActionList}
		 */
		actionList = null;

		/**
		 * 数据
		 * @type {Date}
		 */
		data = null;

		/**
		 * 渲染器
		 * @type {Function}
		 */
		renderer = null;

		/**
		 * 模板
		 * @param {ActionList} actionList - 行为列表
		 * @param {Function} renderer - 渲染器
		 * @param {Object, Array} data - 模板数据
		 */
		constructor(actionList, renderer, data){
			var rootElement;
			
			// 记录属性
			this.actionList = actionList;
			this.renderer = renderer;
			this.data = new Data(data);

			// 渲染
			this.render();
			
			// 获取根元素
			rootElement = actionList[0].rootElement;
			// 将该实例记录在元素上
			rootElement.rexjsTemplate = this;

			// 给元素设置属性，标志着是模板元素
			rootElement.setAttribute("rex-template", "");
		};

		/**
		 * 添加需要判断引用类型实例的构造函数
		 * @param {Function} ref - 需要判断引用类型实例的构造函数
		 */
		static addRef(ref){
			Reference.add(ref);
		};

		/**
		 * 编译模板，返回生成的模板根元素
		 * @param {String} template - html 模板
		 * @param {Object, Array} data - 模板数据
		 * @param {Rexjs.CSSSelectorMap, Object} _selectorMap - 选择器映射表
		 * @returns {HTMLElement}
		 */
		static compile(template, data, _selectorMap){
			// 初始化编译器
			var collector = [], compiler = new ActionCompiler(template, collector, _selectorMap), actionList = compiler.actionList;

			// 追加完成代码
			collector.push(
				"actionList.finishAll();"
			);

			// 初始化模板类
			new RexjsTemplate(
				actionList,
				// 生成渲染函数
				new Function(
					"actionList",
					"valueOf",
					collector.join("\n")
				),
				data
			);

			// 返回根元素
			return actionList[0].rootElement;
		};

		/**
		 * 根据数据刷新对应模板，返回受影响而被刷新的模板数量
		 * @param {Object, Array} _data - 模板数据
		 * @returns {Number}
		 */
		static refresh(_data){
			return watcher(true, _data);
		};

		/**
		 * 自动监听数据：当数据发生变动时，如果对应模板在视窗范围内，则会在下一帧时自动更新模板信息
		 */
		static watch(){
			// 如果已经在监听中
			if(watching){
				return;
			}

			var t = Date.now();

			// 设置为已经监听
			watching = true;

			// 如果刷新时间大于 50
			if(t - time > 50){
				// 马上执行一次监听器
				watcher(false);

				time = t;
			}

			// 定时监听
			requestAnimationFrame(() => {
				// 如果在监听中
				if(watching){
					// 先停止
					this.unwatch();
					// 再监听
					this.watch();
				}
			});
		};

		/**
		 * 判断是否已经在自动监听模式中
		 */
		static get watching(){
			return watching;
		};

		/**
		 * 取消自动监听数据
		 */
		static unwatch(){
			watching = false;
		};

		/**
		 * 渲染 html
		 * @param {Boolean} _force - 是否为强制刷新
		 */
		render(_force){
			var data = this.data;

			// 如果是强制刷新，则不需要对比数据，否则需要对比数据
			if(_force || data.compare()){
				// 调用渲染函数
				this.renderer.call(data.origin, this.actionList, valueOf);
			}
		};
	};
}(
	this.Reference,
	this.Data,
	this.ActionCompiler,
	Function,
	Date,
	// watching
	false,
	// time
	-1,
	// requestAnimationFrame
	(
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		((callback) => {
			setTimeout(callback, 50);
		})
	),
	// watcher
	(force, _data) => {
		var count = 0;

		// 遍历
		forEach.call(
			document.querySelectorAll("[rex-template]"),
			(element) => {
				var rexjsTemplate = element.rexjsTemplate, shouldRender = false;

				// 如果提供了数据
				if(_data){
					shouldRender = rexjsTemplate.data.origin === _data;
				}
				else {
					let { top, left, height, width } = element.getBoundingClientRect();

					// 如果垂直方向在屏幕显示范围内
					if(top >= 0 ? top < screen.availHeight : top + height > 0){
						// 获取水平方向是否在屏幕显示范围内
						shouldRender = left >= 0 ? left < screen.availWidth : left + width > 0;
					}
				}

				// 如果需要渲染
				if(shouldRender){
					rexjsTemplate.render(force);
					count++;
				}
			}
		);

		return count;
	},
	// valueOf
	(value) => {
		return value == null ? "" : value.toString();
	}
);

}(
	// DOMAction
	null,
	Node.ELEMENT_NODE,
	// SYNTAX_REGEXP
	/<%([:=]?)([\s\S]*?)%>/g,
	document,
	screen,
	// createdDocument
	document.implementation.createHTMLDocument(""),
	setTimeout,
	Array.prototype.forEach,
	// throwError
	(error, template) => {
		var subTemplate = template.split("\n").slice(0, 5).join("\n");

		throw `${error}：\n\`${subTemplate}\n${subTemplate === template ? "" : "..."}\``;
	},
	// formatText
	(text) => {
		return text.split('"').join('\\"').split("\n").join("\\n");
	}
);