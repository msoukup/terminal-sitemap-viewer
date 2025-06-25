const theme = (args) => {
	document.documentElement.className = `theme-${args[1]}`;

	return null;
};

const fontsize = (args) => {
	document.documentElement.style.setProperty(
		"--terminal-font-size",
		`${args[1]}px`
	);

	return null;
};

const help = (args) => {
	return (
		"<pre>" +
		[
			"  <a>help</a>                 display this message",
			"  <a>theme [NAME]</a>         change terminal theme (monokai, synthwave, dracula, matrix, solarized)",
			"  <a>fontsize [PIXELS]</a>    change the terminal text size",
			"  <a>clear</a>                clear previous terminal output",
			"",
		].join("\n") +
		"</pre>"
	);
};

const clear = (args) => {
	document.getElementById("terminal-output").innerHTML = "";

	return null;
};

export const commands = { theme, fontsize, help, clear };
