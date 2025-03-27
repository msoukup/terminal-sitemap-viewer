import { commands } from "/commands.js";

const exec_command = (command) => {
	const output = document.getElementById("terminal-output");

	const prompt_line = document.createElement("p");
	prompt_line.classList.add("prompt");

	const command_text = document.createElement("span");
	command_text.classList.add("command");
	command_text.innerText = command;

	prompt_line.innerText = "user@terminal-website$\u00A0";
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
		response.textContent = command_output.replace(/ /g, "\u00A0");

		output.appendChild(response);
	}
};

const command_input = document.getElementById("command-input");
const command_text = document.getElementById("command-text");

document.addEventListener("click", () => command_input.focus());

command_input.addEventListener("input", () => {
	const safeText = command_input.value.replace(/ /g, "\u00A0");
	command_text.innerHTML = safeText;
});

command_input.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		exec_command(command_input.value);
		command_input.value = "";
		command_text.innerHTML = "";
	}
});

commands.theme(["theme", "dracula"], {});
