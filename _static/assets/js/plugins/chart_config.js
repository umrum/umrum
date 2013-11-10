var chart_options = {
	segmentShowStroke: true,				//Boolean - Whether we should show a stroke on each segment
	segmentStrokeColor: "#fff",			//String - The colour of each segment stroke
	segmentStrokeWidth: 1,					//Number - The width of each segment stroke
	percentageInnerCutout: 40,				//The percentage of the chart that we cut out of the middle.
	animation: false,						//Boolean - Whether we should animate the chart
	animationSteps: 50,					//Number - Amount of animation steps
	animationEasing: "easeOutBounce",		//String - Animation easing effect
	animateRotate: true,					//Boolean - Whether we animate the rotation of the Doughnut
	animateScale: false,					//Boolean - Whether we animate scaling the Doughnut from the centre
	onAnimationComplete: null				//Function - Will fire on animation completion.
};

var chart1_tooltip_options = {
	labelTemplate: '<%=label%>'
};

var chart2_tooltip_options = {
	labelTemplate: '<%=label%>'
};

var chart_styles = {
	"habitacao": {
		"label": "Habitação",
		"color": "#bcbbbb"
	},
	"alimentacao": {
		"label": "Alimentação",
		"color": "#f4ac65"
	},
	"saude": {
		"label": "Saúde",
		"color": "#77c4f9"
	},
	"transporte": {
		"label": "Transporte",
		"color": "#eca4a4"
	},
	"lazer": {
		"label": "Lazer",
		"color": "#c3abc4"
	},
	"educacao": {
		"label": "Educação",
		"color": "#c9d5a0"
	}
};

var chart1_data = {};
var chart2_data = {};

function drawChart(id, data, tooltip_options) {
	var chart_ctx = document.getElementById(id).getContext("2d");
	var chart_init = new Chart(chart_ctx, tooltip_options).Doughnut(data, chart_options);
}