import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation } from 'react-router-dom';

/**
 * Renders nav-bar, handles URL path definitions.
 * @param {*} setHelp - Sets help state variable contained in App.js
 */
function Navigation({setHelp}) {
  const location = useLocation();
  const keyMap = {'/price-comp':0, '/trend':1, '/about':2, '/':2}
  return (
    <Navbar>
      <Nav defaultActiveKey={keyMap[location.pathname]}>
        <Nav.Item >
          <Nav.Link eventKey={0} as={Link} to="/price-comp">
            <div>Price Comparison </div>
            {
              location.pathname==="/price-comp" ? 
              <div className="help-button" onClick={() => setHelp("price-comp")}>?</div> :
              ""
            }
          </Nav.Link>
            
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={1} as={Link} to="/trend">
            Trend
            {
              location.pathname==="/trend" ? 
              <div className="help-button" onClick={() => setHelp("trend")}>?</div> :
              ""
            }  
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="about-tab" >
          <Nav.Link eventKey={2} as={Link} to="/about">About</Nav.Link>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
}
export default Navigation;