---
title: about
layout: page
permalink: /about
---

`snippet-diary` is a based on [jekyll-theme-console](https://github.com/b2a3e8/jekyll-theme-console) with a few changes:

- Catpucchin theme defaults for light and dark mode
- User's preferred style (light/dark) is used by default
- Posts arranged by tags in archive
- Add new post using `gistid` option 

This is an example of how you can add a page. New pages can be created in the `_pages` directory with the following frontmatter:

```markdown
---
title: about
layout: page
permalink: /about
---
```

Then, you can modify `navigation.html` in `_includes` to include this new page in the header:

```html
<li><a href="{{ site.baseurl }}/about">about</a></li>
```