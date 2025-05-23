import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { select, zoom } from "d3";
import wordwrap from "wordwrapjs";

const ids = new Set();
const xhref = {};
const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
function rn() {
  let id;
  const one = chars[Math.floor(Math.random() * 26)];
  const rest = () => chars[Math.floor(Math.random() * 36)];
  do id = one + rest() + rest(); while (ids.has(id));
  ids.add(id);
  return id;
}
async function gsdot_svg(dot_lines, dot_head, kind, path_text, levs) {
  const path = path_text.includes(".") ? path_text.split(".") : [path_text];
  const meta_path = path_text == "Top" ? "Top" : path.slice(0, -1).join(".");
  const narrative = levs[meta_path]?.aspects?.[path.slice(-1)[0]]?.narrative ||
    "";
  const note = levs[meta_path]?.aspects?.[path.slice(-1)[0]]?.note || "";
  const head = `digraph {
    esep=".20" 
    overlap=false 
    splines=true 
    charset="utf-8"
    graph [fontname="Arial" pad=".12"] 
    edge [arrowsize=".7" arrowtail="vee" arrowhead="vee" color="#bbbbbb" fontname="Arial"]
    node [penwidth="2" margin=".1,0" fontname="Arial"]\n`;
  const key = {
    item: `${head}
    "agent" [id="${rn()}" color="#009988" shape="rectangle" class="agents" label="agent" ]
    "process" [id="${rn()}" xhref="https://example.com" color="#33bbee"  shape="rectangle" style="rounded" 
    class="processes zoomable noteattached has_subclass" label="0.1
process "]
"agent" -> "process"\n}`,
    process:
      `${head}"process" [id="${rn()}" xhref="https://example.com" color="#33bbee"  shape="rectangle" style="rounded" 
    class="processes zoomnotable notenotattached" label="0.1
:: processes "]\n}`,
    datastore:
      `${head}"datastore" [id="${rn()}" color="#cc3311" shape="record" class="datastores" label="<f0> R2|<f1> :: datastores "]}`,
    transform:
      `${head}"transform" [id="${rn()}" color="#33bbee"  shape="rectangle" style="rounded" 
      class="transforms zoomnotable notenotattached" label="0.2
:: transforms "]\n}`,
    agent:
      `${head}"agents" [id="${rn()}" color="#009988" shape="rectangle" class="agents" label=":: agents" ]\n}`,
    location:
      `${head}"locations" [color="#cc3311" shape="record" class="locations" label="<f0> R1|<f1> :: locations "]\n}`,
  };
  for (
    const d of dot_lines.join("\n").matchAll(
      /id="(.*?)" xhref="(.*?)"/gsm,
    )
  ) {
    xhref[d[1]] = d[2];
  }
  const dot = dot_head == "default"
    ? `${head}
    ${dot_lines.join("\n")}\n}`
    : `${dot_head}\n ${dot_lines.join("\n")}\n}`;
  const graphviz = await Graphviz.load();
  const kind_html = kind == "key"
    ? `<table>
<tr><td>${
      graphviz.neato(key.process)
    }</td><td>Modifies data form and location</td>
<tr><td>${
      graphviz.neato(key.transform)
    }</td><td>Modifies material form and location</td>
<tr><td>${
      graphviz.neato(key.agent)
    }</td><td>Source or sink of data or operational control</td>
<tr><td>${graphviz.neato(key.location)}</td><td>Materials at rest</td>
<tr><td>${
      graphviz.neato(key.datastore)
    }</td><td></div><div class="key_txt">Data at rest</td>
<tr><td>${
      graphviz.neato(key.item)
    }</td><td>:: forward (|| back both)- Orange :: note || :: narrative - Magenta can zoom - Blue :: subclass_of</td>
<tr><td></td><td>Redraw graph when entering Graph Stack Format text</td>
<tr><td>  \` (backtick)</td><td>Redraw graph when entering Graph Stack Format text</td>
<tr><td>🌐</td><td>WWW URI</td>
<tr><td>📥️</td><td>Import Graph Stack Text</td>
<tr><td>📤️</td><td>Export Graph Stack Text</td>
<tr><td>💾</td><td>Save Key as HTML or Map as SVG</td>
</table>`
    : graphviz.neato(dot);
  const kind_html_split = kind_html.split('id="graph0"');
  let html = "";
  for (let i = 0; i < kind_html_split.length - 1; i++) {
    html += `${kind_html_split[i]}id="${rn()}"`;
  }
  html += kind_html_split.slice(-1);
  const map_div = document.getElementById(kind);
  map_div.innerHTML = html;
  let gr;
  const zm = zoom()
    .on("zoom", zoomed);
  if (kind == "map") {
    gr = select(`#${kind} svg`);
    select(`#${kind}`).call(zm);
  } else gr = select(`#${kind}`);
  function zoomed(e) {
    gr.attr("transform", e.transform);
  }
  gr.selectAll(".node")
    .each(function () {
      const node = select(this);
      const bbox = node.node().getBBox();
      if (xhref[node.attr("id")]) {
        node.append("a")
          .attr("xlink:href", xhref[node.attr("id")])
          .attr("xlink:title", xhref[node.attr("id")])
          .append("text")
          .style("font-size", "14px")
          .attr("x", bbox.x - 8)
          .attr("y", bbox.y + bbox.height + 4)
          .text("🌐");
      }
      if (node.attr("class").includes("datastores")) {
        const pl = node.selectAll("polyline");
        pl.attr("stroke-dasharray", "3,3");
      }
      if (
        node.attr("class").includes("transform") ||
        node.attr("class").includes("process")
      ) {
        const bar = node.attr("class").includes("transform") ? "3,0" : "3,3";
        node.append("line")
          .attr("x1", bbox.x)
          .attr("y1", bbox.y + 17)
          .attr("x2", bbox.x + bbox.width)
          .attr("y2", bbox.y + 17)
          .attr("stroke-dasharray", bar)
          .attr("stroke", "#33bbee")
          .attr("stroke-width", "2px");
        if (node.attr("class").includes("zoomable")) {
          node.append("circle")
            .attr("cx", bbox.x + 1)
            .attr("cy", bbox.y + 1)
            .attr("r", "3")
            .attr("stroke", "#ee3377")
            .attr("fill", "#ee3377");
        }
        if (node.attr("class").includes("noteattached")) {
          node.append("circle")
            .attr("cx", bbox.x + bbox.width - 1)
            .attr("cy", bbox.y + 1)
            .attr("r", "3")
            .attr("stroke", "#ee7733")
            .attr("fill", "#ee7733");
        }
        if (node.attr("class").includes("has_subclass")) {
          node.append("circle")
            .attr("cx", bbox.x + bbox.width - 1)
            .attr("cy", bbox.y + bbox.height - 1)
            .attr("r", "3")
            .attr("stroke", "#0077bb")
            .attr("fill", "#0077bb");
        }
      }
    });
  if (kind == "map") {
    const font_pix = 14;
    const fig = gr.node().getBBox();
    const extra_left = (path.toSorted(function (a, b) {
      return b.length - a.length;
    })[0].length + path.length * 2) * font_pix * .6;
    path.reverse();
    const bottom_lines = wordwrap.wrap(narrative, {
      width: (fig.width + extra_left) / font_pix * 2.2,
    }).split("\n");
    const extra_bottom = bottom_lines.length * font_pix * 1.3 + font_pix * 1.3 +
      50;
    const x_loc = -extra_left + fig.width / 3;
    gr.attr("height", fig.height + extra_bottom + font_pix * 3 * 1.3)
      .attr("width", fig.width + extra_left)
      .attr("viewBox", [
        -extra_left,
        -font_pix * 3 * 1.3,
        fig.width + extra_left,
        fig.height + extra_bottom + font_pix * 3 * 1.3,
      ]);
    gr.append("g");
    const last_g = select(gr.selectAll("g").nodes().reverse()[0]);
    last_g
      .append("text")
      .text(levs[path_text].level.slice(-1)[0])
      .attr("x", x_loc)
      .attr("y", -font_pix * 2 * 1.3)
      .attr("dy", `${font_pix / 7}px`)
      .attr("font-weight", "900")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .attr("font-size", `${font_pix}px`);
    if (note != "") {
      last_g
        .append("text")
        .text(`note: ${note}`)
        .attr("x", -1 * extra_left + 3)
        .attr("y", -font_pix * 1.3)
        .attr("dy", `${font_pix / 7}px`)
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("font-size", `${font_pix}px`);
    }
    for (const i in bottom_lines) {
      last_g
        .append("text")
        .text(bottom_lines[i])
        .attr("x", -1 * extra_left + 3)
        .attr("y", font_pix * i * 1.3 + 4 * font_pix * 1.3 + fig.height)
        .attr("dy", `${font_pix / 7}px`)
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("font-size", `${font_pix}px`);
    }
    for (const i in path.reverse()) {
      last_g
        .append("a")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", `${font_pix}px`)
        .attr("xlink:href", `#${path.slice(0, parseInt(i) + 1).join(".")}`)
        .attr("xlink:title", path[i])
        .append("text")
        .text(`${" ⇥ ".repeat(i)}${path[i]}`)
        .attr("x", -1 * extra_left + 3)
        .attr("y", i * font_pix * 1.3 + font_pix * 1.3);
    }
  }
  return gr.node().outerHTML;
}
export { gsdot_svg };
