import React from 'react';
import './Home.css'
import RAWDATA from '../data/historical_data.json';

const items = RAWDATA.datamap.category;
const changeData = items.map((c, i) => {
  const itemData = RAWDATA.data[0][i];
  const change = itemData[100] - itemData[90];
  return (change/itemData[90]*100).toFixed(1);
});

function Home() {
    return (
      <>
        <div className='page-body p-5'>
          {/* <svg xmlns='http://www.w3.org/2000/svg' width='90%' height='90%' className='trend-arrow' viewBox='0 0 900 600' x='0' y='0'>
            <path className='arrow' d='M450,590 L890,300'/>
          </svg> */}
          <div className='introduction'>
            <h1>Research grocery prices before you break the bank.</h1> <br></br>
            <h3>With the rising cost of living, this website is here for you to track inflation, 
              particularly in food stores. Find out which items are inflating your bills and 
              how to save money by shopping elsewhere or looking at alternatives.</h3>
              
          </div>
          <div id="scroll-container">
            <div id="scroll-text">{items.map((item, i) => <><span style={{color:changeData[i] > 0 ? "red" : "green"}}>{item}: {changeData[i] > 0 ? "▲" : "▼"} {changeData[i]}%</span>        |          </>)}</div>
          </div>
          <div id="scroll-desc">Visualised: Price change of groceries in Sydney from 2008 to 2010</div>
        </div>
      </>
    );
  }
  
  export default Home;
  