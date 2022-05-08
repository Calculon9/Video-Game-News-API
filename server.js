const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const PORT = process.env.PORT || 5000;

const app = express();

const resources = [
    {
        name: "Gamespot",
        address: "https://www.gamespot.com/"
    },
    {
        name: "IGN",
        address: "https://www.ign.com/au"
    },
    {
        name: "RockPaperShotgun",
        address: "https://www.rockpapershotgun.com/"
    },
    {
        name: "Destructoid",
        address: "https://www.destructoid.com/"
    },
    {
        name: "GameInformer",
        address: "https://www.gameinformer.com/"
    }
]

function GetArticles(searchTerm) {

    let allArticles = []

    return Promise.all(resources.flatMap(resource =>

        axios.get(resource.address).then(result => {

            let articles = [];

            const html = result.data;

            //Use Cheerio: load the html document and create Cheerio selector/API
            const $ = cheerio.load(html);


            //Filter html to retrieve appropriate links 
            $('a', html).each((i, el) => {

                const regex = new RegExp(searchTerm, 'gi')

                const title = $(el).text();

                //Only push articles with title that contain the search term
                if (regex.test(title)) {
                    let url = $(el).attr('href');

                    //Append url domain if retrieved url is a relative path
                    if (!/^https|http/i.test(url)) {
                        url = resources[0].address + url;
                    }

                    //Push result if not empty
                    if (title != null || url != null) {
                        articles.push(
                            {
                                title: title,
                                url: url,
                                source: resource.name
                            }
                        );
                    }
                }

            })

            if (articles.length > 1) {
                return articles;
            }

        }
        )))

}


app.get('/news/:searchTerm', async (req, res) => {
    let searchTerm = req.params.searchTerm;
    let articles = await (await GetArticles(searchTerm)).filter(el => el != null);

    if (articles.length > 0) {
        res.json(articles);
    }
    else {
        res.json(`No results found for: ${searchTerm}`);
    }
})

app.get('/', (req, res) => {
    const html = `
    <h4>Welcome to Video Game News!</h4><br>

    <p>This API searches multiple video game news outlets and returns articles in JSON format based on a provided search term.</p>
    <p>To use this API and search for video game articles, enter the search term in the address bar so that it matches the format below:</p>
    <p style="margin-left:30px"><strong>https://abc123.com/news/<span style="color: green">searchTerm</span></strong></p>
    <p><strong>Note</strong>: "abc123.com" is simply a placeholder for the domain + top-level domain (i.e., name of website).</p>
    <p>So, add "/news/searchTerm" to the url where "searchTerm" is what you want to search for.</p><br>
    <p><strong>Example: </strong><em>https://abc123.com/news/EldenRing</em> will search for articles related to "Elden Ring".</p><br>
    <p><strong>Recommendation: </strong>To view search results clearly, it is recommended you download the JSON Viewer Chrome extension:</p>
    <a href="https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh" target="blank"><strong>JSON Viewer Chrome Extension</strong></a>
    `
    //res.send("Welcome to Video Game News!\n\nThis API searches multiple video game news outlets and returns articles based on a provided search term\n\n");
    //res.send("<h4>To use this API and search for video game articles, enter the search term in the address bar so that it matches the format below:\n\nhttps://abc123/news/searchTerm<h4>");
    res.send(html);
    //res.json("This API searches multiple video game news outlets and returns articles based on a provided search term");
})


app.listen(PORT, () => console.log("server running on PORT: " + PORT));


//Works fine
// async function GetArticles(searchTerm) {

//     const articles = [];
//     console.log(2)
//     const result = await axios.get(resources[0].address);
//     console.log(3)
//     //Promise result data
//     const html = result.data;

//     //Use Cheerio: load the html document into memory and create Cheerio selector
//     const $ = cheerio.load(html);

//     $(`a:contains(${searchTerm})`, html).each((i, el) => {
//         //.text() gets the innerText/Html in the element
//         const title = $(el).text();

//         //Get the url from the href attribute
//         let url = $(el).attr('href');

//         //Append url domain if retrieved url is a relative path
//         if (!/^https|http/i.test(url)) {
//             url = resources[0].address + url;
//         }

//         //Add result to articles array
//         articles.push(
//             {
//                 title: title,
//                 url: url,
//                 source: resources[0].name
//             }
//         );
//     })

//     return articles;
// }