const welcome_ascii = `<pre>
         _nnnn_               
        dGGGGMMb              
       @p~qp~~qMb             
       M|@||@) M|             Welcome to jonathanmlowery.com!
       @,----.JM|             This is an interactive terminal website built with plain HTML, CSS, and JS
      JS^\\__/  qKL            
     dZP        qKRb          To view a list of available commands, type 'help'
    dZP          qKKb         
   fZP            SMMb        LinkedIn
   HZM            MMMM        GitHub
   FqM            MMMM        Resume
 __| ".        |\\dS"qML      
 |    \`.       | \`' \\Zq       contact@jonathanmlowery.com
_)      \\.___.,|     .'      
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
			"Informational Commands:",
			"  help                 display this message",
			"  welcome              display welcome message",
			"Appearance:",
			"  theme (name)         change terminal theme (monokai, synthwave, dracula, matrix, solarized)",
			"  fontsize (pixels)    change the terminal text size",
			"  clear                clear previous terminal output",
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

export const commands = { theme, fontsize, help, clear, welcome };
