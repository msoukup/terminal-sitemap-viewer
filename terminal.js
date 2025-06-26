import { commands } from "/commands.js";

const user = "guest";
const hostname = window.location.hostname;
const output = document.getElementById("terminal-output");

const welcome_ascii = `<pre>
         _nnnn_
        dGGGGMMb
       @p~qp~~qMb
       M|@||@) M|             Welcome!
       @,----.JM|             This is an interactive sitemap viewer built with plain HTML, CSS, and JS
      JS^\\__/  qKL
     dZP        qKRb          View <a href="https://github.com/msoukup/terminal-sitemap-viewer">this project on GitHub</a>.
    dZP          qKKb
   fZP            SMMb
   HZM            MMMM
   FqM            MMMM
 __| ".        |\\dS"qML
 |    \`.       | \`' \\Zq
_)      \\.___.,|     .'
\\____   )MMMMMP|   .'
     \`-'       \`--'hjm        To view a list of available commands, type '<a>help</a>'
</pre>`;


const set_prompt = (elem) => {
  elem.innerText = `${user}@${hostname}$\u00A0`;
};

const print = (content) => {
  const response = document.createElement("p");
  response.classList.add("output");
  response.innerHTML = content.replace(/\n/g, "<br />");
  output.appendChild(response);
};

const exec = async (command) => {
	const prompt_line = document.createElement("p");
	prompt_line.classList.add("prompt");

	const command_text = document.createElement("span");
	command_text.classList.add("command");
	command_text.innerText = command;

  set_prompt(prompt_line);
	prompt_line.appendChild(command_text);
	output.appendChild(prompt_line);

	const args = command.split(" ");
	let command_output;
	if (args[0] in commands) {
    console.log("Running command with args: " + args);
		command_output = await commands[args[0]](args);
	} else {
    command_output = args[0] + ": command not found";
  }

  if (command_output) {
    print(command_output);
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
		exec(command_input.value);

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
print(welcome_ascii);
set_prompt(document.getElementById("prompt"));
