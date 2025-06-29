import { commands } from "/commands.js";

const output = document.getElementById("terminal-output");
const print = (content, error = false) => {
    const response = document.createElement("p");
    response.classList.add(error ? "error" : "output");
    const lines = `<pre>${content}</pre>`.split();
    response.innerHTML = lines.join("<br />");
    output.appendChild(response);
};

// Env object is passed to all commands and mutated in place.
const env = {
  user: "guest",
  hostname: window.location.hostname,
  doc: document.documentElement,
  output: output,
  stdout: (content) => print(content),
  stderr: (content) => print(content, true),
  wd: [],
  root: []
};

const set_prompt = (elem) => {
  let path = ":/" + env.wd.join("/");
  elem.innerText = `${env.user}@${env.hostname}${path}$\u00A0`;
};

const print_prompt = (command) => {
	const prompt_line = document.createElement("p");
	prompt_line.classList.add("prompt");
	const command_text = document.createElement("span");
	command_text.classList.add("command");
	command_text.innerText = command;
  set_prompt(prompt_line);
	prompt_line.appendChild(command_text);
	output.appendChild(prompt_line);
};

const exec = async (command) => {
  print_prompt(command);

	const argv = command.split(" ").map(s => s);
	if (argv[0] in commands) {
    console.log("Running command with argv: " + argv);
    try {
		  await commands[argv[0]](env, argv);
    } catch(e) {
      env.stderr(argv[0] + ": " + e.message);
    }
	} else {
    env.stderr(argv[0] + ": command not found");
  }

  set_prompt(document.getElementById("prompt"));
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
		exec(command_input.value);

		if (command_input.value) {
			command_history.push(command_input.value);
			command_index = command_history.length;
		}

		command_input.value = "";
		command_text.innerHTML = "";
	} else if (e.ctrlKey && e.key.toLowerCase() === "l") {
		e.preventDefault();
		commands.clear(env, "clear");
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
				command_input.value.length, command_input.value.length
			);
		});

		console.log(command_history);
		console.log(command_index);
	}
});

// Init
commands.theme(env, ["theme", "monokai"]);
await commands.load(env, ["load"]);
commands.welcome(env, ["welcome"]);
set_prompt(document.getElementById("prompt"));

// TODO replay commands from URL

