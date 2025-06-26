import { sitemap } from "/sitemap.js";

const load = async (env, argv) => {
  const robots_url = argv.length > 1 ? argv[1] : "robots.txt";
  env.print(`Fetching ${robots_url}...`);
  // TODO Catch and env.print(..., error = true)
  const urls = await fetch(robots_url)
    .then(response => response.text())
    .then(sitemap.get_sitemap_urls)
    .then(sitemap_urls => {
      env.print(`Parsed ${sitemap_urls.length} sitemap(s)`);
      const sitemap_promises = sitemap_urls
        .map(sitemap_url => {
          // Warn on different host?
          const url = new URL(sitemap_url);
          env.print(`Fetching sitemap at ${url.pathname}...`);
          return fetch(url.pathname)
            .then(response => response.text())
            .then(sitemap.parse_sitemap)
        });
      return Promise.all(sitemap_promises);
    });
  const urls_flat = urls.flat();
  env.print(`Parsed ${urls_flat.length} URL(s).`);
  env.files = sitemap.urls_to_tree(urls_flat);
  console.log(env.files);
};

const linux_ascii = `
         _nnnn_
        dGGGGMMb
       @p~qp~~qMb
       M|@||@) M|
       @,----.JM|
      JS^\\__/  qKL
     dZP        qKRb
    dZP          qKKb
   fZP            SMMb
   HZM            MMMM
   FqM            MMMM
 __| ".        |\\dS"qML
 |    \`.       | \`' \\Zq
_)      \\.___.,|     .'
\\____   )MMMMMP|   .'
     \`-'       \`--'hjm`;

const welcome = (env, argv) => {
  env.print(linux_ascii);
  env.print([
    `Welcome to ${env.hostname}!`,
    `This is an interactive sitemap viewer built with plain HTML, CSS and JS.`,
    ``,
    `View <a href="https://github.com/msoukup/terminal-sitemap-viewer">this project on GitHub</a>`,
    ``,
    ``,
    `To view a list of available commands, type '<a>help</a>'`
  ].join("\n"));
};


const theme = (env, argv) => {
	env.doc.className = `theme-${argv[1]}`;
};

const fontsize = (env, argv) => {
	env.doc.style.setProperty(
		"--terminal-font-size",
		`${argv[1]}px`
	);
};

const help = (env, argv) => {
  env.print([
    "  <a>load</a>                 load sitemaps from robot.txt",
    "  <a>welcome</a>              display welcome message",
    "  <a>help</a>                 display this message",
    "  <a>theme [NAME]</a>         change terminal theme (monokai, synthwave, dracula, matrix, solarized)",
    "  <a>fontsize [PIXELS]</a>    change the terminal text size",
    "  <a>clear</a>                clear previous terminal output",
    "",
  ].join("\n"));
};

const clear = (env, argv) => {
  env.output.innerHTML = "";
};

export const commands = { load, welcome, theme, fontsize, help, clear };
