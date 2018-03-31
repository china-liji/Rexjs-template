import { RexjsTemplate } from "../source/rexjs-template.js";

import temp from "./temp.html";

let data = {
	isRed: false,
	text: "123",
	key: "mykey",
	bigSize: 9,
	red: "#f00",
	blue: "#00f",
	value: 100,
	text: "hello",
	arr: [1,2,3,4],
	's"s': 123,
	onclick: function(){
		alert(99999)
	}
};

document.querySelector("body > div").appendChild(
	RexjsTemplate.compile(temp, data)
);

// 2 秒后修改 data.blue 属性
setTimeout(() => {
	// 修改数据
	data.blue = "#22f";
	data.arr[1] = -1;

	// 主动刷新数据
	RexjsTemplate.refresh(data);
}, 2000);

// RexjsTemplate.watch();
// window.data = data;