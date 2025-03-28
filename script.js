import { commands } from "/commands.js";

const output = document.getElementById("terminal-output");

const exec_command = (command) => {
	const prompt_line = document.createElement("p");
	prompt_line.classList.add("prompt");

	const command_text = document.createElement("span");
	command_text.classList.add("command");
	command_text.innerText = command;

	prompt_line.innerText = "user@jonathanmlowery.com$\u00A0";
	prompt_line.appendChild(command_text);
	output.appendChild(prompt_line);

	const args = command.split(" ");

	const response = document.createElement("p");
	let command_output;

	if (args[0] in commands) {
		command_output = commands[args[0]](args);
	}

	console.log(command_output);

	if (command_output) {
		response.classList.add("output");
		response.innerHTML = command_output.replace(/\n/g, "<br />");

		output.appendChild(response);
	}

	// scrolls to bottom after command is run
	document.getElementById("command-input").scrollIntoView({ block: "end" });
};

const command_input = document.getElementById("command-input");
const command_text = document.getElementById("command-text");

document.addEventListener("click", () => command_input.focus());

command_input.addEventListener("input", () => {
	const safeText = command_input.value.replace(/ /g, "\u00A0");
	command_text.innerHTML = safeText;
});

let command_history = [];
let command_index = 1;

command_input.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		exec_command(command_input.value);

		if (command_input.value) {
			command_history.push(command_input.value);
			command_index = command_history.length;
		}

		command_input.value = "";
		command_text.innerHTML = "";
	} else if (e.ctrlKey && e.key.toLowerCase() === "l") {
		e.preventDefault();
		commands.clear("clear");
	} else if (e.key === "ArrowUp") {
		command_index = Math.max(0, command_index - 1);

		if (command_history[command_index]) {
			command_input.value = command_history[command_index];
			command_text.innerHTML = command_history[command_index];
		}

		requestAnimationFrame(() => {
			command_input.setSelectionRange(
				command_input.value.length,
				command_input.value.length
			);
		});

		console.log(command_history);
		console.log(command_index);
	} else if (e.key === "ArrowDown") {
		command_index = Math.min(command_history.length, command_index + 1);

		if (command_history[command_index]) {
			command_input.value = command_history[command_index];
			command_text.innerHTML = command_history[command_index];
		} else {
			command_input.value = "";
			command_text.innerHTML = "";
		}

		requestAnimationFrame(() => {
			command_input.setSelectionRange(
				command_input.value.length,
				command_input.value.length
			);
		});

		console.log(command_history);
		console.log(command_index);
	}
});

commands.theme(["theme", "monokai"]);

const response = document.createElement("p");
let command_output;
command_output = commands.welcome(["welcome"]);

if (command_output) {
	response.classList.add("output");
	response.innerHTML = command_output.replace(/\n/g, "<br />");

	output.appendChild(response);
}
