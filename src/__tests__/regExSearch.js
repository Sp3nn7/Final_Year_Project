import RAWDATA from '../data/current_data.json';
import '@testing-library/jest-dom';

/**
 * Mock functionality taken from SearchBar,js
 * Tests:
 *  - expected items show in results
 *  - regular expression is acting as expected
 */
test("RegExp Search (white box)", () => {
    const items = ["Coles Sunflower Oil 4L",    //predefined data set
        "Coles Sunflower Oil 750mL",
        "Alfa One Rice Bran Oil 750mL",
        "180 Degrees Hazelnut Oat Crackers 150g",
        "Zooper Dooper Cola Spider Flavoured Milk 600mL",
        "Zooper Dooper Fairy Floss Flavoured Milk 600mL",
        "180 Degrees Cheese Bites 150g",
        "5 Gum Sweet Mint Sugar Free Chewing Gum 3 Pack 96g",
        "Que Cola Cola Multipack Cans 12x375mL",
        "Twinings Pure Green Tea Bags 100 Pack 150g"]
    const testInputs = [    // test inputs
        "Coles Sunflower Oil",
        "Coles Sunflower Oil 4L",
        "Alfa One Rice Bran Oil 750mL",
        "alfa one rice bran oil 750ml",
        "Alfa ONE Rice Bran Oil 750mL",
        "ALFA ONE RICE BRAN OIL 750ML",
        "Alfa One Oil 750mL Rice Bran",
        "180 Degrees",
        "Zooper dooper",
        "( ) + ="
    ]
    const expOutputs = [    // test outputs
        ["Coles Sunflower Oil 4L", "Coles Sunflower Oil 750mL"],
        ["Coles Sunflower Oil 4L"],
        ["Alfa One Rice Bran Oil 750mL"],
        ["Alfa One Rice Bran Oil 750mL"],
        ["Alfa One Rice Bran Oil 750mL"],
        ["Alfa One Rice Bran Oil 750mL"],
        ["Alfa One Rice Bran Oil 750mL"],
        ["180 Degrees Cheese Bites 150g", "180 Degrees Hazelnut Oat Crackers 150g"],
        ["Zooper Dooper Cola Spider Flavoured Milk 600mL", "Zooper Dooper Fairy Floss Flavoured Milk 600mL"],
        []
    ]

    const maxItems = 100;
    const escChars = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (let i = 0; i < testInputs.length; i++) {
        // pipeline is split into 4 transformations (t1-4) in order to analyse inner workings of function if required.
        const t1 = testInputs[i].split(" ") //separate into words
        // expect(t1).toBe() array of words
        const t2 = t1.map(word => escChars(word)) // add escape character \ before problematic characters
        // expect(t2).toBe() // include escaped characters
        const t3 = items.filter((item) => // filter all items
                        t2.reduce((acc, curr) => // accept items where every word in search input is contained within
                            acc && item.match(RegExp(curr, "i")), 
                            true
                        )
                    );
        // expect(t3).toBe() // filtered list without slice
        const t4 = t3.slice(0, maxItems);
        expect(t4.sort()).toStrictEqual(expOutputs[i].sort())
        //expect(t4.length).toBeLessThanOrEqual(100) // reduced size list
        //expect(t4.length).toBeLessThanOrEqual(t3.length) // for shorter inputs
    }
})

// Black box testing
