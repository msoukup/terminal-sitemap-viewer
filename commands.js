const get_sitemap_urls = (robots_txt) =>
  robots_txt
    .split("\n")
    .filter(line => line.startsWith("Sitemap:"))
    .map(line => line.substring("Sitemap:".length).trim());

const transform_url_element = (e) => {
  // Warn on different host?
  const locElement = e.getElementsByTagName("loc")[0];
  const loc = new URL(locElement.textContent);
  // Store path as array along with element tags to element content
  return {
    ...{path: loc.pathname.split("/").filter(s => s)},
    ...Object.fromEntries(Array.from(e.children, c => [c.tagName, c.textContent]))
  };
};

const parse_sitemap = (xml_string) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xml_string, "text/xml");
  return Array.from(xml.getElementsByTagName('url'), transform_url_element);
};

const urls_to_tree = (urls) => {
  // Split set of urls into
  // 1. URLs with a single fragment, representing a file
  // 2. URLs with multiple fragments, representing a dir
  // These two types of objects are distinguished by the presence of the 'children' key.
  const files = urls
    .filter(url => url.path.length == 1)
    .map(url => ({
      ...{name: url.path[0]},
      ...url
    }));
  const dir_groups = Object
    .groupBy(urls.filter(url => url.path.length > 1), url => url.path[0])
  const dirs = Object.entries(dir_groups)
    .map(([name, children]) => ({
      name: name,
      children: urls_to_tree(urls.map(url => ({
        ...url,
        ...{path: url.path.slice(1)}
      })))
    }));

  // Sort lexicographically
  return files
    .concat(dirs)
    .sort((a, b) => (a < b) ? -1 : 1);
};

const load = async (args) => {
  const urls = await fetch("robots.txt")
    .then(response => response.text())
    .then(get_sitemap_urls)
    .then(sitemap_urls => {
      const sitemap_promises = sitemap_urls
        .map(sitemap_url => {
          // Warn on different host?
          const url = new URL(sitemap_url);
          console.log("Fetching " + url.pathname);
          return fetch(url.pathname)
            .then(response => response.text())
            .then(parse_sitemap)
        });
      return Promise.all(sitemap_promises);
    });
  console.log(urls.flat());
  const tree = urls_to_tree(urls.flat());
  console.log(tree);
  return null;
};

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
			"  <a>load</a>                 load sitemaps from robot.txt",
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

export const commands = { load, theme, fontsize, help, clear };
