# snippet-diary

`snippet-diary` is a Jekyll blog theme based on [jekyll-theme-console](https://github.com/b2a3e8/jekyll-theme-console) with a few changes:

- Catpucchin theme defaults for light and dark mode
- User's preferred style (light/dark) is used by default
- Posts arranged by tags in archive
- Add new post using `gistid` option

## Usage

### _config.yaml

In addition to jekyll's default configuration options, you can provide:
- `header_pages` to specify which pages should be displayed in navbar
- `style_light` and `style_dark` to specify which predefined style (colors) should be used for light and dar modes

```yaml
header_pages:
  - index.md
  - about.md

auto_dark_mode: true # true (default) or false

style_light: "" # off (default), available option: latte, frappe, macchiato, mocha
style_dark: "" # off (default), available option: latte, frappe, macchiato, mocha
```

### front matter variables

Besides the predefined [front matter](https://jekyllrb.com/docs/front-matter/) variables from jekyll this theme also supports following variables:
- `title` to set a title for the page
- `lang` to specify the language, defaults to 'en'
- `robots` to control the robot meta tag ([details](http://longqian.me/2017/02/12/jekyll-robots-configuration/)) - this may be useful for example to set `NOINDEX` to tag pages

## Customization

If you want to customize this theme, follow this steps:
1. Fork this repository (you can use the fork as your own theme or directly as your website)
2. Create or modify files in `_layouts` directory for html-based changes
3. Create or modify files in `_sass` and `assets` for css-based changes
   - You can change things which are used in light and dark theme (like font-size) in `_sass/base.scss`. You'll find style variables at the top.
   - Style-specific definitions are in `_sass/_dark.scss` respectively in `_sass/_light.scss`. You can change things like background-color there.


## Development

To set up your environment to develop this theme, run `bundle install`.

Your theme is setup just like a normal Jekyll site! To test your theme, run `bundle exec jekyll serve` and open your browser at `http://localhost:4000`. This starts a Jekyll server using your theme. Add pages, documents, data, etc. like normal to test your theme's contents. As you make modifications to your theme and to your content, your site will regenerate and you should see the changes in the browser after a refresh, just like normal.

When your theme is released, only the files in `_layouts`, `_includes`, `_sass` and `assets` tracked with Git will be bundled.

## License

The theme is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
