import React, {useState, useEffect} from 'react'

/**
 * React component for search bar contained on Price Comparison page
 * @param {object} props Component properties
 * @param {[{}]} props.data Array of item objects
 * @param {()=>null} props.onAddItem Handles the addition of item to comparison table 
 * @param {()=>null} props.onDeleteItem Handles the removal of item from comparison table 
 * @param {()=>null} props.onAddQuantity Handles the increment of item from comparison table 
 * @param {[{}]} props.shoppingList Current state of comparison table 
 * @returns {JSX.Element}
 */
const SearchBar = ({data, onAddItem, onDeleteItem, onAddQuantity, shoppingList}) => {
  // Only rendering 100 items for faster load times
  const maxItems = 100; // number of items to display in search

  // intialise state variables
  const [searchInput, setSearchInput] = useState("");
  const [items, setItems] = useState(data.map(item => ({...item, active: false})));
  
  useEffect(() => { // Runs on search input change 
    // adds event listener to hide search bar when 'clicked' anywhere outside search bar
    function clickOut(e) {
      if (!document.getElementById('search-container').contains(e.target)){
        setSearchInput(""); //empty search bar
      } 
    }
    // clicks outside of search bar
    if (searchInput !== "") {window.addEventListener("click", clickOut)}

    // cleanup event listener
    return () => window.removeEventListener("click", clickOut);
  }, [searchInput]);

  /**
   * Type into search bar event handler 
   * @param {Event} e (event)
   */
  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  /**
   * Add Item event handler 
   * @param {Event} _ (event)
   * @param {object} target item to add to shopping list
   */
  const handleAddButtonClick = (_, target) => {
      setItems(items.map((item, i) => {
          if (target.name === item.name) {
              const itemInList = shoppingList.find(currentItem => currentItem.name === target.name);
              if (itemInList) {
                  onAddQuantity(item.name);
                  return { ...item, active: true };  // Mark the item as added
              } else {
                  onAddItem(item.name, 1, i);
                  return { ...item, active: true };
              }
          }
          return item;
      }));
  };

  /**
   * Delete Item event handler 
   * @param {Event} _ (event)
   * @param {object} target item to remove from shopping list
   */
  const handleDeleteButtonClick = (_, target) => {
      onDeleteItem(target.name);
      setItems(items.map(item => {
          if (item.name === target.name) {
              return { ...item, active: false };
          }
          return item;
      }));
  };

  /**
   * Helper function for RegExp, handles key characters such as `*` and `$`
   * @param {string} s 
   * @returns {string} `s` but with `\` added before problematic characters
   */
  const escChars = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

return <div>
<input
   type="search"
   placeholder="Search here"
   className="price-comp-search"
   onChange={handleChange}
   value={searchInput}
   id = "search-bar"/>
   
  {searchInput === "" ? <div className="search-container" id="search-container" style={{display:"none"}}/> :
    /* render search results */
    <div className="search-container" id="search-container">
      <table>
        <tbody>
          <tr>
            <th></th>
            <th></th>
          </tr>
        {searchInput === "" ? ""
        : items /* Show items that contains every word in the search input */
          .filter((item) => searchInput.split(" ")
            .reduce((acc, curr) => acc && item.name.match(RegExp(escChars(curr), "i")), true))
          .slice(0,maxItems) /* Limit amount of items for performance */
          .map((item) => ( /* map items to buttons */
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td>
                            { item.active && shoppingList.find(target => item.name === target.name) ?
                                /* "delete" button if in list */
                                <button
                                    className="base-button delete-button"
                                    onClick={(e) => handleDeleteButtonClick(e, item)}>
                                    -
                                </button>
                                : /* "add" button if in list */
                                <button
                                    className="base-button add-button"
                                    onClick={(e) => handleAddButtonClick(e, item)}>
                                    +
                                </button>
                            }
                        </td>
                      </tr>
                    )
        )}
        </tbody>
        </table>
      </div>
  }
</div>
};

export default SearchBar;