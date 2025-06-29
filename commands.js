import { sitemap } from "/sitemap.js";

const robots_default_url = "robots.txt";

const load = async (env, argv) => {
  if (argv.length > 2) {
    throw new Error("Too many arguments");
  }

  let robots_url = robots_default_url;
  if (argv.length > 1) {
    robots_url = argv[1];
    // Try to parse argument as URL and set hostname
    try {
      let parsed_url = new URL(robots_url);
      env.hostname = parsed_url.hostname;
    } catch { };
  }

  const warn_url_hostname_mismatch = (s) => {
    const url = new URL(s);
    if (url.hostname != env.hostname) {
      env.stderr(`Warning: Hostname for URL ${url} does not match`);
    }
    return s;
  };

  env.stdout(`Fetching ${robots_url}...`);
  const url_lists = await fetch(robots_url, {cache: "no-store"})
    .then(response => response.text())
    .then(sitemap.parse_sitemap_urls)
    .then(sitemap_urls => {
      env.stdout(`Parsed ${sitemap_urls.length} sitemap(s)`);
      const sitemap_promises = sitemap_urls
        .map(warn_url_hostname_mismatch)
        .map(sitemap_url => {
          env.stdout(`Fetching sitemap at ${sitemap_url}...`);
          return fetch(sitemap_url, {cache: "no-store"})
            .then(response => response.text())
            .then(sitemap.parse_sitemap)
        });
      return Promise.all(sitemap_promises);
    });

  const urls = url_lists.flat()
  urls
    .map(url => url.loc)
    .map(warn_url_hostname_mismatch);
  env.stdout(`Parsed ${urls.length} URL(s).`);
  env.root = sitemap.urls_to_tree(urls);
  console.log(env);
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
     \`-'       \`--'hjm

`;

const welcome = (env, argv) => {
  env.stdout(linux_ascii);
  env.stdout([
    `Welcome to ${env.hostname}!`,
    `This is an interactive sitemap viewer built with plain HTML, CSS and JS.`,
    ``,
    `View <a href="https://github.com/msoukup/terminal-sitemap-viewer">this project on GitHub</a>`,
    ``,
    `To view a list of available commands, type '<a>help</a>'`
  ].join("\n"));
};

const traverse = (root, path) => {
  if (!path.length) {
    return root
  }
  const key = path[0];
  if (root.hasOwnProperty(key)) {
    const node = root[key];
    // If the node represents a directory, recurse on the subtree.
    if (node.subtree !== undefined) {
      return traverse(node.subtree, path.slice(1));
    }
    // Otherwise this must be a leaf
    if (path.length == 1) {
      return {[key]: node};
    }
  }
  throw new Error(`cannot access '${key}': No such file or directory`);
};

// Link count is number of subdirs + 2 (one for '.' and one for '..')
const count_links = (subtree) =>
  Object.values(subtree)
    .reduce((total, obj) => total + (obj.subtree !== undefined ? 1 : 0), 2)
;

const format_time_or_year = (date) => {
  const now = new Date();
  if (now.getFullYear() > date.getFullYear()) {
    return String(date.getFullYear());
  } else {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
};

const format_node = (name, obj) => {
  const is_dir = obj.subtree !== undefined;
  const tr = document.createElement("tr");

  const tdadd = (s, class_name = "ls-stat") => {
    const td = document.createElement("td");
    td.classList.add(class_name);
    td.innerText = s;
    tr.appendChild(td);
  };

  // umask
  tdadd(is_dir ? "drwxr-xr-x" : "-rw-r--r--");
  // link_count
  tdadd(is_dir ? count_links(obj.subtree) : 1);
  // user and group
  tdadd("admin");
  tdadd("www-data");
  // size
  tdadd(obj.size);
  // date and time
  const lastmod = obj.lastmod;
  tdadd(lastmod.toLocaleString('default', { month: 'short' }));
  tdadd(lastmod.getDate());
  tdadd(format_time_or_year(lastmod));
  // name
  tdadd(name + (is_dir ? "/" : ""), "ls-name");

  return tr;
}

const ls = (env, argv) => {
  if (argv.length > 2) {
    throw new Error("Too many arguments");
  }
  const arg = argv.length > 1 ? argv[1] : "";
  const path = arg.split("/").filter(p => p);
  const subtree = traverse(env.root, arg.startsWith("/") ? path : env.wd.concat(path));
  // Sort lexicographically and format in table
  const table = document.createElement("table");
  const lines = Object.entries(subtree)
    .sort((a, b) => (a[0] < b[0]) ? -1 : 1)
    .map(([name, obj]) => format_node(name, obj))
    .map(tr => table.appendChild(tr));
  env.stdout(table.outerHTML);
};

const cd = (env, argv) => {
  if (argv.length > 2) {
    throw new Error("Too many arguments");
  }
  const arg = argv.length > 1 ? argv[1] : "/";
  switch (arg) {
    case ".":
      break;
    case "..":
      env.wd = env.wd.slice(0, -1);
      break;
    default:
      const path = arg.split("/").filter(p => p);
      const new_path = arg.startsWith("/") ? path : env.wd.concat(path);
      // TODO check that we're not at a file
      const subtree = traverse(env.root, new_path);
      env.wd = new_path;
  }
  console.log(env);
};

const show = async (env, argv) => {
  if (argv.length < 2) {
    throw new Error("Too few arguments");
  }

  const entries = argv.slice(1)
    .map(arg => {
      const path = arg.split("/").filter(p => p);
      return traverse(env.root, arg.startsWith("/") ? path : env.wd.concat(path));
    })
    .map(Object.entries)
    .flat()
    .filter(([name, obj]) => obj.hasOwnProperty("loc"))

  for (const [name, obj] of entries) {
    await fetch(obj.loc)
      .then(response => response.text())
      .then(content => {
        // If showing multiple files, prefix with filename
        if (entries.length > 1) {
          env.stdout(name + ":");
        }
        env.stdout(content);
      });
  }
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
  env.stdout([
    "  <a>help</a>                 display this message",
    "  <a>ls</a>                   list files and directories",
    "  <a>cd</a>                   change directory",
    "  <a>show [FILE]</a>          print file to terminal output",
    "  <a>load</a>                 load sitemaps from robot.txt",
    "  <a>welcome</a>              display welcome message",
    "  <a>theme [NAME]</a>         change terminal theme (monokai, synthwave, dracula, matrix, solarized)",
    "  <a>fontsize [PIXELS]</a>    change the terminal text size",
    "  <a>clear</a>                clear previous terminal output"
  ].join("\n"));
};

const clear = (env, argv) => {
  env.output.innerHTML = "";
};

export const commands = { help, ls, cd, show, load, welcome, theme, fontsize, clear };
