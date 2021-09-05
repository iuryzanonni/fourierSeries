let time = 0;
let wave = [];
let isChangeColorsEnabled = false;

const sliderMaxValue = 100;
const sliderDefaultValue = 1;

let timeInc = 0.05;
let timeIncMaxValue = 10;

const canvasWidth = window.innerWidth;
const canvasHeight = 500;

let slider;
let sliderSpeed;
let sliderTextbox;
let functionSelector;

let currentPreset;

const preset = {
	sawtooth: {
		n: (i) => {
			return pow(-1, i) * i;
		},
		min: 1,
		functionFourrier: (nCircle) => {
			return 300 * (-1 / (nCircle * PI));
		},
	},
	square: {
		n: (i) => {
			return i * 2 + 1;
		},
		min: 0,
		functionFourrier: (nCircle) => {
			return 75 * (4 / (nCircle * PI));
		},
	},
	triangle: {
		n: (i) => {
			return i * 2 + 1;
		},
		min: 0,
		functionFourrier: (nCircle) => {
			let exp = (nCircle - 1) / 2;
			return 75 * (((8 / pow(PI, 2)) * pow(-1, exp)) / pow(nCircle, 2));
		},
	},
	colors: [
		[214, 172, 50],
		[10, 157, 10],
		[15, 15, 255],
		[200, 0, 0],
	],
};

function randomRGB() {
	const randomBetween = (min, max) =>
		min + Math.floor(Math.random() * (max - min + 1));
	const r = randomBetween(0, 255);
	const g = randomBetween(0, 255);
	const b = randomBetween(0, 255);
	return [r, g, b];
}

function generateColors() {
	while (preset.colors.length < sliderMaxValue)
		preset.colors.push(randomRGB());
}

function createUI() {
	createSelectorElement();
	createSliderElement();
	createTimeIncElement();

}

function createSliderElement() {
	let sliderContainer = createDiv("Iteração: ");

	slider = createSlider(1, sliderMaxValue, sliderDefaultValue);
	slider.input(
		(updateTextbox = () => {
			sliderTextbox.value(slider.value());
		})
	);
	sliderTextbox = createInput("");
	sliderTextbox.size(50);
	sliderTextbox.value(slider.value());
	sliderTextbox.input(
		(updateSlider = () => {
			if (sliderTextbox.value() > sliderMaxValue) {
				sliderTextbox.value(sliderMaxValue);
			}
			slider.value(sliderTextbox.value());
		})
	);
	sliderTextbox.parent(sliderContainer);
	slider.parent(sliderContainer);

}

function createSelectorElement() {
	let selectorContainer = createDiv("Função: ");

	functionSelector = createSelect();
	functionSelector.option("square");
	functionSelector.option("sawtooth");
	functionSelector.option("triangle");
	currentPreset = functionSelector.value();

	functionSelector.changed((e) => {
		currentPreset = functionSelector.value();
	});

	functionSelector.parent(selectorContainer);
}

function createTimeIncElement() {
	let timeContainer = createDiv("Frequência: ");

	timeIncSlider = createSlider(1, timeIncMaxValue, timeInc * 100);
	timeIncSlider.input(
		(updateTimeInc = () => {
			timeInc = timeIncSlider.value() / 100;
			timeIncTextbox.value(timeInc);
		})
	);

	timeIncTextbox = createInput("");
	timeIncTextbox.attribute("readonly",true);
	timeIncTextbox.size(50);
	timeIncTextbox.style("border:none");
	timeIncTextbox.value(timeIncSlider.value()/100);
	timeIncTextbox.input(
		(updateSlider = () => {
			if (timeIncTextbox.value() > timeIncMaxValue) {
				timeIncTextbox.value(timeIncMaxValue/100);
			}
			timeIncSlider.value(timeIncTextbox.value()*100);
		})
	);
	timeIncTextbox.parent(timeContainer);
	timeIncSlider.parent(timeContainer);
	// timeIncTextbox.value(slider.value());


}

function changeColors(min, max, value) {
	if (isChangeColorsEnabled) {
		let newValue = map(value, min, max, 0, 255);
		colorMode(HSB);
		stroke(newValue, 80, 50);
	}
}

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	createUI();
	generateColors();
	strokeWeight(1.5);
}

function draw() {
	colorMode(RGB);
	clear();
	background(0, 15);
	// background("#282a36");
	translate(200, 200); //old 150,200

	let x = 0;
	let y = 0;

	for (
		let i = preset[currentPreset].min;
		i < slider.value() + preset[currentPreset].min;
		i++
	) {
		let prevx = x;
		let prevy = y;

		// let nCircle = i * 2 + 1;
		let n = preset[currentPreset].n(i);
		let radius = preset[currentPreset].functionFourrier(n);
		x += radius * cos(n * time);
		y += radius * sin(n * time);

		let color;

		color = preset.colors[i - preset[currentPreset].min];

		stroke(color);
		noFill();
		ellipse(prevx, prevy, radius * 2);

		stroke(color);
		line(prevx, prevy, x, y);
	}
	wave.unshift(y);

	let maxValue = max(wave);
	let minValue = min(wave);

	translate(200, 0);
	line(x - 200, y, 0, wave[0]);
	beginShape();
	noFill();

	for (let i = 0; i < wave.length; i++) {
		changeColors(minValue, maxValue, wave[i]);
		vertex(i, wave[i]);
	}
	endShape();

	time += timeInc;

	if (wave.length > canvasWidth) {
		wave.pop();
	}
}
