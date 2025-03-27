const theme = (args, response) => {
	document.documentElement.className = `theme-${args[1]}`;

	return null;
};

const fontsize = (args, response) => {
	document.documentElement.style.setProperty(
		"--terminal-font-size",
		`${args[1]}px`
	);

	return null;
};

const help = (args) => {
	return [
		"List of commands:",
		"help              -> displays this message",
		"theme (name)      -> changes terminal theme",
		"fontsize (pixels) -> changes the terminal text size",
	].join("\n");
};

export const commands = { theme, fontsize, help };
