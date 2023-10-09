import React from "react";
import { useState } from "react";

const helpStates = {
    "price-comp": [
        // element refers to element ID to highlight, description is text to display to user
        {element : "price-comp-page", description: "This tool allows you to compare grocery prices from different locations. The price data is from Coles Supermarkets in September 2022."},
        {element : "search-bar", description: "Search for a grocery item, try 'milk'. Make sure your spelling is good!"},
        {element : "left-col", description: "Select items to add to your comparison list."},
        {element : "svg-map", description: "Observe price data for your selected items."},
        {element : "map-QLD", description: "Left click an area to place view price details."},
        {element : "leftLocHeader", description: "Observe price data for your selected items."},
        {element : "rightLocHeader", description: "Right click to view data in the neighbouring column."},
        {element : "svg-map", description: "Try zooming in to view smaller regions."},
        {element : "price-comp-page", description: "You can select these regions as well to see more data."}
    ],
    "trend": [
        // element refers to element ID to highlight, description is text to display to user
        {element : "trend-page", description: "This visualisation shows the price of a selected item over time."},
        {element : "trend-selector", description: "Select a grocery item to view its price data."},
        {element : "city-selector", description: "Select multiple cities at the same time to compare between different locations."},
        {element : "switchModel", description: "View prices adjusted for inflation via this switch."},
        {element : "trend-chart", description: "Hover over the graph to view specific price data."},
        {element : "trend-page", description: "Enjoy viewing these interesting trends!"},
        {element : "trend-page", description: "The data is sourced from Australian Bureau of Statistics: AVERAGE RETAIL PRICES OF SELECTED ITEMS IN EIGHT CAPITAL CITIES (1982-2011)."}
    ]
}

/**
 * Overlay that takes up the full view port and provides user with step-through tutorial
 * @param {"trend"|"price-comp"} page active page to display help
 * @param {(number | null) => null} setHelp Set help state for entire application
 */
const Help = ({page, setHelp}) => {
    // state
    const [step, setStep] = useState(0);
    const steps = helpStates[page]

    // actions
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const exitHelp = () => {
        setStep(0);
        setHelp(null);
     } // remove help page
    
    if (page) {
        // element to be highlighted
        const e =  document.getElementById(steps[step].element);
        if (e) {
            const elementBounds = e.getBoundingClientRect(e);
            // draw clip-path around selected element and display text
            return (
                <div className="help-page" style={{clipPath: `polygon(
                        0px 0px, 100% 0px, 100% 100%, 0px 100%,
                        0px 0px, 
                        ${elementBounds.left}px ${elementBounds.top}px,
                        ${elementBounds.left}px ${elementBounds.bottom}px,
                        ${elementBounds.right}px ${elementBounds.bottom}px,
                        ${elementBounds.right}px ${elementBounds.top}px,
                        ${elementBounds.left}px ${elementBounds.top}px
                    )`}}>
                    <div className="help-page-text">
                    {steps[step].description}<br/>{(step+1) + "/" + steps.length}
                    </div>
                    {step > 0 ? <i className="arrow left" onClick={prevStep}></i> : ""}
                    {step < steps.length -1 ? <i className="arrow right" onClick={nextStep}></i> : ""}
                    <button className="exit-help" onClick={exitHelp}>Exit tutorial</button>
                </div>
            )
        }
    }
    
}

export default Help;