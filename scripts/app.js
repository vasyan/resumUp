/**
 * Создание кастомного метода отрисовки пайчартов
 *
 * Принимает объект params:
 *	cx - x-координата цертра окружности
 *	cy - y-координата цетра окружности
 *	radius - радиус окружности
 * 	orientation - направленность пайчарта
 *	font-size - размер шрифта легенды и значений
 *	data - массив данных для отображения вида [{"label{string}": value{int}}]
 *	
**/


Raphael.fn.pieChart = function(params) {

	var paper = this,
		rad = Math.PI / 180,
		chart = this.set(),
		cx = params.cx,
		cy = params.cy,
		r = params.radius || 100,
		chartName = params.data.title,
		result = params.data.result,
		length = result.length,
		values = [],
		labels = [],
		orientationMap = {
			"top": 0,
			"left": 1,
			"bottom": 2,
			"right": 3
		},
		orientation = orientationMap[params.orientation || "top"],
		fontSize = params["font-size"] || 20,
		angle = 90 * orientation,
		total = 0,
		iterationIndex = 0,
		i,
		colorMap = [
			[26, 188, 156],
			[46, 204, 113],
			[52, 152, 219],
			[155, 89, 182],
			[52, 73, 94],
			[241, 196, 15],
			[230, 126, 34],
			[231, 76, 60],
			[149, 165, 16]
		];


	function isTop() {
		return orientation === 0;
	}


	function isRight() {
		return orientation === 3;
	}


	function isBottom() {
		return orientation === 2;
	}


	function isLeft() {
		return orientation === 1;
	}


	function renderSector(params) {
		var cx = params.cx,
			cy = params.cy,
			r = params.r,
			delta = 1.65,
			orientation = params.orientation,
			startAngle = params.startAngle,
			endAngle = params.endAngle,
			popAngle = params.popAngle,
			value = params.value,
			markerShift = getShiftIndex(orientation, popAngle),
			textAnchor = markerShift !== -1 ? "start" : "end",

			// Координаты внешней кривой
			outerPoint1 = getCoordinates(0.66, startAngle),
			outerPoint2 = getCoordinates(0.66, endAngle),

			// Координаты внутренней кривой
			innerPoint1 = getCoordinates(0.94, startAngle),
			innerPoint2 = getCoordinates(0.94, endAngle),

			// Параметры кривой
			innerArk = getArc(innerPoint2.x, innerPoint2.y, 0.94),
			outerArk = getArc(outerPoint2.x, outerPoint2.y, 0.66),

			// Координаты маркера
			markerPoint1 = getCoordinates(0.84, popAngle),
			markerPoint2 = getCoordinates(1.65, popAngle),

			valuePoin = getCoordinates(delta, popAngle);


		function getShiftIndex(orientation, popAngle){
			return (isTop() && popAngle >= 90) ||
				isBottom() && popAngle >= 270 ||
				isRight() ? 1 : -1;
		}


		function getShiftLenght() {
			return (fontSize * (value.toString().length + 1)) * 0.7 * markerShift;
		}


		function getCoordinates(modificator, angle) {

			var sin = Math.sin(-angle * rad),
				cos = Math.cos(-angle * rad);

			function _multyCos(x, y) {
				return isTop() ? -(x * y) : (x * y);
			}
			function _multySin(x, y) {
				return isRight() ? -(x * y) : (x * y);
			}
			return {
				x: cx + _multyCos(r * modificator, cos),
				y: cy + _multySin(r * modificator, sin)
			};
		}


		function getArc(x, y, modificator) {
			return [r * modificator, r * modificator, 0, +(endAngle - startAngle > 180), getAxis(), x, y];
		}


		function getMarkerCircleRadius() {
			return r * 0.03;
		}


		function getLineHeight() {
			return valuePoin.y - fontSize * 0.7;
		}


		function getStrokeWidth(modificator){
			modificator = modificator || 1;
			return params.attr["stroke-width"] * modificator;
		}


		return {
			inner: paper.path([
				"M", innerPoint1.x, innerPoint1.y,
				"A", innerArk
			]).attr({
				"stroke": params.attr.strokeOuter,
				"stroke-width": getStrokeWidth(1.5)
			}),
			outer: paper.path([
				"M", outerPoint1.x, outerPoint1.y,
				"A", outerArk,
			]).attr({
				"stroke": params.attr.strokeInner,
				"stroke-width": getStrokeWidth()
			}),
			markerLine: paper.path([
				"M", markerPoint1.x, markerPoint1.y,
				"L", markerPoint2.x, markerPoint2.y,
				"h", getShiftLenght()
			]).attr({
				"stroke-width": 2
			}),
			markerCircle: paper.circle(
				markerPoint1.x,
				markerPoint1.y,
				getMarkerCircleRadius()
			).attr({
				"fill": "#000"
			}),
			percentsTitle: paper.text(
				valuePoin.x,
				getLineHeight(),
				value + "%"
			)
			.attr({
				"font-size": fontSize,
				"text-anchor": textAnchor
			})
		};
	}


	function renderLegend(params) {

		var orientationMap = [
				[cx - r, cy + r * 0.5],
				[cx + r * 0.5, cy - r],
				[cx - r, cy - length * (fontSize * 1.2)],
				[cx - r * 0.7, cy - r * 1.05]
			],
			lcx = orientationMap[orientation][0],
			lcy = orientationMap[orientation][1],
			verticalShift = fontSize * iterationIndex,
			textAnchor = isRight() ? "end" : "start",
			legend = {};


		if (iterationIndex === 0) {
			legend.title = paper.text(
				isRight() ? lcx + fontSize * 1.15 : lcx - fontSize * 1.25,
				lcy - fontSize * 1.4,
				chartName
			).attr({
				"font-size": fontSize * 1.4,
				"text-anchor": textAnchor
			});
		}

		legend.row = {
			sample: paper.rect(
				isRight() ? lcx + fontSize * 0.4: lcx - fontSize * 1.1,
				lcy + verticalShift - fontSize * 0.25,
				fontSize * 0.7,
				fontSize * 0.5
			).attr({
				"fill": params.attr.sectorColor,
				"stroke": "none"
			}),
			label: paper.text(
				lcx,
				lcy + verticalShift,
				labels[iterationIndex]
			).attr({
				"text-anchor": textAnchor
			})
		};

	}


	function shuffleColors(arr) {
		var rand,
			index = 0,
			shuffled = [],
			i,
			length = arr.length,

			getRandomIndex = function(min, max) {
				if (max == null) {
					max = min;
					min = 0;
				}
				return min + Math.floor(Math.random() * (max - min + 1));
			};

		for(i = 0; i < length; i++){
			rand = getRandomIndex(index++);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = arr[i];
		}

		return shuffled;

	}


	function fillValueAndLabels() {
		for(i = 0; i < length; i++) {
			for(var entity in result[i]) {
				if(result[i].hasOwnProperty(entity)){
					values.push(result[i][entity]);
					labels.push(entity);
				}
			}
		}
	}


	function getAxis() {
		return isTop() || isRight() ? 1 : 0;
	}


	function process(j) {

		var value = values[j],
			anglePlus = 180 * value / total,
			popAngle = angle + (anglePlus / 2),
			ms = 200,
			bcolorInner = buildColor(colorMap[j], 1.0),
			bcolorOuter = buildColor(colorMap[j], 0.8),
			sectorSet = paper.set(),
			l = renderLegend({
				"attr": {
					"sectorColor": bcolorInner
				}
			}),

			p = renderSector({
				"cx": cx,
				"cy": cy,
				"r": r,
				"startAngle": angle,
				"endAngle": angle + anglePlus,
				"popAngle": popAngle,
				"value": value,
				"orientation": orientation,
				attr: {
					"strokeInner": bcolorInner,
					"strokeOuter": bcolorOuter,
					"stroke-width": r / 2.7
				}

			}),
			
			pushParam = {
				transform: ["s", 1.1, 1.1, cx, cy]
			},
			resetPushParam = {
				transform: ""
			},
			push = Raphael.animation(pushParam, ms),
			resetPush = Raphael.animation(resetPushParam, ms);

		// "выдвигание" активного сектора
		function togglePushSector(sector, value) {
			sector.inner.animate(value ? push : resetPush);
		}


		function buildColor(colorArray, opacity) {
			return "rgba(" + colorArray.join(",") + "," + opacity + ")";
		}


		sectorSet.push(
			p.outer,
			p.inner,
			p.markerLine,
			p.markerCircle,
			p.percentsTitle
		);

		sectorSet.hover(
			function() {
				togglePushSector(p, true);
			},
			function() {
				togglePushSector(p, false);
			}
		);

		angle += anglePlus;
		chart.push(p);
		chart.push(l);
		iterationIndex += 1;

	}

	fillValueAndLabels(result);
	colorMap = shuffleColors(colorMap);

	for (i = 0; i < length; i++) {
		total += values[i];
	}
	for (i = 0; i < length; i++) {
		process(i);
	}

	return chart;

};


