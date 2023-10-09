import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import AuMap from "../data/AuMap";

const ZOOM_THRESHOLD = 1.15; // limit to change from state view to region view

/**
 * Renders heatmap and handles interactions
 * @param {object} props component properties
 * @param {object} props.data Contains "regions" and "states data
 * @param {(string: "left" | "right", string) => null} props.setActive Sets active state
 * @param {object} props.zoomed zoom transform object
 * @param {(object) => null} props.setZoomed set the zoom transform state
 * @returns {JSX.Element} Component template
 */
const PriceCompVis = ({ data, setActive, zoomed, setZoomed}) => {
  // Set data based on current zoomed state
  let locdata, zoomedIn = zoomed[0].k >= ZOOM_THRESHOLD;
  if (zoomedIn) {
    locdata = data["regions"]
  }
  else {
    locdata = data["states"]
  }
  // Element References
  const svgRef = useRef(null);
  const svgContainer = useRef(null); // The PARENT of the SVG 
  const heatMapScaleRef = useRef(null);
  let unitsize = 2/(zoomed[0].k)*3;
  
  // Generic DOM Selections
  const heatmapScale=  d3.select(heatMapScaleRef.current);
  const colourPalette = d3.interpolateHsl("green", "red")

  function handleZoom(e) {
    d3.select(".zoom-box").attr('transform', e.transform)
    // save previous value to compare and trigger change in zoom state
    setZoomed([e.transform, zoomed[0]]);
  }

  // Runs on initial render
  useEffect(() => {
    const mapGroup = d3.select(".zoom-box")
    // draw circles for regions
    Object.keys(data["regions"]).forEach(locname => {
      const loc = data["regions"][locname]
        mapGroup
          .append("circle").attr("id", "map-"+locname)
          .attr("class", "map-marker")
          .attr("cx", loc.location[0])
          .attr("cy", loc.location[1])
          .attr("r", unitsize)
          .attr("cursor", "pointer")
    }
    )
  }, [])

  // Runs when zoomed variable updates
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    // update zoom handle in order to track previous value
    let zoom = d3.zoom()
      .scaleExtent([0.9, 30])
      .translateExtent([[0, 0], [1000, 1000]])
      .on('zoom', handleZoom);
    svg.call(zoom);
    // make prompt message visible
    svg.select(".prompt-message").raise()
    const mapGroup = svg.select(".zoom-box");
    // Make markers hidden when zoomed out
    if (zoomed[0].k <= ZOOM_THRESHOLD && zoomed[1].k > ZOOM_THRESHOLD) { 
      mapGroup.selectAll(".map-marker").attr("visibility", "hidden");
    }
    // Make markers visible when zoomed in, colour map white
    else if (zoomed[0].k >= ZOOM_THRESHOLD && zoomed[1].k < ZOOM_THRESHOLD) { // zoomed in
      mapGroup.selectAll(".map-marker").attr("visibility", "visible");
      d3.selectAll(".map-state").transition(1000)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.1)
    }
    // dynamically update size of region circles
    mapGroup.selectAll(".map-marker").attr("r", unitsize);
  }, [zoomed])

  // Runs when setActive function changes
  useEffect(() => { 
    const svg = d3.select(svgRef.current);
    
    // update state mouse events
    svg.selectAll(".map-state")
      .on("click", function(e, d) {
          const element = d3.select(this);
          flashColour("left");
          setActive("left", element.attr("id").split("-")[1]);
        })
        .on("contextmenu", function(e, d) {
          const element = d3.select(this);
          e.preventDefault();
          flashColour("right");
          setActive("right", element.attr("id").split("-")[1]);
        });
    
    // update regional markers mouse events
    svg.selectAll(".map-marker")
      .on("mouseenter", function(d) {
        const element = d3.select(this);
        const locname = element.attr("id").split("-")[1]
        element.raise();
        d3.select(`text[id='price-${locname}']`)
          .attr("visibility", "visible")
      })
      .on("mouseleave", function(d) {
        const element = d3.select(this);
        const locname = element.attr("id").split("-")[1]
        element.raise();
        d3.select(`text[id='price-${locname}']`)
          .attr("visibility", "hidden")
      })
      .on("click", function(d) {
        const element = d3.select(this);
        flashColour("left");
        setActive("left", element.attr("id").split("-")[1])
      })
      .on("contextmenu", function(e, d) {
        const element = d3.select(this);
        flashColour("right");
        e.preventDefault();
        setActive("right", element.attr("id").split("-")[1])
      })
    }, [setActive]); // on click needs to be updated everytime this function changes
  
  // Run when data changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const mapGroup = svg.select(".zoom-box")
    const promptMessage = svg.select(".prompt-message")
    const locs = Object.keys(locdata);

    // remove existing price text elements
    const prices = mapGroup.selectAll(".map-price");
    prices.remove();

    // Find not-null prices to generate heatmap colour scale
    const totalPrices = locs.filter(s => locdata[s].isLegit)
        .map(s => locdata[s].totalPrice);
    
    const priceExtent = d3.extent(totalPrices)
    const priceScale = d3.scaleLinear()
        .domain(priceExtent)
        .range([0,1])
    
    // show prompt if no items in list
    if (locdata[locs[0]].items.length === 0) {
        heatmapScale.style("display", "none")
        promptMessage.attr("visibility", "visible").raise()
    }
    // show colour scale legend if items are present
    else {
        heatmapScale.select("#heatmap-max").text(priceExtent[0]? "$"+priceExtent[0].toFixed(2) : "n/a")
        heatmapScale.select("#heatmap-min").text(priceExtent[0]? "$"+priceExtent[1].toFixed(2) : "n/a")
        heatmapScale.style("display", "block")
        promptMessage.attr("visibility", "hidden").raise()
    }
    // Colour in regions
    locs.forEach(locname => {
        const shape = d3.select(`[id='map-${locname}']`) // region element
        const loc = locdata[locname]
        if (loc.isLegit && loc.items.length > 0) {
          // has price data
          shape.attr("fill", colourPalette(priceScale(loc.totalPrice)));
        }
        else {
          shape.attr("fill", "grey"); // invalid, no price data
        }

        // add price element
        const text = mapGroup.append("text").attr("id", "price-"+locname)
          .attr("class", "map-price")
          .attr("font-size", (zoomed[0].k > ZOOM_THRESHOLD ? (unitsize/2).toFixed(2) : 1.5) +"em")
          .attr("fill", "black")
          .attr("x", loc.location[0])
          .attr("y", loc.location[1]-unitsize*3)
          .attr("text-anchor", "middle")
          .attr("cursor", "pointer")
        
        const items = loc["items"]
        const totalPrice = loc["totalPrice"]
        const isLegit = loc["isLegit"]
        
        // Generate text for price element
        text.text((totalPrice.toFixed(2) > 0 ? 
                    locname+": "+"$"+totalPrice.toFixed(2) + (isLegit? "" : "*") : // mark items with null with *
                    items.length === 0 ? "" : locname+": n/a"
        ))
            .attr("visibility", zoomedIn? "hidden" : "visible")
            .on("click", function(_) {
              const element = d3.select(this);
              flashColour("left");
              setActive("left", element.attr("id").split("-")[1])
            })
            .on("contextmenu", function(e, d) {
              const element = d3.select(this);
              flashColour("right");
              e.preventDefault();
              setActive("right", element.attr("id").split("-")[1])
            })
            .raise()
    })
  }, [locdata, zoomedIn]); // redraw chart if data changes

  return (
    <div ref={svgContainer} className="pc-vis-container" style={{height:"95%", position:"relative"}}>
      <div ref={heatMapScaleRef} className="heatmap-scale" style={{display:"none"}}>
        <div className="heatmap-label" id="heatmap-min"></div>
        <div className="heatmap-label" id="heatmap-max"></div>
      </div>
      <AuMap ref={svgRef}></AuMap>
    </div>
  );
};

/**
 * Flashes updated column title in price comparison table 
 * @param {"left" | "right"} column - to highlight 
 */
const flashColour= (column) => {
  const locationLabel = d3.select(`#${column}LocHeader`)
  locationLabel.classed("colour-flash", false)
  setTimeout(() => locationLabel.classed("colour-flash", true), 1);
}

export default PriceCompVis;