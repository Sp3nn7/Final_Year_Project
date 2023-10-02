import { Container, Row, Col } from "react-bootstrap";

import RAWDATA from '../data/historical_data.json';
import LineChart from "../components/LineChart";
import { timeParse } from "d3";
import TrendSelector from "../components/TrendSelector";
import CitySelector from "../components/CitySelector";


const colourScheme = [
    "#1b8366",
    "#588ec6",
    "#9a20a3",
    "#ca5a96",
    "#ad2929",
    "#d48306",
    "#d0cd2d",
    "#78cd13"
]

const dm = RAWDATA.datamap;
const cities = dm.city.map((c, i) => ({name:c, active:false, colour: colourScheme[i]}));
cities[0].active = true;

const defTrendState = {
    item:dm.category[7], 
    city:cities, 
    unit:dm.unit[7], 
    inflation:false
}

const processData = (data) => {
    const parser = timeParse("%Y-%m-%d")
    data.datamap.dateStamp = data.datamap.date.map(parser)
}

processData(RAWDATA);

const getData = (data, {item, city, inflation}) => {
    /* gets simple time series for given input */
    const catInd = dm["category"].indexOf(item);
    const chartData = {
        "x": dm.dateStamp.slice(0,113), // force all series to have same length
        "inflation": inflation
    }

    city.forEach((c, i) => {
        if(c.active) {
            chartData[c.name] = inflation? 
                                    data.data[i][catInd].map((d, i)=>d? data.datamap.inflation[i]*d: null) :
                                    data.data[i][catInd]
            chartData[c.name] = chartData[c.name].slice(0,113);// force all series to have same length
        }
        
    })

    return chartData
}


function Trend({active, setActive}) {
    // console.log(RAWDATA)

    const updateItem = (nextActive) => {
        setActive({...active, item: dm.category[nextActive], unit:dm.unit[nextActive]});
    }

    const toggleCity = (targetInd) => {
        if (active.city.filter(c => c.active).length === 1 && active.city[targetInd].active) {
            return null // do not allow 0 cities selected
        }
        setActive({...active, 
            city: active.city.map(
                (c, i) => 
                    ({  
                        ...c,  
                        active: i === targetInd? !c.active : c.active 
                    })
                )
            }
        );
    }

    const updateInf = (newInf) => {
        setActive({...active, inflation: newInf})
    }

    return (
        <>
        <div className='page-body p-3' id="trend-page">
            <Container fluid>
                <Row style={{height:"100%"}}>
                    <Col className="side-bar" style={{height:"100%"}}>
                        <TrendSelector items={RAWDATA.datamap.category} active={active.item} unit={active.unit} update={updateItem} />
                    </Col>
                    <Col style={{overflow:"hidden"}}>
                        <CitySelector state={active} update={toggleCity} updateInf={updateInf} />
                        <LineChart data={getData(RAWDATA, active)} cities={active.city} />
                    </Col>
                </Row>
            </Container>  
        </div>
        </>
        
    );
  }

export {Trend, defTrendState}