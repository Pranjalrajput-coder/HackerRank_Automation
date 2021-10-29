// ====================AUTOMATATION PROJECT FOR ADDING THE MODERATORS IN HACKERRANK=====================

//      Requiring the Libraries which we will use
let minimisit = require("minimist");
let fs = require("fs");
let puppeeter = require("puppeteer");

let args = minimisit(process.argv);

//     Read The JSON File to read USERNAME, PASSWORD, MODERATOR NAME
let configJSON = fs.readFileSync(args.config, "utf-8");
let config = JSON.parse(configJSON);


async function run() { // here we declare the Run function
    let browser = await puppeeter.launch({ // The Chromium browser will launch 
        headless: false, // for full screen
        args: [
            '--start-maximized' // maxmized the screen
        ],
        defaultViewport: null
    });

    let intialPage = await browser.pages(); // New Page or tab will open
    let page = intialPage[0];
    await page.goto(args.url); // go to the url which gives at the time in console

    // open the first page or choose the sign up option
    await page.waitForSelector("a[href='https://www.hackerrank.com/auth/signup']");
    await page.click("a[href='https://www.hackerrank.com/auth/signup']");

    // open the credentials page 
    await page.waitForSelector("a[href='/auth/login']");
    await page.click("a[href='/auth/login']");

    // Type the username in the UserName Section
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", config.userid, {
        delay: 100
    });

    // Type the password in the Passowrd section
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", config.password, {
        delay: 100
    });

    await page.waitFor(500); // wait for 3 sec after type the credentials in particular section

    // Tap on login button
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    // Click on the "COMPETE" link on the page
    await page.waitForSelector("a[href='/contests']");
    await page.click("a[href='/contests']");

    //  Click on the "Manage Contest" link on the page
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    await page.waitFor(2000); // wait for 2 sec after coming inside the manage contest 



    await page.waitForSelector("a[data-attr1='Last']");
    let num_of_pages = await page.$eval("a[data-attr1='Last']", function (a_tags) { // Calculate the pages of contests 
        // send it to the atags function
        let total_pages = parseInt(a_tags.getAttribute('data-page')); // take as integer of total pages of contests
        return total_pages; // return the Integer value to 'num_of_pages'
    });

    for (let i = 1; i < num_of_pages; i++) { // make a loop for every contest on every page

        await handle_all_content_on_a_page(page, browser); // "Important function" call the function with parameter
        // page and browsser

        if (i != num_of_pages) { // if the 'i' is not at last page then we click the "next button" on page
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }
    }

    //  ----This is for logout----

    await page.waitForSelector("div#profile-menu");
    await page.click("div#profile-menu");
    page.waitFor(3000);

    await page.waitForSelector("a.logout-button");
    await page.click("a.logout-button");
    page.waitFor(3000);

}

// Now we have to call the run function for RUN OUR PROGRAM,
// If there is something problen in our then we print then we print the error in our terminal
run().catch(function (err) {
    console.log(err);
});


//  Here we Decalre "handle_all_content_on_a_page"
async function handle_all_content_on_a_page(page, browser) {

    await page.waitForSelector("a.backbone.block-center");

    // here we will use $$eval function which is similar to querySelectorAll, which helps to select all the attribute which are similar
    let urls = await page.$$eval("a.backbone.block-center", function (atags) { // all the contest will select and take the input from atags

        let allurls = []; // create an array where all the urls will store

        for (let i = 0; i < atags.length; i++) { // start a loop for all the contest
            let rest_of_url = atags[i].getAttribute("href"); // take a "href" attribute of all the contest one by one
            allurls.push(rest_of_url); // and push in the allurls arrays which we declared above
        }

        return allurls; // return all the url to urls 
    });

    for (let i = 0; i < urls.length; i++) { // start a loop for all the urls one by one
        let open_new_tab = await browser.newPage(); // open a new tab
        await insertModerator(open_new_tab, config.moderators, args.url + urls[i]); // call the function for add the moderators
        await open_new_tab.close(); // close the tab
        await page.waitFor(3000); // wait 3 second after close the tab 
    }
}

// Here we Declate the "insertModerator" for adding the moderators inside the every contest
async function insertModerator(ctab, moderator_name, complete_url) {

    await ctab.bringToFront(); // Just switch the tab automatically to the new tab
    await ctab.goto(complete_url); // https://www.hackerrank.com/'rest of the url'  which comes from complete_url parameter 
    await ctab.waitFor(2000); // wait 2 second after open the new tab

    // Click on the moderator section link
    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");

    await ctab.waitFor(2000);

    for (let i = 0; i < config.moderators.length; i++) { // start a loop for all the moderators which comes from congif.json folder
        let moderator = config.moderators[i]; // intialize the one moderator from config.json and after complete it will destroy
        // and then put next moderator name in it and so on

        // Type the moderator name in the Add Moderator Section
        await ctab.waitForSelector("input#moderator");
        await ctab.type("input#moderator", moderator, {
            delay: 20
        });

        // then press/enter the Add button and wait for 2 second
        await ctab.keyboard.press("Enter");
        await ctab.waitFor(2000);
    }
}
// node hackerrank.js --url="https://www.hackerrank.com" --config=config.json
//                          ^
//               for firing the program

// NOTE : First you have to insert your USERNAME , PASSWORD & MODERATORS NAME in config.json file then RUN the Program
//  ADD MODERATORS according to user requirement