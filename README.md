# Visio SVG Publish templates and scripts
This repository contains the default built-in templates, that are used in the SvgPublish extension
http://unmanagedvisio.com/products/svg-publish/

The scripts/style files are bundled and minified at the build time as file "vp-script.min.js" and "vp-style.min.css" respectively.

First, these are  for reference.
Second, they can be easily used your own solution. There are two ways:

 Way 1. Just drop the content of the file into "immediate" script window on the diagram.
Remember to uncheck corresponding option, if you ware overwriting it with custom code.

Way 2. You can use these as samples to create your own custom template.
To do so, create a copy of the vp-template.html file, and check "use custom template" in the settings

Then you can modify the template, including/excluding your own scripts as standard `<script src=..>` and `<link href..>` elements.
