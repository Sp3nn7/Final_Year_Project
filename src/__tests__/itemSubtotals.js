import '@testing-library/jest-dom';

/**
 * Mock functionality taken from PriceComp.js
 * Tests:
 *  - summation of item prices with quantities
 *  - combination of regional prices
 *  - handling of null prices 
 */
test("Item subtotals (white box)", () => {
    const statePrices = [  
        { quantity: 1, price: [9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8] }, // A2 Dairy Full Cream Milk 3L, SA (state 1)
        { quantity: 1, price: [11.37, 10.58, 10.58, 10.58] }, // A2 Dairy Full Cream Milk 3L, NT (state 2)
        { quantity: 1, price: [9.8, null, 9.8, 9.8, 9.8, 10.68, 9.8, null, 9.8, 9.8, 9.8, null] } // A2 Dairy Full Cream Milk 3L, WA (state 3)
    ]
    const expectedStatePrices = ["$9.80", "$10.78", "$9.90"] // non-null averages
    const regionPrices = [
        [{ quantity: 1, price: 3.00 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL, Belconnen (region 1)
        [{ quantity: 1, price: null }], // Zooper Dooper Cola Spider Flavoured Milk 600mL, Canberra Civic (region 2)
        [{ quantity: 1, price: 3.00 }, { quantity: 1, price: 5.50 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zanetti Grana Padano Grated PDO 100g, Belconnen (Region 1)
        [{ quantity: 1, price: null }, { quantity: 1, price: null }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zanetti Grana Padano Grated PDO 100g, Canberra Civic (Region 2)
        [{ quantity: 1, price: null }, { quantity: 1, price: 5.50 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zanetti Grana Padano Grated PDO 100g, Tuggeranong (Region 3)
        [{ quantity: 1, price: 3.00 }, { quantity: 1, price: 5.50 }, { quantity: 1, price: 2.25 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zanetti Grana Padano Grated PDO 100g + Zappos Strawberry & Grape 4 Pack 104g, Belconnen (region 1)
        [{ quantity: 1, price: null }, { quantity: 1, price: 5.50 }, { quantity: 1, price: 2.25 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zanetti Grana Padano Grated PDO 100g + Zappos Strawberry & Grape 4 Pack 104g, Tuggeranong (region 3)
        [{ quantity: 2, price: 3.00 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL, Belconnen (region 1)
        [{ quantity: 2, price: null }], // Zooper Dooper Cola Spider Flavoured Milk 600mL, Canberra Civic (region 2)
        [{ quantity: 2, price: 3.00 }, { quantity: 2, price: 2.25 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zappos Strawberry & Grape 4 Pack 104g, Belconnen (region 1)
        [{ quantity: 2, price: null }, { quantity: 2, price: 2.25 }], // Zooper Dooper Cola Spider Flavoured Milk 600mL + Zappos Strawberry & Grape 4 Pack 104g, Tuggeranong (region 3)
    ]
    const expectedRegionPrices = ["$3.00", "n/a", "$8.50", "n/a", "$5.50", "$10.75", "$7.75", "$6.00", "n/a", "$10.50", "$4.50"] // subtotals

    const sumPrices = itemlist => itemlist.reduce((prev, item) => prev + (item.price ? item.price : 0) * item.quantity, 0);
    const dollarfy = x => x ? "$" + x.toFixed(2) : "n/a"
    // test state subtotalling
    const totalPrices = [];
    for (let i = 0; i < statePrices.length; i++) {
        // Average over all regions. Maintain null value if all values are null
        // (taken from PriceComp.js Lines: 233-238)
        const itemData = statePrices[i].price.filter(item => item!==null)
        const regionsSum = itemData.reduce((prev, curr) => prev === null ? curr : curr+prev, null)
        const statePrice = regionsSum === null ? null: (regionsSum/itemData.length);
        const priceText = statePrice === null ? "n/a" : dollarfy(statePrice*statePrices[i].quantity);
        expect(priceText).toBe(expectedStatePrices[i]);
        totalPrices.push({...statePrices[i], price:statePrice});
    }

    // test region subtotalling
    for (let i = 0; i < regionPrices.length; i++) {
        //for (let i = 0; i < regionPrices[i].length; i++) {
        //    const priceText = regionPrices[i].price === null ? "n/a" : dollarfy(regionPrices[i].price * regionPrices[i].quantity);
        //}
        expect(dollarfy(sumPrices(regionPrices[i]))).toBe(expectedRegionPrices[i]);
    }

})

 