(function(raphael) {

	window.onload = function() {

		// набор данных для отрисовки
		var data = [
			{
				title: "Web Browsers",
				result: [
					{"Chrome": 37},
					{"IE": 19},
					{"Firefox": 17},
					{"Safary": 16},
					{"Opera": 3}
				]
			},
			{
				title: "Operating System",
				result: [
					{"Windows 7": 38},
					{"Windows XP": 10},
					{"IOS 7": 9},
					{"Windows 8": 9},
					{"Mac OS X": 8},
					{"Android 4": 7}
				]
			},
			{
				title: "Yes/No",
				result: [
					{"Yes": 60},
					{"No": 40}
				]
			},
			{
				title: "Yes/No/Nooooo",
				result: [
					{"Nooooo": 60},
					{"No": 30},
					{"Yes": 10}
				]
			}
		];

		//создание чертырех разнообразных чартов
		raphael("holder-0", 700, 700).pieChart({
			"cx": 350,
			"cy": 350,
			"radius": 160,
			"data": data[0],
			"orientation": "top",
			"font-size": 30
		});

		raphael("holder-1", 400, 400).pieChart({
			"cx": 220,
			"cy": 170,
			"radius": 100,
			"data": data[1],
			"orientation": "left",
			"font-size": 13
		});

		raphael("holder-2", 300, 300).pieChart({
			"cx": 150,
			"cy": 150,
			"radius": 50,
			"data": data[2],
			"orientation": "bottom",
			"font-size": 10
		});

		raphael("holder-3", 750, 750).pieChart({
			"cx": 350,
			"cy": 350,
			"radius": 200,
			"data": data[3],
			"orientation": "right"
		});

	};
})(Raphael);