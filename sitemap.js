const parse_sitemap_urls = (robots_txt) =>
  robots_txt
    .split("\n")
    .map(line => line.toLowerCase())
    .filter(line => line.startsWith("sitemap:"))
    .map(line => line.substring("sitemap:".length).trim());

const transform_url_element = (e) => {
  const loc_element = e.getElementsByTagName("loc")[0];
  const loc = new URL(loc_element.textContent);
  // Store path as array along with element tags to element content
  return {
    ...{path: loc.pathname.split("/").filter(s => s)},
    ...Object.fromEntries(Array.from(e.children, c => [c.tagName, c.textContent]))
  };
};

const parse_sitemap = (xml_string) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xml_string, "text/xml");
  return Array.from(xml.getElementsByTagName("url"), transform_url_element);
};

const urls_to_tree = (urls) => {
  // Split set of urls into
  // 1. URLs with a single path fragment, representing a file
  // 2. URLs with multiple path fragments, representing a dir
  // These two types of objects are distinguished by the presence of the 'subtree' key.
  const files = urls
    .filter(url => url.path.length == 1)
    .map(url => ({
      [url.path[0]]: url
    }));
  const dir_groups = Object
    .groupBy(urls.filter(url => url.path.length > 1), url => url.path[0])
  const dirs = Object.entries(dir_groups)
    .map(([name, children]) => {
      const subtree = urls_to_tree(children.map(url => ({
        ...url,
        ...{path: url.path.slice(1)}
      })))
      return {
        [name]: {
          subtree: subtree
        }
      }
    });

  // Merge into single object, last URL takes presedence upon duplicates
  return files
    .concat(dirs)
    .reduce((acc, o) => ({...acc, ...o}), {});
};

export const sitemap = { parse_sitemap_urls, parse_sitemap, urls_to_tree };
