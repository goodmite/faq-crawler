const {resolve} = require("path");
// const puppeteer = require("puppeteer");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({blockTrackers: true}));
puppeteer.use(UserPreferencesPlugin({
    userPrefs: {
        'profile.managed_default_content_settings.images': 2, // Disable images for faster loading
    }
}));

async function scrape(url, eventCb) {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    eventCb({name: "process_started", data: null});
    const page = await browser.newPage();

    // Set viewport and User-Agent to mimic a real browser
    await page.setViewport({width: 1920, height: 1080});
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
        'Referer': 'https://www.google.com/',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
    });


    await page.goto(url);
    eventCb({name: "webpage_opened", data: null});

    await new Promise(resolve => {
        setTimeout(_ => {
            resolve();
        }, 1000)
    })

    let [questionsFound, answerObj] = await page.evaluate(async () => {
        // START

        function findPath(root, targetNode) {
            let path = [];
            let current = targetNode;

            while (current !== root) {
                path.push(current);
                current = current.parentNode;
            }
            path.push(root);
            path.reverse();

            return path;
        }

// Function to find the lowest common ancestor of two nodes
        function findLowestCommonAncestor(root, node1, node2) {
            // Get paths from root to the nodes
            let path1 = findPath(root, node1);
            let path2 = findPath(root, node2);

            // Initialize the LCA to the root
            let lca = root;

            // Iterate through the paths to find the deepest common node
            for (let i = 0; i < Math.min(path1.length, path2.length); i++) {
                if (path1[i] === path2[i]) {
                    lca = path1[i];
                } else {
                    break;
                }
            }

            return lca;
        }

        function findTextNodesWithQuestionMark(node, result = []) {

            if (node.nodeType === Node.TEXT_NODE) {
                const parentNodeName = node.parentNode.nodeName.toLowerCase();
                const noTAllowedParent = ['mask', 'svg', 'script', 'noscript', 'style']
                //   debugger;
                // console.log(parentNodeName);
                if (!noTAllowedParent.find(e => e === parentNodeName)) {
                    if (node.textContent.includes('?')) {
                        result.push(node);
                    }
                }
            } else if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    findTextNodesWithQuestionMark(node.childNodes[i], result);
                }
            }
            return result;
        }

        function removeNodesByNames(mainElement, nodeNames) {
            nodeNames.forEach(node => {
                mainElement.querySelectorAll(node.toLowerCase()).forEach(e => e.parentElement.removeChild(e))
            })

            // // Check if the node exists and is an element node
            // if (node && node.nodeType === Node.ELEMENT_NODE) {
            //     // Check if the node's name matches any of the given node names
            //     de
            //     if (nodeNames.find(e => e.toLowerCase() === node.nodeName.toLowerCase())) {
            //         // Remove the node
            //         node.parentNode.removeChild(node);
            //     } else {
            //         // Recursively remove nodes from children
            //         const children = node.childNodes;
            //         for (let i = 0; i < children.length; i++) {
            //             removeNodesByNames(children[i], nodeNames);
            //         }
            //     }
            // }
        }

        function removeInlineStyles(node) {
            // Check if the node exists and is an element node
            if (node && node.nodeType === Node.ELEMENT_NODE) {
                // Remove inline styles from the current node
                node.removeAttribute('style');
                node.removeAttribute('class');

                // Recursively remove inline styles from children nodes
                const children = node.childNodes;
                for (let i = 0; i < children.length; i++) {
                    removeInlineStyles(children[i]);
                }
            }
        }


        function getHTMLBetweenNodes(node1, node2) {
            if (!node1 || !node2) {
                throw new Error("One or both nodes are not provided.");
            }

            // Create a new range
            let range = document.createRange();

            // Set the range start to the end of node1
            range.setStartAfter(node1);

            // Set the range end to the start of node2
            range.setEndBefore(node2);

            // Extract the contents of the range
            let fragment = range.cloneContents();

            // Create a temporary container to hold the HTML
            let tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);

            // Get the innerHTML of the temporary container and trim any leading/trailing whitespace
            let htmlBetween = tempDiv;
            removeNodesByNames(htmlBetween, ["BUTTON", "IMG", "iframe"]);
            removeInlineStyles(htmlBetween)
            return htmlBetween;
        }

        function removeNewlineAndTab(inputString) {
            // Use a regular expression to replace newline and tab characters with an empty string
            return inputString.replace(/[\n\t]/g, '');
        }

        function removeMultipleSpaces(str = "") {
            // Use a regular expression to replace multiple spaces with a single space
            return str.replace(/\s{2,}/g, ' ');
        }

        function removeTagsExceptWhiteListed(htmlString = "", whitelist = []) {
            htmlString = removeNewlineAndTab(htmlString);
            htmlString = htmlString.trim();
            // Construct a regular expression pattern to match all tags except those in the whitelist
            const whitelistPattern = whitelist.length > 0 ? `(?!\/?(?:${whitelist.join('|')})(?=>|\s.*>))` : '';

            // Use the pattern to remove all HTML tags except those in the whitelist
            return htmlString.replace(new RegExp(`<${whitelistPattern}\/?.*?>`, 'g'), '').trim();
        }

        function findNextSibling(node) {
            if (!node) return null; // If the node is null, return null immediately

            // Traverse up the DOM tree to find the next sibling
            while (node) {
                // Check for the next sibling of the current node
                let nextSibling = node.nextSibling;

                // If a next sibling is found, return it
                if (nextSibling) return nextSibling;

                // Move up to the parent node and repeat
                node = node.parentNode;
            }

            // If no next sibling is found up to the root, return null
            return null;
        }


        // select all text nodes with question mark with parents div, span, a, strong,

        const textNodes = findTextNodesWithQuestionMark(document.querySelector('main') || document.body);
        const res = [];
        const L = textNodes.length;
        for (let i = 0; i < textNodes.length - 1; ++i) {
            res.push(getHTMLBetweenNodes(textNodes[i].parentNode, textNodes[i + 1].parentNode));
        }
        let node1 = textNodes[L - 2].parentNode //document.getElementById('node1'); // Replace with your node
        let node2 = textNodes[L - 1].parentNode // document.getElementById('node2'); // Replace with your node
        let root = document.documentElement; // or any common root ancestor
        debugger;
        const lca = findLowestCommonAncestor(root, node1, node2);
        if(lca) {
            res.push(getHTMLBetweenNodes(node2, findNextSibling(lca) || document.body));
        }
        const final = textNodes.map((e, i) => {
            return {
                question: e.parentNode.textContent?.trim(),
                // category: url,
                answer: removeMultipleSpaces(res[i]?.innerHTML),//removeTagsExceptWhiteListed(res[i]?.innerHTML, ['a', 'li', 'strong', 'i', 'em']),
                plain: removeMultipleSpaces(removeTagsExceptWhiteListed(res[i]?.textContent, []))
            }
        })

        // END
        return Promise.resolve(['obj', final]);
    });


    eventCb({name: "got_all", data: {questionsFound, answerObj}});
    // browser.close();
    return {questionsFound, answerObj};
}


module.exports = {scrape};
