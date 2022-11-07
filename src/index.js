import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

function setup() {
    const spaceX = new SpaceX();
    setupLaunchpads();
    spaceX.launches().then(data => {
        const listContainer = document.getElementById("listContainer")
        RenderLaunches(data, listContainer);
        drawMap();
        drawPads(pads, "red");
    })
}

function RenderLaunches(launches, container) {
    const list = document.createElement("ul");

    launches.forEach(launch => {
        const item = document.createElement("li");

        item.onmouseover = function () {
            item.style.color = "green";
            drawPads(padFromID.get(launch.launchpad), "green")
        };

        item.onmouseout = function () {
            item.style.color = "#000"
            drawPads(pads, "red")
        };

        item.innerHTML = launch.name;
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

const padFromID = new Map();
const pads = [];

function setupLaunchpads() {
    const spaceX = new SpaceX();
    spaceX.launchpads().then(data => {
        data.forEach(d => {
            padFromID.set(d.id, [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        d.longitude,
                        d.latitude

                    ]
                }
            }])
            pads.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        d.longitude,
                        d.latitude

                    ]
                }
            })
        })
    });
}

function drawMap() {
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width / 2 - margin.left, height / 2]);
    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("opacity", .7)
}

function drawPads(data, color) {
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width / 2 - margin.left, height / 2]);

    const svg = d3.select('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("padFromID")
        .data(data)
        .enter()
        .append('path')
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("stroke-width", 0.1)
        .attr("fill", color)
}
