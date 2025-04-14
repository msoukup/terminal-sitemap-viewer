const welcome_ascii = `<pre>
         _nnnn_               
        dGGGGMMb              
       @p~qp~~qMb             
       M|@||@) M|             Welcome to <a>jonathanmlowery.com</a>!
       @,----.JM|             This is an interactive terminal website built with plain HTML, CSS, and JS
      JS^\\__/  qKL            
     dZP        qKRb          To view a list of available commands, type '<a>help</a>'
    dZP          qKKb         
   fZP            SMMb        Javascript | <a href="https://www.linkedin.com/in/jonathan-lowery-724a7524a/" target="_blank">LinkedIn</a> | Python Institute PCAP
   HZM            MMMM        Python     | <a href="https://github.com/jonathanmlowery" target="_blank">GitHub</a>   | Comptia A+
   FqM            MMMM        Java       | <a href="/resume.pdf" target="_blank">Resume</a>   | Comptia Network+
 __| ".        |\\dS"qML       C++        |          |
 |    \`.       | \`' \\Zq       
_)      \\.___.,|     .'       Email: <a href="mailto:contact@jonathanmlowery.com" target="_blank">contact@jonathanmlowery.com</a>
\\____   )MMMMMP|   .'        
     \`-'       \`--'hjm      
</pre>`;

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
			"Information:",
			"  <a>help</a>                 display this message",
			"  <a>welcome</a>              display welcome message",
			"  <a>certs</a>                view certifications",
			"Appearance:",
			"  <a>theme (name)</a>         change terminal theme (monokai, synthwave, dracula, matrix, solarized)",
			"  <a>fontsize (pixels)</a>    change the terminal text size",
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

const welcome = (args) => {
	return welcome_ascii;
};

const certs = (args) => {
	return (
		"<pre>" +
		["Python Institute PCAP", "Comptia A+", "Comptia Network+"].join("\n") +
		"</pre>"
	);
};

export const commands = { theme, fontsize, help, clear, welcome, certs };
